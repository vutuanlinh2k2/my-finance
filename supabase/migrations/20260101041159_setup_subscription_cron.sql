-- Setup Cron Job for Subscription Payment Processing
-- Runs daily at 00:05 UTC to process due subscription payments
-- Uses pg_cron + pg_net to invoke the edge function

-- ============================================================================
-- 1. Enable Required Extensions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- ============================================================================
-- 2. Schedule the Edge Function
-- ============================================================================
-- The anon key is public (same as in frontend) and safe to use here
-- The edge function uses SERVICE_ROLE_KEY from env vars for DB access

SELECT cron.schedule(
  'process-subscription-payments',  -- unique job name
  '5 0 * * *',                       -- cron: 00:05 UTC daily
  $$
  SELECT net.http_post(
    url := 'https://votuotqmkkaltmowbfsv.supabase.co/functions/v1/process-subscription-payments',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdHVvdHFta2thbHRtb3diZnN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MTIzMTQsImV4cCI6MjA4MjM4ODMxNH0.o2P-eXhPKVlnXZoF6V4E9xeXLaTrh0Z5hJumr0FeRjk'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
