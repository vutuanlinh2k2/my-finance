-- Fix: Create missing transaction_type enum
-- The RPC function create_crypto_buy_sell_transaction expects this enum
-- but it was never created in the original migrations

-- Create the transaction_type enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.transaction_type AS ENUM ('expense', 'income');
  END IF;
END
$$;

-- Check if transactions.type is TEXT and convert to enum if needed
DO $$
DECLARE
  v_column_type TEXT;
BEGIN
  SELECT data_type INTO v_column_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'transactions'
    AND column_name = 'type';

  -- If column is text, alter it to use the enum
  IF v_column_type = 'text' OR v_column_type = 'character varying' THEN
    -- Drop the CHECK constraint first (if exists)
    ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

    -- Alter the column to use the enum
    ALTER TABLE public.transactions
      ALTER COLUMN type TYPE public.transaction_type
      USING type::public.transaction_type;
  END IF;
END
$$;

-- Update the crypto buy/sell RPC function to properly cast the type
CREATE OR REPLACE FUNCTION public.create_crypto_buy_sell_transaction(
  p_user_id UUID,
  p_crypto_type TEXT,
  p_date DATE,
  p_tx_id TEXT,
  p_tx_explorer_url TEXT,
  p_asset_id UUID,
  p_amount NUMERIC,
  p_storage_id UUID,
  p_fiat_amount BIGINT,
  p_linked_title TEXT,
  p_linked_type TEXT,
  p_tag_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_linked_id UUID;
  v_crypto_id UUID;
BEGIN
  -- Insert linked transaction (expense for buy, income for sell)
  -- Explicitly cast p_linked_type to transaction_type enum
  INSERT INTO public.transactions (user_id, title, amount, date, type, tag_id)
  VALUES (p_user_id, p_linked_title, p_fiat_amount, p_date, p_linked_type::public.transaction_type, p_tag_id)
  RETURNING id INTO v_linked_id;

  -- Insert crypto transaction with link to the regular transaction
  INSERT INTO public.crypto_transactions (
    user_id, type, date, tx_id, tx_explorer_url,
    asset_id, amount, storage_id, fiat_amount, linked_transaction_id
  )
  VALUES (
    p_user_id, p_crypto_type::public.crypto_transaction_type, p_date, p_tx_id, p_tx_explorer_url,
    p_asset_id, p_amount, p_storage_id, p_fiat_amount, v_linked_id
  )
  RETURNING id INTO v_crypto_id;

  RETURN v_crypto_id;
END;
$$;

-- Update the crypto transfer in/out RPC function as well for consistency
CREATE OR REPLACE FUNCTION public.create_crypto_transfer_in_out_transaction(
  p_user_id UUID,
  p_crypto_type TEXT,
  p_date DATE,
  p_tx_id TEXT,
  p_tx_explorer_url TEXT,
  p_asset_id UUID,
  p_amount NUMERIC,
  p_storage_id UUID,
  p_fiat_amount BIGINT,
  p_linked_title TEXT,
  p_linked_type TEXT,
  p_tag_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_linked_id UUID;
  v_crypto_id UUID;
BEGIN
  -- Insert linked transaction (income for transfer_in, expense for transfer_out)
  INSERT INTO public.transactions (user_id, title, amount, date, type, tag_id)
  VALUES (p_user_id, p_linked_title, p_fiat_amount, p_date, p_linked_type::public.transaction_type, p_tag_id)
  RETURNING id INTO v_linked_id;

  -- Insert crypto transaction with link to the regular transaction
  INSERT INTO public.crypto_transactions (
    user_id, type, date, tx_id, tx_explorer_url,
    asset_id, amount, storage_id, fiat_amount, linked_transaction_id
  )
  VALUES (
    p_user_id, p_crypto_type::public.crypto_transaction_type, p_date, p_tx_id, p_tx_explorer_url,
    p_asset_id, p_amount, p_storage_id, p_fiat_amount, v_linked_id
  )
  RETURNING id INTO v_crypto_id;

  RETURN v_crypto_id;
END;
$$;
