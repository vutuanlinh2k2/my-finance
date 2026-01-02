import { useQuery } from '@tanstack/react-query'
import type {
  CoinGeckoAssetMetadata,
  CoinGeckoMarketData,
  CoinGeckoPriceMap,
} from '@/lib/crypto/types'
import type { CoinGeckoMarketCoin } from '@/lib/api/coingecko'
import {
  fetchCoinGeckoAssetMetadata,
  fetchCoinGeckoMarketData,
  fetchCoinGeckoMarkets,
  fetchCoinGeckoPrices,
  searchCoinGeckoCoins,
} from '@/lib/api/coingecko'
import { queryKeys } from '@/lib/query-keys'

// Stale times for different data types
const METADATA_STALE_TIME = 24 * 60 * 60 * 1000 // 24 hours (rarely changes)
const PRICE_STALE_TIME = 60 * 1000 // 60 seconds (near real-time)
const MARKET_DATA_STALE_TIME = 5 * 60 * 1000 // 5 minutes
const SEARCH_STALE_TIME = 5 * 60 * 1000 // 5 minutes

/**
 * Hook to fetch asset metadata from CoinGecko
 * @param id - CoinGecko coin ID (e.g., 'bitcoin', 'ethereum')
 * @param enabled - Whether the query should be enabled
 */
export function useCoinGeckoAsset(id: string | undefined, enabled = true) {
  return useQuery<CoinGeckoAssetMetadata>({
    queryKey: queryKeys.coingecko.asset(id ?? ''),
    queryFn: () => fetchCoinGeckoAssetMetadata(id!),
    enabled: enabled && !!id,
    staleTime: METADATA_STALE_TIME,
    retry: (failureCount, error) => {
      // Don't retry on rate limit errors
      if (error instanceof Error && error.message.includes('Rate limit')) {
        return false
      }
      return failureCount < 2
    },
  })
}

/**
 * Hook to fetch current prices for multiple coins
 * @param ids - Array of CoinGecko coin IDs
 * @param enabled - Whether the query should be enabled
 */
export function useCryptoPrices(ids: Array<string>, enabled = true) {
  return useQuery<CoinGeckoPriceMap>({
    queryKey: queryKeys.coingecko.prices(ids),
    queryFn: () => fetchCoinGeckoPrices(ids),
    enabled: enabled && ids.length > 0,
    staleTime: PRICE_STALE_TIME,
    refetchInterval: PRICE_STALE_TIME, // Auto-refresh prices
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('Rate limit')) {
        return false
      }
      return failureCount < 2
    },
  })
}

/**
 * Hook to fetch market data with extended price changes for multiple coins
 * @param ids - Array of CoinGecko coin IDs
 * @param enabled - Whether the query should be enabled
 */
export function useCryptoMarkets(ids: Array<string>, enabled = true) {
  return useQuery<Array<CoinGeckoMarketCoin>>({
    queryKey: queryKeys.coingecko.markets(ids),
    queryFn: () => fetchCoinGeckoMarkets(ids),
    enabled: enabled && ids.length > 0,
    staleTime: PRICE_STALE_TIME,
    refetchInterval: PRICE_STALE_TIME, // Auto-refresh prices
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('Rate limit')) {
        return false
      }
      return failureCount < 2
    },
  })
}

/**
 * Hook to fetch historical market data for a coin
 * @param id - CoinGecko coin ID
 * @param days - Number of days of historical data
 * @param enabled - Whether the query should be enabled
 */
export function useCoinGeckoMarketData(
  id: string | undefined,
  days: number | 'max' = 30,
  enabled = true,
) {
  return useQuery<CoinGeckoMarketData>({
    queryKey: queryKeys.coingecko.marketData(id ?? '', days),
    queryFn: () => fetchCoinGeckoMarketData(id!, days),
    enabled: enabled && !!id,
    staleTime: MARKET_DATA_STALE_TIME,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('Rate limit')) {
        return false
      }
      return failureCount < 2
    },
  })
}

/**
 * Hook to search for coins on CoinGecko
 * @param query - Search query (must be at least 2 characters)
 * @param enabled - Whether the query should be enabled
 */
export function useCoinGeckoSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.coingecko.search(query),
    queryFn: () => searchCoinGeckoCoins(query),
    enabled: enabled && query.length >= 2,
    staleTime: SEARCH_STALE_TIME,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('Rate limit')) {
        return false
      }
      return failureCount < 2
    },
  })
}
