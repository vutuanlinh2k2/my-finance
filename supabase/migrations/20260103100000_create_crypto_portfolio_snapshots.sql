-- Crypto Portfolio Snapshots
-- Stores daily snapshots of portfolio value and allocation for historical charts

CREATE TABLE public.crypto_portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_value_usd NUMERIC(20, 2) NOT NULL,
  allocations JSONB NOT NULL, -- { "bitcoin": { "percentage": 0.45, "value_usd": 1000 }, ... }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

-- Enable Row Level Security
ALTER TABLE public.crypto_portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own snapshots
-- Using (SELECT auth.uid()) for better performance per Security Advisor
CREATE POLICY "crypto_portfolio_snapshots_select_own"
  ON public.crypto_portfolio_snapshots FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "crypto_portfolio_snapshots_insert_own"
  ON public.crypto_portfolio_snapshots FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- No update/delete policies - snapshots are immutable historical records

-- Indexes
CREATE INDEX idx_crypto_portfolio_snapshots_user_date
  ON public.crypto_portfolio_snapshots(user_id, snapshot_date DESC);
