-- Migration: Create net_worth_snapshots table
-- Purpose: Store daily snapshots of user's net worth for historical tracking

CREATE TABLE public.net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  bank_balance NUMERIC NOT NULL DEFAULT 0,
  crypto_value_vnd NUMERIC NOT NULL DEFAULT 0,
  total_net_worth NUMERIC NOT NULL DEFAULT 0,
  exchange_rate NUMERIC NOT NULL DEFAULT 25500,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

-- Enable Row Level Security
ALTER TABLE public.net_worth_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own snapshots
CREATE POLICY "net_worth_snapshots_select_own"
  ON public.net_worth_snapshots FOR SELECT
  USING (user_id = (SELECT auth.uid()));

-- RLS Policy: Insert restriction
-- Note: Primary inserts come from the snapshot-net-worth edge function using
-- service role key (bypasses RLS). This policy allows authenticated users to
-- insert their own snapshots if needed (e.g., manual corrections, backfills).
CREATE POLICY "net_worth_snapshots_insert_own"
  ON public.net_worth_snapshots FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Index for efficient time range queries
CREATE INDEX idx_net_worth_snapshots_user_date
  ON public.net_worth_snapshots(user_id, snapshot_date DESC);
