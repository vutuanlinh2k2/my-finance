-- Migration: Cron job for crypto portfolio snapshots
-- Schedules daily crypto portfolio snapshot creation at 00:10 UTC
-- (runs after subscription payments at 00:05 UTC, before net worth at 00:15 UTC)

-- ============================================================================
-- 1. Create function to invoke the edge function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.invoke_crypto_portfolio_snapshot()
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
    url := v_supabase_url || '/functions/v1/snapshot-crypto-portfolio',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_cron_secret
    ),
    body := '{}'::jsonb
  ) INTO v_request_id;

  RETURN v_request_id;
END;
$$;

-- Grant execute to postgres (for cron)
GRANT EXECUTE ON FUNCTION public.invoke_crypto_portfolio_snapshot() TO postgres;

-- ============================================================================
-- 2. Schedule the cron job
-- ============================================================================

-- Schedule daily at 00:10 UTC (after subscription payments, before net worth)
SELECT cron.schedule(
  'snapshot-crypto-portfolio-daily',
  '10 0 * * *',
  'SELECT public.invoke_crypto_portfolio_snapshot()'
);
