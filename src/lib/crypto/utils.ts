/**
 * Convert USD amount to VND
 * @param usdAmount - Amount in USD
 * @param exchangeRate - USD to VND exchange rate
 * @returns Amount in VND
 */
// ============================================
// Balance Calculation Utilities
// ============================================

import type { Tag } from '@/lib/api/tags'
import type { CryptoTransaction } from './types'

// ============================================
// Tag Validation Utilities
// ============================================

/**
 * Find an "Investing" or "Investments" tag by type (case-insensitive search)
 * @param tags - Array of tags to search
 * @param type - Tag type ('expense' or 'income')
 * @returns The tag if found, null otherwise
 */
export function findInvestingTag(
  tags: Array<Tag>,
  type: 'expense' | 'income',
): Tag | null {
  const lowerNames = ['investing', 'investments']
  return (
    tags.find(
      (tag) =>
        tag.type === type &&
        lowerNames.includes(tag.name.toLowerCase()),
    ) ?? null
  )
}

/**
 * Check if an "Investing" tag exists for the given type
 * @param tags - Array of tags to search
 * @param type - Tag type ('expense' or 'income')
 * @returns True if the tag exists
 */
export function hasInvestingTag(
  tags: Array<Tag>,
  type: 'expense' | 'income',
): boolean {
  return findInvestingTag(tags, type) !== null
}

export function convertUsdToVnd(
  usdAmount: number,
  exchangeRate: number,
): number {
  return Math.round(usdAmount * exchangeRate)
}

/**
 * Format crypto amount with appropriate decimal places
 * Different cryptocurrencies have different precision requirements
 * @param amount - The crypto amount
 * @param symbol - The crypto symbol (e.g., 'BTC', 'ETH')
 * @returns Formatted string representation
 */
export function formatCryptoAmount(amount: number, symbol?: string): string {
  if (amount === 0) return '0'

  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''

  // Determine decimal places based on amount size
  let decimals: number

  if (absAmount >= 1000) {
    // Large amounts: show 2 decimals
    decimals = 2
  } else if (absAmount >= 1) {
    // Normal amounts: show 4 decimals
    decimals = 4
  } else if (absAmount >= 0.0001) {
    // Small amounts: show 6 decimals
    decimals = 6
  } else {
    // Very small amounts: show 8 decimals (satoshi level)
    decimals = 8
  }

  // Format the number
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })

  // Append symbol if provided
  if (symbol) {
    return `${sign}${formatted} ${symbol.toUpperCase()}`
  }

  return `${sign}${formatted}`
}

/**
 * Parse a crypto amount string to number
 * Handles various input formats
 * @param value - String value to parse
 * @returns Parsed number or null if invalid
 */
export function parseCryptoAmount(value: string): number | null {
  if (!value || value.trim() === '') {
    return null
  }

  // Remove commas and spaces
  const cleaned = value.replace(/,/g, '').replace(/\s/g, '')

  const parsed = parseFloat(cleaned)

  if (isNaN(parsed)) {
    return null
  }

  return parsed
}

/**
 * Calculate percentage change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change
 */
export function calculatePercentageChange(
  current: number,
  previous: number,
): number {
  if (previous === 0) {
    return current > 0 ? 100 : current < 0 ? -100 : 0
  }
  return ((current - previous) / Math.abs(previous)) * 100
}

/**
 * Format percentage for display
 * @param percentage - Percentage value
 * @param includeSign - Whether to include +/- sign
 * @returns Formatted percentage string
 */
export function formatPercentage(
  percentage: number,
  includeSign = true,
): string {
  const sign = includeSign && percentage > 0 ? '+' : ''
  return `${sign}${percentage.toFixed(2)}%`
}

/**
 * Get color class for price change
 * @param change - Price change value
 * @returns Tailwind color class
 */
export function getPriceChangeColor(change: number): string {
  if (change > 0) return 'text-emerald-600 dark:text-emerald-400'
  if (change < 0) return 'text-red-600 dark:text-red-400'
  return 'text-muted-foreground'
}

