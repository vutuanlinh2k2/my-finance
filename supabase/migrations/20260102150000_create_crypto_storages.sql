-- Crypto Storages
-- Stores user's crypto storage locations (exchanges and wallets)

CREATE TABLE public.crypto_storages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cex', 'wallet')),
  name TEXT NOT NULL,
  address TEXT, -- Required for wallet type
  explorer_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.crypto_storages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own crypto storages
-- Using (SELECT auth.uid()) for better performance per Security Advisor
CREATE POLICY "crypto_storages_select_own"
  ON public.crypto_storages FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "crypto_storages_insert_own"
  ON public.crypto_storages FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "crypto_storages_update_own"
  ON public.crypto_storages FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "crypto_storages_delete_own"
  ON public.crypto_storages FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Index for faster user queries
CREATE INDEX idx_crypto_storages_user ON public.crypto_storages(user_id);

-- Trigger for auto-updating updated_at (reuses existing function)
CREATE TRIGGER update_crypto_storages_updated_at
  BEFORE UPDATE ON public.crypto_storages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
