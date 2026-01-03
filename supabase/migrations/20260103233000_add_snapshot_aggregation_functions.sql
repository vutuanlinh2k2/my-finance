-- Migration: Add optimized aggregation functions for net worth snapshot edge function
-- Purpose: Replace inefficient JavaScript aggregation with database-level queries

-- Function: Get bank balances for ALL users (used by cron job)
-- Returns aggregated income - expenses per user in a single query
CREATE OR REPLACE FUNCTION public.get_all_users_bank_balances()
RETURNS TABLE (
  user_id uuid,
  bank_balance numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    t.user_id,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0) as bank_balance
  FROM public.transactions t
  GROUP BY t.user_id
$$;

-- Grant execute permission to service role (for edge function)
GRANT EXECUTE ON FUNCTION public.get_all_users_bank_balances() TO service_role;

-- Function: Get latest crypto snapshot for each user using DISTINCT ON
-- Much more efficient than loading all snapshots and deduplicating in JS
CREATE OR REPLACE FUNCTION public.get_latest_crypto_snapshots()
RETURNS TABLE (
  user_id uuid,
  total_value_usd numeric,
  snapshot_date date
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT DISTINCT ON (cps.user_id)
    cps.user_id,
    cps.total_value_usd,
    cps.snapshot_date
  FROM public.crypto_portfolio_snapshots cps
  ORDER BY cps.user_id, cps.snapshot_date DESC
$$;

-- Grant execute permission to service role (for edge function)
GRANT EXECUTE ON FUNCTION public.get_latest_crypto_snapshots() TO service_role;

-- Add comments for documentation
COMMENT ON FUNCTION public.get_all_users_bank_balances() IS
  'Returns bank balances (income - expenses) for all users. Used by snapshot-net-worth edge function.';

COMMENT ON FUNCTION public.get_latest_crypto_snapshots() IS
  'Returns the most recent crypto portfolio snapshot for each user using DISTINCT ON. Used by snapshot-net-worth edge function.';
