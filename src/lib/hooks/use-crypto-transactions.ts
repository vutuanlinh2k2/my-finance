import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CryptoTransaction,
  CryptoTransactionFilters,
  CryptoTransactionInput,
  CryptoTransactionWithDetails,
  PaginatedResponse,
  PaginationOptions,
  StorageType,
} from '@/lib/crypto/types'
import type { CryptoTransactionRow } from '@/lib/api/crypto-transactions'
import type { TablesInsert } from '@/types/database'
import {
  createCryptoTransaction,
  deleteCryptoTransaction,
  fetchAllCryptoTransactions,
  fetchCryptoTransactions,
  updateCryptoTransaction,
} from '@/lib/api/crypto-transactions'
import { queryKeys } from '@/lib/query-keys'

/**
 * Transform database row to CryptoTransaction type
 */
function transformToCryptoTransaction(
  row: CryptoTransactionRow,
): CryptoTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    date: row.date,
    txId: row.tx_id,
    txExplorerUrl: row.tx_explorer_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    assetId: row.asset_id,
    amount: row.amount,
    storageId: row.storage_id,
    fiatAmount: row.fiat_amount,
    linkedTransactionId: row.linked_transaction_id,
    fromStorageId: row.from_storage_id,
    toStorageId: row.to_storage_id,
    fromAssetId: row.from_asset_id,
    fromAmount: row.from_amount,
    toAssetId: row.to_asset_id,
    toAmount: row.to_amount,
  }
}

/**
 * Transform row with joins to CryptoTransactionWithDetails
 */
function transformToTransactionWithDetails(
  row: Awaited<ReturnType<typeof fetchCryptoTransactions>>['data'][number],
): CryptoTransactionWithDetails {
  const base = transformToCryptoTransaction(row)

  return {
    ...base,
    asset: row.asset
      ? {
          id: row.asset.id,
          name: row.asset.name,
          symbol: row.asset.symbol,
          iconUrl: row.asset.icon_url,
        }
      : null,
    fromAsset: row.from_asset
      ? {
          id: row.from_asset.id,
          name: row.from_asset.name,
          symbol: row.from_asset.symbol,
          iconUrl: row.from_asset.icon_url,
        }
      : null,
    toAsset: row.to_asset
      ? {
          id: row.to_asset.id,
          name: row.to_asset.name,
          symbol: row.to_asset.symbol,
          iconUrl: row.to_asset.icon_url,
        }
      : null,
    storage: row.storage
      ? {
          id: row.storage.id,
          name: row.storage.name,
          type: row.storage.type as StorageType,
        }
      : null,
    fromStorage: row.from_storage
      ? {
          id: row.from_storage.id,
          name: row.from_storage.name,
          type: row.from_storage.type as StorageType,
        }
      : null,
    toStorage: row.to_storage
      ? {
          id: row.to_storage.id,
          name: row.to_storage.name,
          type: row.to_storage.type as StorageType,
        }
      : null,
  }
}

/**
 * Hook to fetch paginated crypto transactions with filters
 */
export function useCryptoTransactions(
  filters?: CryptoTransactionFilters,
  pagination?: PaginationOptions,
) {
  const page = pagination?.page ?? 1
  const pageSize = pagination?.pageSize ?? 20

  return useQuery({
    queryKey: queryKeys.crypto.transactions.filtered({
      ...filters,
      page,
      pageSize,
    }),
    queryFn: async (): Promise<
      PaginatedResponse<CryptoTransactionWithDetails>
    > => {
      const { data, total } = await fetchCryptoTransactions(filters, {
        page,
        pageSize,
      })
      return {
        data: data.map(transformToTransactionWithDetails),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    },
  })
}

/**
 * Hook to fetch all transactions (for balance calculations)
 */
export function useAllCryptoTransactions() {
  return useQuery({
    queryKey: queryKeys.crypto.transactions.all,
    queryFn: async (): Promise<Array<CryptoTransaction>> => {
      const data = await fetchAllCryptoTransactions()
      return data.map(transformToCryptoTransaction)
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook to create a new crypto transaction
 */
export function useCreateCryptoTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      input: CryptoTransactionInput,
    ): Promise<CryptoTransaction> => {
      const data = await createCryptoTransaction(input)
      return transformToCryptoTransaction(data)
    },
    onSuccess: () => {
      // Invalidate all transaction queries
      queryClient.invalidateQueries({
        queryKey: ['crypto', 'transactions'],
      })
      // Also invalidate assets query (for balance recalculation)
      queryClient.invalidateQueries({
        queryKey: queryKeys.crypto.assets.all,
      })
      // Invalidate storages query (for balance recalculation)
      queryClient.invalidateQueries({
        queryKey: queryKeys.crypto.storages.all,
      })
    },
  })
}

/**
 * Hook to update a crypto transaction
 */
export function useUpdateCryptoTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<TablesInsert<'crypto_transactions'>>
    }): Promise<CryptoTransaction> => {
      const data = await updateCryptoTransaction(id, updates)
      return transformToCryptoTransaction(data)
    },
    onSuccess: () => {
      // Invalidate all transaction queries
      queryClient.invalidateQueries({
        queryKey: ['crypto', 'transactions'],
      })
      // Also invalidate assets query (for balance recalculation)
      queryClient.invalidateQueries({
        queryKey: queryKeys.crypto.assets.all,
      })
      // Invalidate storages query (for balance recalculation)
      queryClient.invalidateQueries({
        queryKey: queryKeys.crypto.storages.all,
      })
    },
  })
}

/**
 * Hook to delete a crypto transaction
 */
export function useDeleteCryptoTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCryptoTransaction(id),
    onSuccess: () => {
      // Invalidate all transaction queries
      queryClient.invalidateQueries({
        queryKey: ['crypto', 'transactions'],
      })
      // Also invalidate assets query (for balance recalculation)
      queryClient.invalidateQueries({
        queryKey: queryKeys.crypto.assets.all,
      })
      // Invalidate storages query (for balance recalculation)
      queryClient.invalidateQueries({
        queryKey: queryKeys.crypto.storages.all,
      })
    },
  })
}

// Re-export types for convenience
export type {
  CryptoTransaction,
  CryptoTransactionWithDetails,
  CryptoTransactionFilters,
  CryptoTransactionInput,
  PaginationOptions,
}
