-- Create crypto_assets table for storing user's tracked cryptocurrency assets
CREATE TABLE public.crypto_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coingecko_id TEXT NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  icon_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, coingecko_id)
);

-- Index for common query patterns
CREATE INDEX idx_crypto_assets_user ON public.crypto_assets(user_id);

-- Enable Row Level Security
ALTER TABLE public.crypto_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own crypto assets
-- Using (SELECT auth.uid()) for better performance per Security Advisor
CREATE POLICY "crypto_assets_select_own"
  ON public.crypto_assets FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "crypto_assets_insert_own"
  ON public.crypto_assets FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "crypto_assets_update_own"
  ON public.crypto_assets FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "crypto_assets_delete_own"
  ON public.crypto_assets FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Trigger for auto-updating updated_at (reuses existing function)
CREATE TRIGGER update_crypto_assets_updated_at
  BEFORE UPDATE ON public.crypto_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
