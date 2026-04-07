import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteTrackedProtocolAccount,
  fetchTrackedProtocolAccount,
  upsertTrackedProtocolAccount,
} from '@/lib/api/tracked-protocol-accounts'
import { queryKeys } from '@/lib/query-keys'
import {
  isValidEvmAddress,
  loadStoredLnbAddress,
  normalizeAddress,
  removeStoredLnbAddress,
} from '@/lib/aave/lnb'

const AAVE_PROTOCOL = 'aave-v3'
const ETHEREUM_NETWORK = 'ethereum'

export function useTrackedAaveAddress() {
  const queryClient = useQueryClient()
  const hasAttemptedMigration = useRef(false)

  const query = useQuery({
    queryKey: queryKeys.crypto.aave.address,
    queryFn: () => fetchTrackedProtocolAccount(AAVE_PROTOCOL, ETHEREUM_NETWORK),
  })

  const saveMutation = useMutation({
    mutationFn: async (address: string) =>
      upsertTrackedProtocolAccount({
        protocol: AAVE_PROTOCOL,
        network: ETHEREUM_NETWORK,
        address,
      }),
    onSuccess: (row) => {
      queryClient.setQueryData(queryKeys.crypto.aave.address, row)
    },
  })

  const clearMutation = useMutation({
    mutationFn: async () =>
      deleteTrackedProtocolAccount(AAVE_PROTOCOL, ETHEREUM_NETWORK),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.crypto.aave.address, null)
    },
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (query.isLoading || query.data || hasAttemptedMigration.current) return

    hasAttemptedMigration.current = true
    const storedAddress = loadStoredLnbAddress()
    if (!storedAddress || !isValidEvmAddress(storedAddress)) {
      removeStoredLnbAddress()
      return
    }

    saveMutation.mutate(normalizeAddress(storedAddress), {
      onSuccess: () => {
        removeStoredLnbAddress()
      },
    })
  }, [query.data, query.isLoading, saveMutation])

  return {
    address: query.data?.address ?? null,
    isLoading:
      query.isLoading || saveMutation.isPending || clearMutation.isPending,
    isSaving: saveMutation.isPending,
    isRemoving: clearMutation.isPending,
    saveAddress: async (nextAddress: string) => {
      const normalized = normalizeAddress(nextAddress)
      await saveMutation.mutateAsync(normalized)
      return normalized
    },
    clearAddress: async () => {
      await clearMutation.mutateAsync()
      removeStoredLnbAddress()
    },
    error: query.error ?? saveMutation.error ?? clearMutation.error ?? null,
  }
}
