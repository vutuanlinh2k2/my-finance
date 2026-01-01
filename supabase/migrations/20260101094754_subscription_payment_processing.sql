-- Subscription Payment Processing
-- This migration adds infrastructure for automatic expense creation from subscriptions
-- Exchange rate is fetched fresh by the edge function before processing

-- ============================================================================
-- 1. Exchange Rates Table
-- ============================================================================
-- Stores exchange rates updated by the edge function before payment processing

CREATE TABLE public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC(20, 6) NOT NULL CHECK (rate > 0),
  source TEXT NOT NULL DEFAULT 'api',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT exchange_rates_unique_pair UNIQUE (from_currency, to_currency)
);

-- Insert default USD to VND rate (will be updated by edge function)
INSERT INTO public.exchange_rates (from_currency, to_currency, rate, source)
VALUES ('USD', 'VND', 25000, 'default');

-- RLS: Public read, service role write (edge function uses service role)
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read exchange rates"
  ON public.exchange_rates FOR SELECT
  USING (true);

-- No INSERT/UPDATE/DELETE policies for regular users
-- Edge function uses service_role key which bypasses RLS

-- ============================================================================
-- 2. Function to Update Exchange Rate (RPC for edge function)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_exchange_rate(
  p_from_currency TEXT,
  p_to_currency TEXT,
  p_rate NUMERIC,
  p_source TEXT DEFAULT 'api'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.exchange_rates (from_currency, to_currency, rate, source, updated_at)
  VALUES (p_from_currency, p_to_currency, p_rate, p_source, now())
  ON CONFLICT (from_currency, to_currency)
  DO UPDATE SET
    rate = EXCLUDED.rate,
    source = EXCLUDED.source,
    updated_at = now();
END;
$$;

-- ============================================================================
-- 3. Helper Function: Get Last Day of Month
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_last_day_of_month(p_year INT, p_month INT)
RETURNS INT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
BEGIN
  -- Get the last day by going to the first of next month and subtracting 1 day
  RETURN EXTRACT(DAY FROM (make_date(p_year, p_month, 1) + INTERVAL '1 month' - INTERVAL '1 day'));
END;
$$;

-- ============================================================================
-- 4. Helper Function: Check if Subscription is Due Today
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_subscription_due_today(
  p_type TEXT,
  p_day_of_month INT,
  p_month_of_year INT,
  p_last_payment_date DATE,
  p_created_at TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_current_day INT := EXTRACT(DAY FROM v_today);
  v_current_month INT := EXTRACT(MONTH FROM v_today);
  v_current_year INT := EXTRACT(YEAR FROM v_today);
  v_last_day_of_month INT;
  v_effective_day INT;
BEGIN
  -- Get the last day of the current month
  v_last_day_of_month := public.get_last_day_of_month(v_current_year, v_current_month);

  -- Clamp the subscription day to the last day of the month
  -- (e.g., day 31 in February becomes 28 or 29)
  v_effective_day := LEAST(p_day_of_month, v_last_day_of_month);

  -- Check if today is the due day
  IF v_current_day != v_effective_day THEN
    RETURN FALSE;
  END IF;

  -- For yearly subscriptions, also check the month
  IF p_type = 'yearly' AND v_current_month != p_month_of_year THEN
    RETURN FALSE;
  END IF;

  -- Check if already paid this period
  IF p_last_payment_date IS NOT NULL THEN
    IF p_type = 'monthly' THEN
      -- Already paid this month
      IF EXTRACT(YEAR FROM p_last_payment_date) = v_current_year
         AND EXTRACT(MONTH FROM p_last_payment_date) = v_current_month THEN
        RETURN FALSE;
      END IF;
    ELSE
      -- Yearly: already paid this year
      IF EXTRACT(YEAR FROM p_last_payment_date) = v_current_year THEN
        RETURN FALSE;
      END IF;
    END IF;
  ELSE
    -- No last payment date - check if subscription was created today
    -- Don't create expense for a subscription created today (user should add manually if needed)
    IF p_created_at::DATE = v_today THEN
      RETURN FALSE;
    END IF;
  END IF;

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- 5. Main Function: Process Subscription Payments
-- ============================================================================
-- This function finds all due subscriptions and creates expense transactions
-- Called by the edge function after fetching fresh exchange rate

CREATE OR REPLACE FUNCTION public.process_subscription_payments()
RETURNS TABLE (
  subscription_id UUID,
  transaction_id UUID,
  title TEXT,
  amount_vnd BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_subscription RECORD;
  v_exchange_rate NUMERIC;
  v_amount_vnd BIGINT;
  v_new_transaction_id UUID;
BEGIN
  -- Get current USD to VND exchange rate (updated by edge function before calling this)
  SELECT rate INTO v_exchange_rate
  FROM public.exchange_rates
  WHERE from_currency = 'USD' AND to_currency = 'VND';

  -- Fallback to default if not found
  IF v_exchange_rate IS NULL THEN
    v_exchange_rate := 25000;
  END IF;

  -- Process each due subscription
  FOR v_subscription IN
    SELECT s.*
    FROM public.subscriptions s
    WHERE public.is_subscription_due_today(
      s.type,
      s.day_of_month,
      s.month_of_year,
      s.last_payment_date,
      s.created_at
    )
  LOOP
    -- Calculate amount in VND
    IF v_subscription.currency = 'VND' THEN
      v_amount_vnd := v_subscription.amount;
    ELSE
      -- USD is stored as cents, convert to VND
      v_amount_vnd := ROUND((v_subscription.amount / 100.0) * v_exchange_rate);
    END IF;

    -- Create the expense transaction
    INSERT INTO public.transactions (
      user_id,
      title,
      amount,
      date,
      type,
      tag_id
    ) VALUES (
      v_subscription.user_id,
      v_subscription.title,
      v_amount_vnd,
      CURRENT_DATE,
      'expense',
      v_subscription.tag_id
    )
    RETURNING id INTO v_new_transaction_id;

    -- Update last_payment_date on the subscription
    UPDATE public.subscriptions
    SET last_payment_date = CURRENT_DATE,
        updated_at = now()
    WHERE id = v_subscription.id;

    -- Return the processed subscription info
    subscription_id := v_subscription.id;
    transaction_id := v_new_transaction_id;
    title := v_subscription.title;
    amount_vnd := v_amount_vnd;
    RETURN NEXT;
  END LOOP;
END;
$$;

-- ============================================================================
-- 6. Index for Faster Due Subscription Lookup
-- ============================================================================

CREATE INDEX idx_subscriptions_payment_lookup
  ON public.subscriptions(type, day_of_month, month_of_year, last_payment_date);

-- ============================================================================
-- 7. Index on exchange_rates for quick lookup
-- ============================================================================

CREATE INDEX idx_exchange_rates_currency_pair
  ON public.exchange_rates(from_currency, to_currency);
