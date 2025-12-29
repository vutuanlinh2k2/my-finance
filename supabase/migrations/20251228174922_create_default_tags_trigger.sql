-- Function to create default tags for a new user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.tags (user_id, name, emoji, type) VALUES
    -- Expense tags
    (NEW.id, 'Rent & Mortgage', '🏠', 'expense'),
    (NEW.id, 'Groceries', '🛒', 'expense'),
    (NEW.id, 'Utilities', '⚡', 'expense'),
    (NEW.id, 'Transportation', '🚗', 'expense'),
    (NEW.id, 'Entertainment', '🎬', 'expense'),
    -- Income tags
    (NEW.id, 'Salary', '💰', 'income'),
    (NEW.id, 'Freelance Work', '💼', 'income'),
    (NEW.id, 'Investments', '📈', 'income');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create default tags when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
