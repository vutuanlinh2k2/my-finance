import type { Tables, TablesInsert } from '@/types/database'
import type {
  BuyTransactionInput,
  CryptoTransactionFilters,
  CryptoTransactionInput,
  PaginationOptions,
  SellTransactionInput,
  TransferInTransactionInput,
  TransferOutTransactionInput,
} from '@/lib/crypto/types'
import { supabase } from '@/lib/supabase'

export type CryptoTransactionRow = Tables<'crypto_transactions'>

/**
 * Options for creating Buy/Sell transactions with linked expense/income
 */
export interface LinkedTransactionOptions {
  /** The "Investing" tag ID for the appropriate type (expense for buy, income for sell) */
  tagId: string
  /** The asset symbol for the transaction title (e.g., "BTC") */
  assetSymbol: string
}

// Joined query type for transactions with related data
type TransactionWithJoins = CryptoTransactionRow & {
  asset: Pick<
    Tables<'crypto_assets'>,
    'id' | 'name' | 'symbol' | 'icon_url'
  > | null
  from_asset: Pick<
    Tables<'crypto_assets'>,
    'id' | 'name' | 'symbol' | 'icon_url'
  > | null
  to_asset: Pick<
    Tables<'crypto_assets'>,
    'id' | 'name' | 'symbol' | 'icon_url'
  > | null
  storage: Pick<Tables<'crypto_storages'>, 'id' | 'name' | 'type'> | null
  from_storage: Pick<Tables<'crypto_storages'>, 'id' | 'name' | 'type'> | null
  to_storage: Pick<Tables<'crypto_storages'>, 'id' | 'name' | 'type'> | null
}

const DEFAULT_PAGE_SIZE = 20

/**
 * Fetch crypto transactions with optional filters and pagination
 */
export async function fetchCryptoTransactions(
  filters?: CryptoTransactionFilters,
  pagination?: PaginationOptions,
): Promise<{ data: Array<TransactionWithJoins>; total: number }> {
  const page = pagination?.page ?? 1
  const pageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE
  const offset = (page - 1) * pageSize

  // Build query with joins
  let query = supabase
    .from('crypto_transactions')
    .select(
      `
      *,
      asset:crypto_assets!crypto_transactions_asset_id_fkey(id, name, symbol, icon_url),
      from_asset:crypto_assets!crypto_transactions_from_asset_id_fkey(id, name, symbol, icon_url),
      to_asset:crypto_assets!crypto_transactions_to_asset_id_fkey(id, name, symbol, icon_url),
      storage:crypto_storages!crypto_transactions_storage_id_fkey(id, name, type),
      from_storage:crypto_storages!crypto_transactions_from_storage_id_fkey(id, name, type),
      to_storage:crypto_storages!crypto_transactions_to_storage_id_fkey(id, name, type)
    `,
      { count: 'exact' },
    )
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  // Apply filters
  if (filters?.types && filters.types.length > 0) {
    query = query.in('type', filters.types)
  }

  if (filters?.startDate) {
    query = query.gte('date', filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte('date', filters.endDate)
  }

  if (filters?.assetId) {
    query = query.or(
      `asset_id.eq.${filters.assetId},from_asset_id.eq.${filters.assetId},to_asset_id.eq.${filters.assetId}`,
    )
  }

  if (filters?.storageId) {
    query = query.or(
      `storage_id.eq.${filters.storageId},from_storage_id.eq.${filters.storageId},to_storage_id.eq.${filters.storageId}`,
    )
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch crypto transactions: ${error.message}`)
  }

  return {
    data: data as Array<TransactionWithJoins>,
    total: count ?? 0,
  }
}

/**
 * Fetch all crypto transactions (for balance calculations)
 * No pagination, returns all transactions
 */
export async function fetchAllCryptoTransactions(): Promise<
  Array<CryptoTransactionRow>
> {
  const { data, error } = await supabase
    .from('crypto_transactions')
    .select('*')
    .order('date', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch all crypto transactions: ${error.message}`)
  }

  return data
}

/**
 * Create a new crypto transaction
 * For Buy/Sell transactions, optionally creates a linked expense/income transaction
 *
 * @param input - Transaction input data
 * @param linkedOptions - Options for creating linked expense/income (required for buy/sell)
 */
