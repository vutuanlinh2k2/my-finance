import { useQuery } from '@tanstack/react-query'
import { fetchAaveTransactionHistory } from '@/lib/aave/history'
import { isValidEvmAddress, normalizeAddress } from '@/lib/aave/lnb'
import { queryKeys } from '@/lib/query-keys'

export function useAaveTransactionHistory(address: string | null) {
  const normalizedAddress = address ? normalizeAddress(address) : null
  const hasValidAddress = !!normalizedAddress && isValidEvmAddress(normalizedAddress)

  return useQuery({
    queryKey: queryKeys.crypto.aave.history(normalizedAddress),
    queryFn: () => fetchAaveTransactionHistory(normalizedAddress!),
    enabled: hasValidAddress,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
  })
}
