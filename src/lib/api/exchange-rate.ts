const EXCHANGE_RATE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD'
const CACHE_KEY = 'exchange_rate_usd_vnd'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// Default fallback rate if API and cache both fail
export const DEFAULT_EXCHANGE_RATE = 25000

export interface ExchangeRateCache {
  rate: number
  timestamp: number
}

export interface ExchangeRateResult {
  rate: number
  source: 'api' | 'cache' | 'fallback'
  lastUpdated: Date | null
}

/**
 * Get cached exchange rate from localStorage
 */
function getCachedRate(): ExchangeRateCache | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const parsed = JSON.parse(cached) as ExchangeRateCache
    if (typeof parsed.rate !== 'number' || typeof parsed.timestamp !== 'number') {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

/**
 * Save exchange rate to localStorage cache
 */
function setCachedRate(rate: number): void {
  try {
    const cache: ExchangeRateCache = {
      rate,
      timestamp: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Check if cached rate is still valid (within TTL)
 */
function isCacheValid(cache: ExchangeRateCache): boolean {
  return Date.now() - cache.timestamp < CACHE_TTL_MS
}

/**
 * Fetch USD to VND exchange rate from API
 * Uses caching strategy:
 * 1. If cache is valid (< 24h), return cached rate
 * 2. If cache is stale, try to fetch fresh rate
 * 3. If API fails with stale cache, return stale cache
 * 4. If no cache and API fails, return default fallback
 */
export async function fetchExchangeRate(): Promise<ExchangeRateResult> {
  const cached = getCachedRate()

  // Return valid cache immediately
  if (cached && isCacheValid(cached)) {
    return {
      rate: cached.rate,
      source: 'cache',
      lastUpdated: new Date(cached.timestamp),
    }
  }

  // Try to fetch fresh rate
  try {
    const response = await fetch(EXCHANGE_RATE_API_URL)

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`)
    }

    const data = await response.json()
    const rate = data.rates?.VND

    if (typeof rate !== 'number' || rate <= 0) {
      throw new Error('Invalid rate received from API')
    }

    // Cache the fresh rate locally
    setCachedRate(rate)

    return {
      rate,
      source: 'api',
      lastUpdated: new Date(),
    }
  } catch (error) {
    console.warn('Failed to fetch exchange rate:', error)

    // Return stale cache if available
    if (cached) {
      return {
        rate: cached.rate,
        source: 'cache',
        lastUpdated: new Date(cached.timestamp),
      }
    }

    // Return default fallback as last resort
    return {
      rate: DEFAULT_EXCHANGE_RATE,
      source: 'fallback',
      lastUpdated: null,
    }
  }
}

/**
 * Clear the exchange rate cache (useful for testing)
 */
export function clearExchangeRateCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // Silently fail
  }
}
