import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
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
 * Shows a toast notification when using fallback/default rate
 */
export function useExchangeRateValue(): {
  rate: number
  isLoading: boolean
  source: 'api' | 'cache' | 'fallback' | 'default'
  lastUpdated: Date | null
  isUsingFallback: boolean
} {
  const { data, isLoading } = useExchangeRate()
  const hasShownFallbackToast = useRef(false)

  const source = data?.source ?? 'default'
  const isUsingFallback = source === 'fallback' || source === 'default'

  // Show toast once when falling back to default rate
  useEffect(() => {
    if (isUsingFallback && !isLoading && !hasShownFallbackToast.current) {
      hasShownFallbackToast.current = true
      toast.warning('Using estimated exchange rate', {
        description: 'Could not fetch live USD/VND rate. Amounts may be approximate.',
        duration: 5000,
      })
    }
  }, [isUsingFallback, isLoading])

  if (!data) {
    return {
      rate: DEFAULT_EXCHANGE_RATE,
      isLoading,
      source: 'default',
      lastUpdated: null,
      isUsingFallback: true,
    }
  }

  return {
    rate: data.rate,
    isLoading: false,
    source: data.source,
    lastUpdated: data.lastUpdated,
    isUsingFallback,
  }
}