export async function createCryptoTransaction(
  input: CryptoTransactionInput,
  linkedOptions?: LinkedTransactionOptions,
): Promise<CryptoTransactionRow> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    throw new Error('User not authenticated')
  }

  // For buy/sell, we need to create linked transactions
  if (input.type === 'buy' || input.type === 'sell') {
    return createBuySellTransaction(input, linkedOptions, userData.user.id)
  }

  // For transfer_in/transfer_out, we also need to create linked transactions
  if (input.type === 'transfer_in' || input.type === 'transfer_out') {
    return createTransferInOutTransaction(input, linkedOptions, userData.user.id)
  }

  // Build insert data based on transaction type
  const insertData: TablesInsert<'crypto_transactions'> = {
    user_id: userData.user.id,
    type: input.type,
    date: input.date,
    tx_id: input.txId ?? null,
    tx_explorer_url: input.txExplorerUrl ?? null,
  }

  // Add type-specific fields
  switch (input.type) {
    case 'transfer_between':
      insertData.asset_id = input.assetId
      insertData.amount = input.amount
      insertData.from_storage_id = input.fromStorageId
      insertData.to_storage_id = input.toStorageId
      break

    case 'swap':
      insertData.from_asset_id = input.fromAssetId
      insertData.from_amount = input.fromAmount
      insertData.to_asset_id = input.toAssetId
      insertData.to_amount = input.toAmount
      insertData.storage_id = input.storageId
      break
  }

  const { data, error } = await supabase
    .from('crypto_transactions')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create crypto transaction: ${error.message}`)
  }

  return data
}

/**
 * Create a Buy or Sell transaction with linked expense/income
 * This is an atomic operation - either both succeed or both fail
 */
async function createBuySellTransaction(
  input: BuyTransactionInput | SellTransactionInput,
  linkedOptions: LinkedTransactionOptions | undefined,
  userId: string,
): Promise<CryptoTransactionRow> {
  if (!linkedOptions) {
    throw new Error(
      `Cannot create ${input.type} transaction without linked transaction options. ` +
        `Please ensure an "Investing" tag exists for ${input.type === 'buy' ? 'expenses' : 'income'}.`,
    )
  }

  // Determine transaction type for the linked regular transaction
  const linkedType = input.type === 'buy' ? 'expense' : 'income'
  const title = `${input.type === 'buy' ? 'Buy' : 'Sell'} ${linkedOptions.assetSymbol.toUpperCase()}`

  // Step 1: Create the linked regular transaction (expense for buy, income for sell)
  const { data: linkedTransaction, error: linkedError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      title,
      amount: input.fiatAmount,
      date: input.date,
      type: linkedType,
      tag_id: linkedOptions.tagId,
    })
    .select()
    .single()

  if (linkedError) {
    throw new Error(
      `Failed to create linked ${linkedType} transaction: ${linkedError.message}`,
    )
  }

  // Step 2: Create the crypto transaction with linked_transaction_id
  const { data: cryptoTransaction, error: cryptoError } = await supabase
    .from('crypto_transactions')
    .insert({
      user_id: userId,
      type: input.type,
      date: input.date,
      tx_id: input.txId ?? null,
      tx_explorer_url: input.txExplorerUrl ?? null,
      asset_id: input.assetId,
      amount: input.amount,
      storage_id: input.storageId,
      fiat_amount: input.fiatAmount,
      linked_transaction_id: linkedTransaction.id,
    })
    .select()
    .single()

  if (cryptoError) {
    // Rollback: Delete the linked transaction
    await supabase.from('transactions').delete().eq('id', linkedTransaction.id)
    throw new Error(
      `Failed to create crypto transaction: ${cryptoError.message}`,
    )
  }

  return cryptoTransaction
}

/**
 * Create a Transfer In or Transfer Out transaction with linked income/expense
 * - Transfer In creates a linked income transaction (value received from airdrop, gift, etc.)
 * - Transfer Out creates a linked expense transaction (value given away, lost, etc.)
 *
 * This is an atomic operation - either both succeed or both fail
 */
async function createTransferInOutTransaction(
  input: TransferInTransactionInput | TransferOutTransactionInput,
  linkedOptions: LinkedTransactionOptions | undefined,
  userId: string,
): Promise<CryptoTransactionRow> {
  if (!linkedOptions) {
    throw new Error(
      `Cannot create ${input.type} transaction without linked transaction options. ` +
        `Please ensure an "Investing" tag exists for ${input.type === 'transfer_in' ? 'income' : 'expenses'}.`,
    )
  }

  // Determine transaction type for the linked regular transaction
  // Transfer In = income (receiving value), Transfer Out = expense (giving away value)
  const linkedType = input.type === 'transfer_in' ? 'income' : 'expense'
  const title =
    input.type === 'transfer_in'
      ? `Receive ${linkedOptions.assetSymbol.toUpperCase()}`
      : `Send ${linkedOptions.assetSymbol.toUpperCase()}`

  // Step 1: Create the linked regular transaction
  const { data: linkedTransaction, error: linkedError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      title,
      amount: input.fiatAmount,
      date: input.date,
      type: linkedType,
      tag_id: linkedOptions.tagId,
    })
    .select()
    .single()

  if (linkedError) {
    throw new Error(
      `Failed to create linked ${linkedType} transaction: ${linkedError.message}`,
    )
  }

  // Step 2: Create the crypto transaction with linked_transaction_id
  const { data: cryptoTransaction, error: cryptoError } = await supabase
    .from('crypto_transactions')
    .insert({
      user_id: userId,
      type: input.type,
      date: input.date,
      tx_id: input.txId ?? null,
      tx_explorer_url: input.txExplorerUrl ?? null,
      asset_id: input.assetId,
      amount: input.amount,
      storage_id: input.storageId,
      fiat_amount: input.fiatAmount,
      linked_transaction_id: linkedTransaction.id,
    })
    .select()
    .single()

  if (cryptoError) {
    // Rollback: Delete the linked transaction
    await supabase.from('transactions').delete().eq('id', linkedTransaction.id)
    throw new Error(
      `Failed to create crypto transaction: ${cryptoError.message}`,
    )
  }

  return cryptoTransaction
}

/**
 * Update options for Buy/Sell transactions
 */
export interface UpdateLinkedTransactionOptions {
  /** If true, also update the linked expense/income transaction */
  updateLinked?: boolean
  /** The asset symbol for updating the transaction title */
  assetSymbol?: string
}

/**
 * Update an existing crypto transaction
 * For Buy/Sell, also updates the linked expense/income transaction if requested
 */
export async function updateCryptoTransaction(
  id: string,
  updates: Partial<TablesInsert<'crypto_transactions'>>,
  linkedOptions?: UpdateLinkedTransactionOptions,
): Promise<CryptoTransactionRow> {
  // First, get the current transaction to check if it's a buy/sell with linked transaction
  const { data: currentTx, error: fetchError } = await supabase
    .from('crypto_transactions')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch crypto transaction: ${fetchError.message}`)
  }

  // If it's a transaction with linked expense/income and we need to update it
  const hasLinkedType =
    currentTx.type === 'buy' ||
    currentTx.type === 'sell' ||
    currentTx.type === 'transfer_in' ||
    currentTx.type === 'transfer_out'

  if (
    hasLinkedType &&
    currentTx.linked_transaction_id &&
    linkedOptions?.updateLinked
  ) {
    // Update the linked transaction (amount and/or date)
    const linkedUpdates: Record<string, unknown> = {}

    if (updates.fiat_amount !== undefined) {
      linkedUpdates.amount = updates.fiat_amount
    }

    if (updates.date !== undefined) {
      linkedUpdates.date = updates.date
    }

    // Update title if asset symbol changed
    if (linkedOptions.assetSymbol) {
      let title: string
      switch (currentTx.type) {
        case 'buy':
          title = `Buy ${linkedOptions.assetSymbol.toUpperCase()}`
          break
        case 'sell':
          title = `Sell ${linkedOptions.assetSymbol.toUpperCase()}`
          break
        case 'transfer_in':
          title = `Receive ${linkedOptions.assetSymbol.toUpperCase()}`
          break
        case 'transfer_out':
          title = `Send ${linkedOptions.assetSymbol.toUpperCase()}`
          break
        default:
          title = linkedOptions.assetSymbol.toUpperCase()
      }
      linkedUpdates.title = title
    }

    if (Object.keys(linkedUpdates).length > 0) {
      const { error: linkedError } = await supabase
        .from('transactions')
        .update(linkedUpdates)
        .eq('id', currentTx.linked_transaction_id)

      if (linkedError) {
        throw new Error(
          `Failed to update linked transaction: ${linkedError.message}`,
        )
      }
    }
  }

  // Update the crypto transaction
  const { data, error } = await supabase
    .from('crypto_transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update crypto transaction: ${error.message}`)
  }

  return data
}

