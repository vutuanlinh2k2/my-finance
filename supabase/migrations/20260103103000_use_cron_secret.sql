-- Use custom CRON_SECRET instead of system-managed keys
-- The SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in edge functions
-- use a different format (sb_publishable_/sb_secret_) that doesn't match JWT tokens

-- ============================================================================
-- 1. Add cron_secret to app_config (replace supabase_anon_key)
-- ============================================================================

-- Remove old key if exists
DELETE FROM public.app_config WHERE key = 'supabase_anon_key';

-- Add cron_secret (MUST be set after migration)
INSERT INTO public.app_config (key, value)
VALUES ('cron_secret', 'PLACEHOLDER_REPLACE_ME')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 2. Update the invoke function to use cron_secret
-- ============================================================================

CREATE OR REPLACE FUNCTION public.invoke_subscription_payment_processor()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_supabase_url TEXT;
  v_cron_secret TEXT;
  v_request_id BIGINT;
BEGIN
  -- Get credentials from config table
  SELECT value INTO v_supabase_url
  FROM public.app_config
  WHERE key = 'supabase_url';

  SELECT value INTO v_cron_secret
  FROM public.app_config
  WHERE key = 'cron_secret';

  -- Validate credentials are set
  IF v_supabase_url IS NULL OR v_supabase_url = 'PLACEHOLDER_REPLACE_ME' THEN
    RAISE EXCEPTION 'Config "supabase_url" is not set';
  END IF;

  IF v_cron_secret IS NULL OR v_cron_secret = 'PLACEHOLDER_REPLACE_ME' THEN
    RAISE EXCEPTION 'Config "cron_secret" is not set. Set it in app_config and Edge Function Secrets.';
  END IF;

  -- Make the HTTP request to the edge function
  SELECT net.http_post(
    url := v_supabase_url || '/functions/v1/process-subscription-payments',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_cron_secret
    ),
    body := '{}'::jsonb
  ) INTO v_request_id;

  RETURN v_request_id;
END;
$$;
