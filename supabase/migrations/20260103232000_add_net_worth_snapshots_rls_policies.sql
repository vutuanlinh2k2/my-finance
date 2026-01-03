-- Migration: Add missing UPDATE/DELETE RLS policies for net_worth_snapshots
-- Purpose: Ensure complete CRUD policy coverage consistent with other tables

-- RLS Policy: Users can update their own snapshots
CREATE POLICY "net_worth_snapshots_update_own"
  ON public.net_worth_snapshots FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- RLS Policy: Users can delete their own snapshots
CREATE POLICY "net_worth_snapshots_delete_own"
  ON public.net_worth_snapshots FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Add comment to table explaining the snapshot system
COMMENT ON TABLE public.net_worth_snapshots IS
  'Daily net worth snapshots for historical tracking. Primarily populated by the snapshot-net-worth edge function (cron job) using service role, which bypasses RLS. Standard RLS policies exist for user data access and potential manual corrections.';
