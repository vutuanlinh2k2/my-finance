import type {
  DashboardTotals,
  NetWorthSegment,
  NetWorthSnapshot,
  TimeRange,
} from './types'

/**
 * Mock dashboard totals for summary cards
 */
export const mockDashboardTotals: DashboardTotals = {
  netWorth: 150_000_000,
  bankBalance: 100_000_000,
  cryptoValue: 50_000_000,
  monthlyIncome: 25_000_000,
  monthlyExpenses: 18_000_000,
}

/**
 * Mock pie chart segments
 */
export const mockNetWorthSegments: Array<NetWorthSegment> = [
  {
    id: 'bank',
    name: 'Bank Balance',
    value: 100_000_000,
    percentage: 66.67,
    color: '#10b981', // emerald
  },
  {
    id: 'crypto',
    name: 'Crypto Investment',
    value: 50_000_000,
    percentage: 33.33,
    color: '#3b82f6', // blue
  },
]

/**
 * Generate mock historical snapshots for different time ranges
 */
function generateMockSnapshots(range: TimeRange): Array<NetWorthSnapshot> {
  const now = new Date()
  const snapshots: Array<NetWorthSnapshot> = []

  let days: number
  switch (range) {
    case '1m':
      days = 30
      break
    case '1y':
      days = 365
      break
    case 'all':
      days = 730 // 2 years
      break
  }

  // Generate daily snapshots going back in time
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Simulate gradual growth with some variation
    const progress = 1 - i / days
    const baseBank = 80_000_000 + progress * 20_000_000
    const baseCrypto = 30_000_000 + progress * 20_000_000

    // Add some random variation (+-10%)
    const bankVariation = baseBank * (0.9 + Math.random() * 0.2)
    const cryptoVariation = baseCrypto * (0.9 + Math.random() * 0.2)

    const bankBalance = Math.round(bankVariation)
    const cryptoValue = Math.round(cryptoVariation)

    snapshots.push({
      date: date.toISOString().split('T')[0],
      bankBalance,
      cryptoValue,
      totalNetWorth: bankBalance + cryptoValue,
    })
  }

  // For 1y range, sample every ~7 days to reduce data points
  if (range === '1y') {
    return snapshots.filter(
      (_, index) => index % 7 === 0 || index === snapshots.length - 1,
    )
  }

  // For all range, sample every ~14 days
  if (range === 'all') {
    return snapshots.filter(
      (_, index) => index % 14 === 0 || index === snapshots.length - 1,
    )
  }

  return snapshots
}

/**
 * Get mock snapshots for a specific time range
 */
export function getMockNetWorthHistory(range: TimeRange): Array<NetWorthSnapshot> {
  return generateMockSnapshots(range)
}
