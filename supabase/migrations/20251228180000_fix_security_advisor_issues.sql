-- Fix Function Search Path Mutable issues
-- Recreate update_updated_at_column with search_path set
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate handle_new_user with search_path set
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.tags (user_id, name, emoji, type) VALUES
    (NEW.id, 'Rent & Mortgage', '🏠', 'expense'),
    (NEW.id, 'Groceries', '🛒', 'expense'),
    (NEW.id, 'Utilities', '⚡', 'expense'),
    (NEW.id, 'Transportation', '🚗', 'expense'),
    (NEW.id, 'Entertainment', '🎬', 'expense'),
    (NEW.id, 'Salary', '💰', 'income'),
    (NEW.id, 'Freelance Work', '💼', 'income'),
    (NEW.id, 'Investments', '📈', 'income');
  RETURN NEW;
END;
$$;

-- Fix Auth RLS Initialization Plan issues for tags table
-- Using (SELECT auth.uid()) instead of auth.uid() for better performance
DROP POLICY IF EXISTS "Users can view own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can insert own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can update own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can delete own tags" ON public.tags;

CREATE POLICY "Users can view own tags"
  ON public.tags FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own tags"
  ON public.tags FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own tags"
  ON public.tags FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own tags"
  ON public.tags FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Fix Auth RLS Initialization Plan issues for transactions table
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING ((SELECT auth.uid()) = user_id);