/**
 * Truncate wallet address for display
 * @param address - Full wallet address
 * @param chars - Number of characters to show at start and end
 * @returns Truncated address (e.g., "0x1234...5678")
 */
export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) {
    return address
  }
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Format USD value in compact form
 * @param amount - USD amount
 * @returns Formatted string (e.g., "$1.2B", "$500M", "$50K")
 */
export function formatUsdCompact(amount: number): string {
  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''

  if (absAmount >= 1_000_000_000_000) {
    return `${sign}$${(absAmount / 1_000_000_000_000).toFixed(2)}T`
  }
  if (absAmount >= 1_000_000_000) {
    return `${sign}$${(absAmount / 1_000_000_000).toFixed(2)}B`
  }
  if (absAmount >= 1_000_000) {
    return `${sign}$${(absAmount / 1_000_000).toFixed(2)}M`
  }
  if (absAmount >= 1_000) {
    return `${sign}$${(absAmount / 1_000).toFixed(2)}K`
  }
  return `${sign}$${absAmount.toFixed(2)}`
}

/**
 * Format USD price with appropriate precision
 * @param price - USD price
 * @returns Formatted string
 */
export function formatUsdPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  if (price >= 0.01) {
    return `$${price.toFixed(4)}`
  }
  if (price >= 0.0001) {
    return `$${price.toFixed(6)}`
  }
  return `$${price.toFixed(8)}`
}

/**
 * Calculate the balance of a specific asset in a specific storage (or all storages)
 *
 * @param assetId - The asset ID to calculate balance for
 * @param storageId - Specific storage ID (null = all storages combined)
 * @param transactions - All user's crypto transactions
 * @returns The calculated balance
 */
export function calculateAssetBalance(
  assetId: string,
  storageId: string | null,
  transactions: Array<CryptoTransaction>,
): number {
  let balance = 0

  for (const tx of transactions) {
    switch (tx.type) {
      case 'buy':
        // Adds amount to asset balance in storage_id
        if (
          tx.assetId === assetId &&
          tx.amount != null &&
          (!storageId || tx.storageId === storageId)
        ) {
          balance += tx.amount
        }
        break

      case 'sell':
        // Subtracts amount from asset balance in storage_id
        if (
          tx.assetId === assetId &&
          tx.amount != null &&
          (!storageId || tx.storageId === storageId)
        ) {
          balance -= tx.amount
        }
        break

      case 'transfer_between':
        // Moves amount between storages (net zero for total balance)
        if (tx.assetId === assetId && tx.amount != null) {
          if (storageId === tx.fromStorageId) {
            balance -= tx.amount // Leaving from_storage
          } else if (storageId === tx.toStorageId) {
            balance += tx.amount // Arriving at to_storage
          }
          // If storageId is null (total), net effect is 0
        }
        break

      case 'swap':
        // Decreases from_asset, increases to_asset in same storage
        if (!storageId || tx.storageId === storageId) {
          if (tx.fromAssetId === assetId && tx.fromAmount != null) {
            balance -= tx.fromAmount // Swapping away
          }
          if (tx.toAssetId === assetId && tx.toAmount != null) {
            balance += tx.toAmount // Receiving
          }
        }
        break

      case 'transfer_in':
        // Adds amount to asset balance in storage_id
        if (
          tx.assetId === assetId &&
          tx.amount != null &&
          (!storageId || tx.storageId === storageId)
        ) {
          balance += tx.amount
        }
        break

      case 'transfer_out':
        // Subtracts amount from asset balance in storage_id
        if (
          tx.assetId === assetId &&
          tx.amount != null &&
          (!storageId || tx.storageId === storageId)
        ) {
          balance -= tx.amount
        }
        break
    }
  }

  return balance
}

