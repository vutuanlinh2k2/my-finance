/**
 * Crypto Transaction Types
 * Matches the enum defined in the database
 */
export type CryptoTransactionType =
  | 'buy'
  | 'sell'
  | 'transfer_between'
  | 'swap'
  | 'transfer_in'
  | 'transfer_out'

/**
 * Storage type for crypto wallets and exchanges
 */
export type StorageType = 'cex' | 'wallet'

/**
 * CoinGecko API Types
 */
export interface CoinGeckoAssetMetadata {
  id: string
  symbol: string
  name: string
  image: {
    thumb: string
    small: string
    large: string
  }
}

export interface CoinGeckoPrice {
  id: string
  usd: number
  usd_24h_change?: number
  usd_24h_vol?: number
  usd_market_cap?: number
  last_updated_at?: number
}

export interface CoinGeckoPriceMap {
  [coinId: string]: {
    usd: number
    usd_24h_change?: number
    usd_24h_vol?: number
    usd_market_cap?: number
    last_updated_at?: number
  }
}

export interface CoinGeckoMarketDataPoint {
  timestamp: number
  price: number
}

export interface CoinGeckoMarketData {
  prices: Array<[number, number]> // [timestamp, price]
  market_caps: Array<[number, number]>
  total_volumes: Array<[number, number]>
}

/**
 * Crypto Asset from database
 */
export interface CryptoAsset {
  id: string
  userId: string
  coingeckoId: string
  name: string
  symbol: string
  iconUrl: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Input for creating a crypto asset
 */
export interface CryptoAssetInput {
  coingeckoId: string
  name: string
  symbol: string
  iconUrl?: string
}

/**
 * Crypto asset with live price data (for display)
 */
export interface CryptoAssetWithPrice extends CryptoAsset {
  currentPriceUsd: number
  marketCapUsd: number
  priceChange24h: number
  priceChange7d: number
  priceChange30d: number
  priceChange60d: number
  priceChange1y: number
  balance: number // From transactions (0 until Phase 4)
  valueUsd: number // balance * currentPriceUsd
}

/**
 * Crypto Storage (will be extended in Phase 3)
 */
export interface CryptoStorageBase {
  id: string
  type: StorageType
  name: string
  address?: string
  explorerUrl?: string
}

/**
 * Crypto Transaction (will be extended in Phase 4)
 */
export interface CryptoTransactionBase {
  id: string
  type: CryptoTransactionType
  date: string
  txId?: string
  txExplorerUrl?: string
}
