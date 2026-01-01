-- Fix: Remove hardcoded credentials from cron job
-- Uses a secure config table to store API credentials

-- ============================================================================
-- 1. Create Config Table for Cron Job Settings
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS - only service role can access
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- No policies = only service role can read/write (most secure)
-- This table is only accessed by the cron function which runs as postgres

-- Add comment for documentation
COMMENT ON TABLE public.app_config IS 'Secure configuration storage for cron jobs. Only accessible by service role.';

-- Insert placeholder values (MUST be updated after migration)
INSERT INTO public.app_config (key, value) VALUES
  ('supabase_url', 'PLACEHOLDER_REPLACE_ME'),
  ('supabase_anon_key', 'PLACEHOLDER_REPLACE_ME')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 2. Create Function to Invoke Edge Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.invoke_subscription_payment_processor()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_supabase_url TEXT;
  v_anon_key TEXT;
  v_request_id BIGINT;
BEGIN
  -- Get credentials from config table
  SELECT value INTO v_supabase_url
  FROM public.app_config
  WHERE key = 'supabase_url';

  SELECT value INTO v_anon_key
  FROM public.app_config
  WHERE key = 'supabase_anon_key';

  -- Validate credentials are set
  IF v_supabase_url IS NULL OR v_supabase_url = 'PLACEHOLDER_REPLACE_ME' THEN
    RAISE EXCEPTION 'Config "supabase_url" is not set. Run: UPDATE public.app_config SET value = ''your-url'' WHERE key = ''supabase_url'';';
  END IF;

  IF v_anon_key IS NULL OR v_anon_key = 'PLACEHOLDER_REPLACE_ME' THEN
    RAISE EXCEPTION 'Config "supabase_anon_key" is not set. Run: UPDATE public.app_config SET value = ''your-key'' WHERE key = ''supabase_anon_key'';';
  END IF;

  -- Make the HTTP request to the edge function
  SELECT net.http_post(
    url := v_supabase_url || '/functions/v1/process-subscription-payments',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key
    ),
    body := '{}'::jsonb
  ) INTO v_request_id;

  RETURN v_request_id;
END;
$$;

-- Grant execute to postgres (for cron)
GRANT EXECUTE ON FUNCTION public.invoke_subscription_payment_processor() TO postgres;

-- ============================================================================
-- 3. Update Cron Job to Use the New Function
-- ============================================================================

-- Remove the old cron job with hardcoded credentials
SELECT cron.unschedule('process-subscription-payments');

-- Create new cron job that calls our secure function
SELECT cron.schedule(
  'process-subscription-payments',
  '5 0 * * *',
  $$SELECT public.invoke_subscription_payment_processor()$$
);