/**
 * Get the available balance of an asset in a specific storage
 * This is used for validation in forms (e.g., sell, transfer_out)
 *
 * @param assetId - The asset ID
 * @param storageId - The storage ID
 * @param transactions - All user's crypto transactions
 * @returns The available balance
 */
export function getAvailableBalance(
  assetId: string,
  storageId: string,
  transactions: Array<CryptoTransaction>,
): number {
  return calculateAssetBalance(assetId, storageId, transactions)
}

/**
 * Calculate the total VND value in a specific storage
 *
 * @param storageId - The storage ID
 * @param transactions - All user's crypto transactions
 * @param prices - Map of asset ID to USD price
 * @param exchangeRate - USD to VND exchange rate
 * @returns Total VND value in the storage
 */
export function calculateStorageValue(
  storageId: string,
  transactions: Array<CryptoTransaction>,
  prices: Map<string, number>,
  exchangeRate: number,
): number {
  // Get all unique asset IDs from transactions
  const assetIds = new Set<string>()
  for (const tx of transactions) {
    if (tx.assetId) assetIds.add(tx.assetId)
    if (tx.fromAssetId) assetIds.add(tx.fromAssetId)
    if (tx.toAssetId) assetIds.add(tx.toAssetId)
  }

  // Calculate total value
  let totalValue = 0
  for (const assetId of assetIds) {
    const balance = calculateAssetBalance(assetId, storageId, transactions)
    const priceUsd = prices.get(assetId) ?? 0
    totalValue += balance * priceUsd * exchangeRate
  }

  return totalValue
}

/**
 * Calculate the total portfolio value in VND
 *
 * @param transactions - All user's crypto transactions
 * @param prices - Map of asset ID to USD price
 * @param exchangeRate - USD to VND exchange rate
 * @returns Total portfolio VND value
 */
export function calculatePortfolioValue(
  transactions: Array<CryptoTransaction>,
  prices: Map<string, number>,
  exchangeRate: number,
): number {
  // Get all unique asset IDs from transactions
  const assetIds = new Set<string>()
  for (const tx of transactions) {
    if (tx.assetId) assetIds.add(tx.assetId)
    if (tx.fromAssetId) assetIds.add(tx.fromAssetId)
    if (tx.toAssetId) assetIds.add(tx.toAssetId)
  }

  // Calculate total value (across all storages)
  let totalValue = 0
  for (const assetId of assetIds) {
    const balance = calculateAssetBalance(assetId, null, transactions)
    const priceUsd = prices.get(assetId) ?? 0
    totalValue += balance * priceUsd * exchangeRate
  }

  return totalValue
}

/**
 * Get all balances per asset per storage
 * Useful for showing asset distribution across storages
 *
 * @param transactions - All user's crypto transactions
 * @returns Map of assetId -> Map of storageId -> balance
 */
export function getAllBalances(
  transactions: Array<CryptoTransaction>,
): Map<string, Map<string, number>> {
  const balances = new Map<string, Map<string, number>>()

  // Get all unique asset IDs and storage IDs
  const assetIds = new Set<string>()
  const storageIds = new Set<string>()

  for (const tx of transactions) {
    if (tx.assetId) assetIds.add(tx.assetId)
    if (tx.fromAssetId) assetIds.add(tx.fromAssetId)
    if (tx.toAssetId) assetIds.add(tx.toAssetId)
    if (tx.storageId) storageIds.add(tx.storageId)
    if (tx.fromStorageId) storageIds.add(tx.fromStorageId)
    if (tx.toStorageId) storageIds.add(tx.toStorageId)
  }

  // Calculate balance for each asset in each storage
  for (const assetId of assetIds) {
    const storageBalances = new Map<string, number>()
    for (const storageId of storageIds) {
      const balance = calculateAssetBalance(assetId, storageId, transactions)
      if (balance !== 0) {
        storageBalances.set(storageId, balance)
      }
    }
    if (storageBalances.size > 0) {
      balances.set(assetId, storageBalances)
    }
  }

  return balances
}
