-- Migration: Cron job for net worth snapshots
-- Schedules daily net worth snapshot creation at 00:15 UTC
-- (runs after crypto portfolio snapshot at 00:10 UTC)

-- ============================================================================
-- 1. Create function to invoke the edge function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.invoke_net_worth_snapshot()
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
    url := v_supabase_url || '/functions/v1/snapshot-net-worth',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_cron_secret
    ),
    body := '{}'::jsonb
  ) INTO v_request_id;

  RETURN v_request_id;
END;
$$;

-- ============================================================================
-- 2. Schedule the cron job
-- ============================================================================

-- Schedule daily at 00:15 UTC (after crypto snapshot at 00:10)
SELECT cron.schedule(
  'snapshot-net-worth-daily',
  '15 0 * * *',
  'SELECT public.invoke_net_worth_snapshot()'
);
