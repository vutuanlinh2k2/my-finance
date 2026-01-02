/**
 * Convert USD amount to VND
 * @param usdAmount - Amount in USD
 * @param exchangeRate - USD to VND exchange rate
 * @returns Amount in VND
 */
export function convertUsdToVnd(usdAmount: number, exchangeRate: number): number {
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
  previous: number
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
  includeSign = true
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
