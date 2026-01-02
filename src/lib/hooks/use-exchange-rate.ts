import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ExchangeRateResult } from '@/lib/api/exchange-rate'
import {
  DEFAULT_EXCHANGE_RATE,
  fetchExchangeRate,
} from '@/lib/api/exchange-rate'
import { queryKeys } from '@/lib/query-keys'

// Always call fetchExchangeRate - let localStorage handle caching (24h TTL)
// This ensures the localStorage timestamp is always checked on page load
const STALE_TIME = 0
// Short GC time since localStorage is the primary cache
const GC_TIME = 5 * 60 * 1000 // 5 minutes

/**
 * Hook to fetch USD to VND exchange rate
 *
 * Features:
 * - Automatic caching in localStorage (24h TTL)
 * - localStorage is the single source of truth for caching
 * - Fallback to default rate if API unavailable
 * - Rate refetched when localStorage cache expires (after 24h)
 */
export function useExchangeRate() {
  return useQuery<ExchangeRateResult>({
    queryKey: queryKeys.exchangeRate.usdVnd,
    queryFn: fetchExchangeRate,
    staleTime: STALE_TIME, // 0 = always call queryFn, let localStorage handle TTL
    gcTime: GC_TIME,
    retry: 1,
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
        description:
          'Could not fetch live USD/VND rate. Amounts may be approximate.',
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
