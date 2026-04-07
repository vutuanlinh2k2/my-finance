-- Migration: Track Aave accounts in DB and extend snapshot breakdowns

CREATE TABLE public.tracked_protocol_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protocol TEXT NOT NULL,
  network TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tracked_protocol_accounts_protocol_check
    CHECK (protocol IN ('aave-v3')),
  CONSTRAINT tracked_protocol_accounts_network_check
    CHECK (network IN ('ethereum')),
  CONSTRAINT tracked_protocol_accounts_address_check
    CHECK (address ~ '^0x[a-fA-F0-9]{40}$'),
  UNIQUE (user_id, protocol, network)
);

ALTER TABLE public.tracked_protocol_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tracked_protocol_accounts_select_own"
  ON public.tracked_protocol_accounts FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "tracked_protocol_accounts_insert_own"
  ON public.tracked_protocol_accounts FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "tracked_protocol_accounts_update_own"
  ON public.tracked_protocol_accounts FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "tracked_protocol_accounts_delete_own"
  ON public.tracked_protocol_accounts FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

CREATE INDEX idx_tracked_protocol_accounts_user_protocol_network
  ON public.tracked_protocol_accounts(user_id, protocol, network);

CREATE TRIGGER set_tracked_protocol_accounts_updated_at
  BEFORE UPDATE ON public.tracked_protocol_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.crypto_portfolio_snapshots
  ADD COLUMN spot_value_usd NUMERIC(20, 2) NOT NULL DEFAULT 0,
  ADD COLUMN aave_supplied_usd NUMERIC(20, 2) NOT NULL DEFAULT 0,
  ADD COLUMN aave_borrowed_usd NUMERIC(20, 2) NOT NULL DEFAULT 0;

UPDATE public.crypto_portfolio_snapshots
SET
  spot_value_usd = total_value_usd,
  aave_supplied_usd = 0,
  aave_borrowed_usd = 0
WHERE
  spot_value_usd = 0
  AND aave_supplied_usd = 0
  AND aave_borrowed_usd = 0;

ALTER TABLE public.net_worth_snapshots
  ADD COLUMN spot_crypto_value_vnd NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN aave_supplied_value_vnd NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN aave_borrowed_value_vnd NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN net_crypto_value_vnd NUMERIC NOT NULL DEFAULT 0;

UPDATE public.net_worth_snapshots
SET
  spot_crypto_value_vnd = crypto_value_vnd,
  aave_supplied_value_vnd = 0,
  aave_borrowed_value_vnd = 0,
  net_crypto_value_vnd = crypto_value_vnd
WHERE
  spot_crypto_value_vnd = 0
  AND aave_supplied_value_vnd = 0
  AND aave_borrowed_value_vnd = 0
  AND net_crypto_value_vnd = 0;

DROP FUNCTION IF EXISTS public.get_latest_crypto_snapshots();

CREATE FUNCTION public.get_latest_crypto_snapshots()
RETURNS TABLE (
  user_id uuid,
  total_value_usd numeric,
  spot_value_usd numeric,
  aave_supplied_usd numeric,
  aave_borrowed_usd numeric,
  snapshot_date date
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT DISTINCT ON (cps.user_id)
    cps.user_id,
    cps.total_value_usd,
    cps.spot_value_usd,
    cps.aave_supplied_usd,
    cps.aave_borrowed_usd,
    cps.snapshot_date
  FROM public.crypto_portfolio_snapshots cps
  ORDER BY cps.user_id, cps.snapshot_date DESC
$$;

GRANT EXECUTE ON FUNCTION public.get_latest_crypto_snapshots() TO service_role;

COMMENT ON TABLE public.tracked_protocol_accounts IS
  'Tracks protocol-specific accounts, such as a user''s Aave V3 Ethereum address.';

COMMENT ON COLUMN public.crypto_portfolio_snapshots.total_value_usd IS
  'Asset-page crypto total in USD: spot crypto plus Aave supplied value. Does not subtract borrowed liabilities.';
