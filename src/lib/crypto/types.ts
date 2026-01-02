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
 * Crypto Storage from database
 */
export interface CryptoStorage {
  id: string
  userId: string
  type: StorageType
  name: string
  address: string | null
  explorerUrl: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Input for creating a crypto storage
 */
export interface CryptoStorageInput {
  type: StorageType
  name: string
  address?: string
  explorerUrl?: string
}

/**
 * Input for updating a crypto storage
 */
export interface CryptoStorageUpdate {
  name?: string
  address?: string
  explorerUrl?: string
}

/**
 * Crypto Storage with calculated value (for display)
 */
export interface CryptoStorageWithValue extends CryptoStorage {
  totalValueVnd: number
  percentage: number
  color: string
}

/**
 * Base Crypto Transaction fields (common to all types)
 */
export interface CryptoTransactionBase {
  id: string
  userId: string
  type: CryptoTransactionType
  date: string
  txId: string | null
  txExplorerUrl: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Full Crypto Transaction from database
 * Contains all possible fields, with type-specific fields being nullable
 */
export interface CryptoTransaction extends CryptoTransactionBase {
  // Asset & amount (for buy, sell, transfer_between, transfer_in, transfer_out)
  assetId: string | null
  amount: number | null

  // Storage (for buy, sell, swap, transfer_in, transfer_out)
  storageId: string | null

  // Buy/Sell specific
  fiatAmount: number | null
  linkedTransactionId: string | null

  // Transfer Between specific
  fromStorageId: string | null
  toStorageId: string | null

  // Swap specific
  fromAssetId: string | null
  fromAmount: number | null
  toAssetId: string | null
  toAmount: number | null
}

/**
 * Crypto Transaction with joined data for display
 */
export interface CryptoTransactionWithDetails extends CryptoTransaction {
  // Joined asset data
  asset?: {
    id: string
    name: string
    symbol: string
    iconUrl: string | null
  } | null
  // Joined from/to assets for swap
  fromAsset?: {
    id: string
    name: string
    symbol: string
    iconUrl: string | null
  } | null
  toAsset?: {
    id: string
    name: string
    symbol: string
    iconUrl: string | null
  } | null
  // Joined storage data
  storage?: {
    id: string
    name: string
    type: StorageType
  } | null
  // Joined from/to storages for transfer_between
  fromStorage?: {
    id: string
    name: string
    type: StorageType
  } | null
  toStorage?: {
    id: string
    name: string
    type: StorageType
  } | null
}

/**
 * Transaction filter options
 */
export interface CryptoTransactionFilters {
  types?: Array<CryptoTransactionType>
  startDate?: string
  endDate?: string
  assetId?: string
  storageId?: string
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number
  pageSize: number
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: Array<T>
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================
// Input Types for Creating Transactions
// ============================================

/**
 * Common fields for all transaction inputs
 */
interface TransactionInputBase {
  date: string
  txId?: string
  txExplorerUrl?: string
}

/**
 * Buy transaction input
 */
export interface BuyTransactionInput extends TransactionInputBase {
  type: 'buy'
  assetId: string
  amount: number
  storageId: string
  fiatAmount: number
}

/**
 * Sell transaction input
 */
export interface SellTransactionInput extends TransactionInputBase {
  type: 'sell'
  assetId: string
  amount: number
  storageId: string
  fiatAmount: number
}

/**
 * Transfer Between transaction input
 */
export interface TransferBetweenTransactionInput extends TransactionInputBase {
  type: 'transfer_between'
  assetId: string
  amount: number
  fromStorageId: string
  toStorageId: string
}

/**
 * Swap transaction input
 */
export interface SwapTransactionInput extends TransactionInputBase {
  type: 'swap'
  fromAssetId: string
  fromAmount: number
  toAssetId: string
  toAmount: number
  storageId: string
}

/**
 * Transfer In transaction input
 */
export interface TransferInTransactionInput extends TransactionInputBase {
  type: 'transfer_in'
  assetId: string
  amount: number
  storageId: string
}

/**
 * Transfer Out transaction input
 */
export interface TransferOutTransactionInput extends TransactionInputBase {
  type: 'transfer_out'
  assetId: string
  amount: number
  storageId: string
}

/**
 * Union type of all transaction inputs
 */
export type CryptoTransactionInput =
  | BuyTransactionInput
  | SellTransactionInput
  | TransferBetweenTransactionInput
  | SwapTransactionInput
  | TransferInTransactionInput
  | TransferOutTransactionInput

/**
 * Update input for transactions (partial fields)
 */
export interface CryptoTransactionUpdate {
  date?: string
  txId?: string | null
  txExplorerUrl?: string | null
  amount?: number
  fiatAmount?: number
  assetId?: string
  storageId?: string
  fromStorageId?: string
  toStorageId?: string
  fromAssetId?: string
  fromAmount?: number
  toAssetId?: string
  toAmount?: number
}
