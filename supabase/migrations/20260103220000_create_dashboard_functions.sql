-- Migration: Dashboard RPC functions
-- Purpose: Provide efficient aggregation queries for dashboard totals

-- Function: Get all-time totals for the current user
-- Returns total income, total expenses, and bank balance (income - expenses)
CREATE OR REPLACE FUNCTION public.get_all_time_totals()
RETURNS TABLE (
  total_income numeric,
  total_expenses numeric,
  bank_balance numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as bank_balance
  FROM public.transactions
  WHERE user_id = (SELECT auth.uid())
$$;

-- Function: Get monthly totals for the current user
-- Parameters: p_year (int), p_month (int)
-- Returns total income and total expenses for the specified month
CREATE OR REPLACE FUNCTION public.get_monthly_totals(p_year int, p_month int)
RETURNS TABLE (
  total_income numeric,
  total_expenses numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
  FROM public.transactions
  WHERE user_id = (SELECT auth.uid())
    AND EXTRACT(YEAR FROM date::date) = p_year
    AND EXTRACT(MONTH FROM date::date) = p_month
$$;
