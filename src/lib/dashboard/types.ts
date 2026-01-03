/**
 * Time range options for the net worth history chart
 */
export type TimeRange = '1m' | '1y' | 'all'

/**
 * Single data point for the net worth history chart
 */
export interface NetWorthSnapshot {
  date: string
  bankBalance: number
  cryptoValue: number
  totalNetWorth: number
}

/**
 * Dashboard totals for the summary cards
 */
export interface DashboardTotals {
  netWorth: number
  bankBalance: number
  cryptoValue: number
  monthlyIncome: number
  monthlyExpenses: number
}

/**
 * Pie chart segment data
 */
export interface NetWorthSegment {
  id: string
  name: string
  value: number
  percentage: number
  color: string
}
