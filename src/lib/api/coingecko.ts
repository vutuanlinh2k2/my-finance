import type {
  CoinGeckoAssetMetadata,
  CoinGeckoMarketData,
  CoinGeckoPriceMap,
} from '@/lib/crypto/types'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

/**
 * Custom error class for CoinGecko API errors
 */
export class CoinGeckoError extends Error {
  constructor(
    message: string,
    public status?: number,
    public isRateLimited: boolean = false
  ) {
    super(message)
    this.name = 'CoinGeckoError'
  }
}

/**
 * Handle API response and throw appropriate errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 429) {
    throw new CoinGeckoError(
      'Rate limit exceeded. Please try again later.',
      429,
      true
    )
  }

  if (!response.ok) {
    throw new CoinGeckoError(
      `CoinGecko API error: ${response.statusText}`,
      response.status
    )
  }

  return response.json()
}

/**
 * Fetch asset metadata from CoinGecko
 * @param id - CoinGecko coin ID (e.g., 'bitcoin', 'ethereum')
 * @returns Asset metadata including name, symbol, and images
 */
export async function fetchCoinGeckoAssetMetadata(
  id: string
): Promise<CoinGeckoAssetMetadata> {
  const url = `${COINGECKO_API_URL}/coins/${encodeURIComponent(id)}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`

  const response = await fetch(url)
  const data = await handleResponse<{
    id: string
    symbol: string
    name: string
    image: {
      thumb: string
      small: string
      large: string
    }
  }>(response)

  return {
    id: data.id,
    symbol: data.symbol.toUpperCase(),
    name: data.name,
    image: data.image,
  }
}

/**
 * Fetch current prices for multiple coins in batch
 * @param ids - Array of CoinGecko coin IDs
 * @returns Map of coin ID to price data
 */
export async function fetchCoinGeckoPrices(
  ids: Array<string>
): Promise<CoinGeckoPriceMap> {
  if (ids.length === 0) {
    return {}
  }

  const url = `${COINGECKO_API_URL}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&include_last_updated_at=true`

  const response = await fetch(url)
  const data = await handleResponse<CoinGeckoPriceMap>(response)

  return data
}

/**
 * Fetch historical market data for a coin
 * @param id - CoinGecko coin ID
 * @param days - Number of days of historical data (1, 7, 14, 30, 90, 180, 365, max)
 * @returns Historical price, market cap, and volume data
 */
export async function fetchCoinGeckoMarketData(
  id: string,
  days: number | 'max' = 30
): Promise<CoinGeckoMarketData> {
  const url = `${COINGECKO_API_URL}/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}`

  const response = await fetch(url)
  const data = await handleResponse<CoinGeckoMarketData>(response)

  return data
}

/**
 * Search for coins by name or symbol
 * @param query - Search query
 * @returns Array of matching coins
 */
export async function searchCoinGeckoCoins(
  query: string
): Promise<Array<{ id: string; name: string; symbol: string; thumb: string }>> {
  if (!query || query.length < 2) {
    return []
  }

  const url = `${COINGECKO_API_URL}/search?query=${encodeURIComponent(query)}`

  const response = await fetch(url)
  const data = await handleResponse<{
    coins: Array<{
      id: string
      name: string
      symbol: string
      thumb: string
    }>
  }>(response)

  return data.coins.slice(0, 10) // Limit to top 10 results
}
