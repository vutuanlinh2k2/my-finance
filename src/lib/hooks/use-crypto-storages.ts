import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CryptoStorage } from '@/lib/crypto/types'
import type {
  CreateCryptoStorageInput,
  UpdateCryptoStorageInput,
} from '@/lib/api/crypto-storages'
import {
  createCryptoStorage,
  deleteCryptoStorage,
  fetchCryptoStorages,
  updateCryptoStorage,
} from '@/lib/api/crypto-storages'
import { queryKeys } from '@/lib/query-keys'

/**
 * Transform database row to CryptoStorage type
 */
function transformToCryptoStorage(
  row: Awaited<ReturnType<typeof fetchCryptoStorages>>[number],
): CryptoStorage {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as 'cex' | 'wallet',
    name: row.name,
    address: row.address,
    explorerUrl: row.explorer_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Hook to fetch all crypto storages for the current user
 */
export function useCryptoStorages() {
  return useQuery({
    queryKey: queryKeys.crypto.storages.all,
    queryFn: async (): Promise<Array<CryptoStorage>> => {
      const data = await fetchCryptoStorages()
      return data.map(transformToCryptoStorage)
    },
  })
}

/**
 * Hook to create a new crypto storage
 */
export function useCreateCryptoStorage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      input: CreateCryptoStorageInput,
    ): Promise<CryptoStorage> => {
      const data = await createCryptoStorage(input)
      return transformToCryptoStorage(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.crypto.storages.all,
      })
    },
  })
}

/**
 * Hook to update a crypto storage
 */
export function useUpdateCryptoStorage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: UpdateCryptoStorageInput
    }): Promise<CryptoStorage> => {
      const data = await updateCryptoStorage(id, input)
      return transformToCryptoStorage(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.crypto.storages.all,
      })
    },
  })
}

/**
 * Hook to delete a crypto storage
 */
export function useDeleteCryptoStorage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCryptoStorage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.crypto.storages.all,
      })
    },
  })
}

// Re-export types for convenience
export type { CryptoStorage, CreateCryptoStorageInput, UpdateCryptoStorageInput }
