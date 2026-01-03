-- Add partial index on linked_transaction_id for crypto_transactions
-- This improves query performance when looking up transactions with linked expense/income records

CREATE INDEX idx_crypto_transactions_linked_transaction_id
  ON public.crypto_transactions(linked_transaction_id)
  WHERE linked_transaction_id IS NOT NULL;
