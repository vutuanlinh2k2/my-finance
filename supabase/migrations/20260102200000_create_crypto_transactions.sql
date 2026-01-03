-- Crypto Transaction Types ENUM
-- Defines all possible transaction types for crypto operations
CREATE TYPE public.crypto_transaction_type AS ENUM (
  'buy', 'sell', 'transfer_between', 'swap', 'transfer_in', 'transfer_out'
);

-- Crypto Transactions
-- Stores all crypto transaction records with type-specific fields
CREATE TABLE public.crypto_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.crypto_transaction_type NOT NULL,
  date DATE NOT NULL,

  -- Common optional fields
  tx_id TEXT,
  tx_explorer_url TEXT,

  -- Asset & amount (for most types: buy, sell, transfer_between, transfer_in, transfer_out)
  asset_id UUID REFERENCES public.crypto_assets(id) ON DELETE CASCADE,
  amount NUMERIC(30, 18), -- High precision for crypto

  -- Storage (for most types: buy, sell, swap, transfer_in, transfer_out)
  storage_id UUID REFERENCES public.crypto_storages(id) ON DELETE RESTRICT,

  -- Buy/Sell specific
  fiat_amount BIGINT, -- VND amount
  linked_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,

  -- Transfer Between specific
  from_storage_id UUID REFERENCES public.crypto_storages(id) ON DELETE RESTRICT,
  to_storage_id UUID REFERENCES public.crypto_storages(id) ON DELETE RESTRICT,

  -- Swap specific
  from_asset_id UUID REFERENCES public.crypto_assets(id) ON DELETE CASCADE,
  from_amount NUMERIC(30, 18),
  to_asset_id UUID REFERENCES public.crypto_assets(id) ON DELETE CASCADE,
  to_amount NUMERIC(30, 18),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.crypto_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own crypto transactions
-- Using (SELECT auth.uid()) for better performance per Security Advisor
CREATE POLICY "crypto_transactions_select_own"
  ON public.crypto_transactions FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "crypto_transactions_insert_own"
  ON public.crypto_transactions FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "crypto_transactions_update_own"
  ON public.crypto_transactions FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "crypto_transactions_delete_own"
  ON public.crypto_transactions FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Indexes for efficient querying
CREATE INDEX idx_crypto_transactions_user_date
  ON public.crypto_transactions(user_id, date DESC);

CREATE INDEX idx_crypto_transactions_asset
  ON public.crypto_transactions(asset_id)
  WHERE asset_id IS NOT NULL;

CREATE INDEX idx_crypto_transactions_storage
  ON public.crypto_transactions(storage_id)
  WHERE storage_id IS NOT NULL;

CREATE INDEX idx_crypto_transactions_type
  ON public.crypto_transactions(user_id, type);

-- Trigger for auto-updating updated_at (reuses existing function)
CREATE TRIGGER update_crypto_transactions_updated_at
  BEFORE UPDATE ON public.crypto_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
