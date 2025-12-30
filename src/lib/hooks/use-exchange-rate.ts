import { useQuery } from '@tanstack/react-query'
import type { ExchangeRateResult } from '@/lib/api/exchange-rate'
import { DEFAULT_EXCHANGE_RATE, fetchExchangeRate } from '@/lib/api/exchange-rate'
import { queryKeys } from '@/lib/query-keys'

// 24 hours in milliseconds
const STALE_TIME = 24 * 60 * 60 * 1000
// Keep in cache for 7 days
const GC_TIME = 7 * 24 * 60 * 60 * 1000

/**
 * Hook to fetch USD to VND exchange rate
 *
 * Features:
 * - Automatic caching in localStorage (24h TTL)
 * - Stale data served while refetching in background
 * - Fallback to default rate if API unavailable
 * - Rate only refetched when stale (once per day)
 */
export function useExchangeRate() {
  return useQuery<ExchangeRateResult>({
    queryKey: queryKeys.exchangeRate.usdVnd,
    queryFn: fetchExchangeRate,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    // Don't retry too aggressively - we have fallback
    retry: 1,
    // Refetch when window regains focus (if stale)
    refetchOnWindowFocus: true,
  })
}

/**
 * Get the exchange rate value, with fallback to default
 */
export function useExchangeRateValue(): {
  rate: number
  isLoading: boolean
  source: 'api' | 'cache' | 'fallback' | 'default'
  lastUpdated: Date | null
} {
  const { data, isLoading } = useExchangeRate()

  if (!data) {
    return {
      rate: DEFAULT_EXCHANGE_RATE,
      isLoading,
      source: 'default',
      lastUpdated: null,
    }
  }

  return {
    rate: data.rate,
    isLoading: false,
    source: data.source,
    lastUpdated: data.lastUpdated,
  }
}
