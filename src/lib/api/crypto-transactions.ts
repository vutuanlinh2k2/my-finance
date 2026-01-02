import type { Tables, TablesInsert } from '@/types/database'
import type {
  CryptoTransactionFilters,
  CryptoTransactionInput,
  PaginationOptions,
} from '@/lib/crypto/types'
import { supabase } from '@/lib/supabase'

export type CryptoTransactionRow = Tables<'crypto_transactions'>

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
 */
export async function createCryptoTransaction(
  input: CryptoTransactionInput,
): Promise<CryptoTransactionRow> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    throw new Error('User not authenticated')
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
    case 'buy':
    case 'sell':
      insertData.asset_id = input.assetId
      insertData.amount = input.amount
      insertData.storage_id = input.storageId
      insertData.fiat_amount = input.fiatAmount
      break

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

    case 'transfer_in':
    case 'transfer_out':
      insertData.asset_id = input.assetId
      insertData.amount = input.amount
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
 * Update an existing crypto transaction
 */
export async function updateCryptoTransaction(
  id: string,
  updates: Partial<TablesInsert<'crypto_transactions'>>,
): Promise<CryptoTransactionRow> {
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
 */
export async function deleteCryptoTransaction(id: string): Promise<void> {
  const { error } = await supabase
    .from('crypto_transactions')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete crypto transaction: ${error.message}`)
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