/**
 * Delete a crypto transaction
 * For Buy/Sell, also deletes the linked expense/income transaction
 */
export async function deleteCryptoTransaction(id: string): Promise<void> {
  // First, get the transaction to check if it has a linked transaction
  const { data: transaction, error: fetchError } = await supabase
    .from('crypto_transactions')
    .select('linked_transaction_id')
    .eq('id', id)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch crypto transaction: ${fetchError.message}`)
  }

  // Delete the crypto transaction first
  const { error } = await supabase
    .from('crypto_transactions')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete crypto transaction: ${error.message}`)
  }

  // If there's a linked transaction, delete it too
  if (transaction.linked_transaction_id) {
    const { error: linkedError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transaction.linked_transaction_id)

    if (linkedError) {
      // Log but don't throw - the main transaction was already deleted
      console.error('Failed to delete linked transaction:', linkedError.message)
    }
  }
}

/**
 * Get a single transaction by ID with all joins
 */
export async function getCryptoTransaction(
  id: string,
): Promise<TransactionWithJoins | null> {
  const { data, error } = await supabase
    .from('crypto_transactions')
    .select(
      `
      *,
      asset:crypto_assets!crypto_transactions_asset_id_fkey(id, name, symbol, icon_url),
      from_asset:crypto_assets!crypto_transactions_from_asset_id_fkey(id, name, symbol, icon_url),
      to_asset:crypto_assets!crypto_transactions_to_asset_id_fkey(id, name, symbol, icon_url),
      storage:crypto_storages!crypto_transactions_storage_id_fkey(id, name, type),
      from_storage:crypto_storages!crypto_transactions_from_storage_id_fkey(id, name, type),
      to_storage:crypto_storages!crypto_transactions_to_storage_id_fkey(id, name, type)
    `,
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw new Error(`Failed to get crypto transaction: ${error.message}`)
  }

  return data as TransactionWithJoins
}
