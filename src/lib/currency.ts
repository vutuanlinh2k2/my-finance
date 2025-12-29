/**
 * Format VND currency with full precision
 * Example: 150000000 → "150.000.000 ₫"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

/**
 * Format VND in compact notation (K/M/B)
 * Examples:
 *   500 → "500đ"
 *   15000 → "15K"
 *   1500000 → "1.5M"
 *   150000000 → "150M"
 *   1500000000 → "1.5B"
 */
export function formatCompact(amount: number): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''

  if (abs < 1000) {
    return `${sign}${abs}đ`
  }
  if (abs < 1_000_000) {
    const val = abs / 1000
    return `${sign}${val % 1 === 0 ? val : val.toFixed(1)}K`
  }
  if (abs < 1_000_000_000) {
    const val = abs / 1_000_000
    return `${sign}${val % 1 === 0 ? val : val.toFixed(1)}M`
  }
  const val = abs / 1_000_000_000
  return `${sign}${val % 1 === 0 ? val : val.toFixed(1)}B`
}
