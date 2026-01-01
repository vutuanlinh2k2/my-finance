-- Create subscriptions table for storing recurring payment subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE SET NULL,
  currency TEXT NOT NULL CHECK (currency IN ('VND', 'USD')),
  amount BIGINT NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('monthly', 'yearly')),
  day_of_month INTEGER NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
  month_of_year INTEGER CHECK (month_of_year >= 1 AND month_of_year <= 12),
  management_url TEXT,
  last_payment_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Yearly subscriptions must have month_of_year set
  CONSTRAINT subscriptions_yearly_month_required
    CHECK (type = 'monthly' OR (type = 'yearly' AND month_of_year IS NOT NULL))
);

-- Indexes for common query patterns
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_tag ON public.subscriptions(tag_id);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own subscriptions
-- Using (SELECT auth.uid()) for better performance per Security Advisor
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON public.subscriptions FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON public.subscriptions FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Trigger for auto-updating updated_at (reuses existing function)
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
