/**
 * Dashboard Types
 *
 * Note: NetWorthSnapshot and TimeRange are defined in @/lib/api/dashboard
 * and re-exported from @/lib/hooks/use-dashboard for convenience.
 */

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
