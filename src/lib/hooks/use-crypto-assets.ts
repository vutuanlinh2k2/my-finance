import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CryptoAsset } from '@/lib/crypto/types'
import type { CreateCryptoAssetInput } from '@/lib/api/crypto-assets'
import {
  createCryptoAsset,
  deleteCryptoAsset,
  fetchCryptoAssets,
} from '@/lib/api/crypto-assets'
import { queryKeys } from '@/lib/query-keys'

/**
 * Transform database row to CryptoAsset type
 */
function transformToCryptoAsset(
  row: Awaited<ReturnType<typeof fetchCryptoAssets>>[number],
): CryptoAsset {
  return {
    id: row.id,
    userId: row.user_id,
    coingeckoId: row.coingecko_id,
    name: row.name,
    symbol: row.symbol,
    iconUrl: row.icon_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Hook to fetch all crypto assets for the current user
 */
export function useCryptoAssets() {
  return useQuery({
    queryKey: queryKeys.crypto.assets.all,
    queryFn: async (): Promise<Array<CryptoAsset>> => {
      const data = await fetchCryptoAssets()
      return data.map(transformToCryptoAsset)
    },
  })
}

/**
 * Hook to create a new crypto asset
 */
export function useCreateCryptoAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateCryptoAssetInput): Promise<CryptoAsset> => {
      const data = await createCryptoAsset(input)
      return transformToCryptoAsset(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.crypto.assets.all,
      })
    },
  })
}

/**
 * Hook to delete a crypto asset
 */
export function useDeleteCryptoAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCryptoAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.crypto.assets.all,
      })
    },
  })
}

// Re-export types for convenience
export type { CryptoAsset, CreateCryptoAssetInput }
