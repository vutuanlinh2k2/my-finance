-- Migration: Atomic RPC functions for crypto transactions
-- Purpose: Ensure buy/sell and transfer_in/transfer_out transactions are created atomically
-- with their linked expense/income transactions

-- Function for atomic buy/sell transaction creation
-- Returns the crypto transaction ID on success
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

-- Function for atomic transfer_in/transfer_out transaction creation
-- Returns the crypto transaction ID on success
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
