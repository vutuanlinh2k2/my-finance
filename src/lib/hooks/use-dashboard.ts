import { useQuery } from '@tanstack/react-query'
import type {
  AllTimeTotals,
  MonthlyTotals,
  NetWorthSnapshot,
  TimeRange,
} from '@/lib/api/dashboard'
import {
  fetchAllTimeTotals,
  fetchMonthlyTotals,
  fetchNetWorthSnapshots,
} from '@/lib/api/dashboard'
import { queryKeys } from '@/lib/query-keys'

// Stale times for dashboard queries
const STALE_TIME = {
  // Totals change when transactions are added, but we have cache invalidation
  // for that. Use 2 min stale time to avoid unnecessary refetches on navigation.
  totals: 2 * 60 * 1000, // 2 minutes
  // Snapshots only update once daily via cron job, so 5 min is reasonable
  history: 5 * 60 * 1000, // 5 minutes
}

/**
 * Hook to fetch all-time totals for the current user
 * Returns total income, total expenses, and bank balance
 */
export function useAllTimeTotals() {
  return useQuery({
    queryKey: queryKeys.dashboard.allTimeTotals,
    queryFn: fetchAllTimeTotals,
    staleTime: STALE_TIME.totals,
  })
}

/**
 * Hook to fetch monthly totals for a specific month
 * @param year - Full year (e.g., 2026)
 * @param month - Month (1-12, NOT 0-indexed)
 */
export function useMonthlyTotals(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.dashboard.monthlyTotals(year, month),
    queryFn: () => fetchMonthlyTotals(year, month),
    staleTime: STALE_TIME.totals,
  })
}

/**
 * Hook to fetch current month's totals
 * Automatically uses the current year and month
 */
export function useCurrentMonthTotals() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // Convert from 0-indexed to 1-indexed

  return useMonthlyTotals(year, month)
}

export interface DashboardData {
  allTimeTotals: AllTimeTotals | undefined
  monthlyTotals: MonthlyTotals | undefined
  isLoading: boolean
  isError: boolean
}

/**
 * Combined hook to fetch all dashboard data in one place
 * Returns all-time totals and current month's totals
 */
export function useDashboardData(): DashboardData {
  const allTimeQuery = useAllTimeTotals()
  const monthlyQuery = useCurrentMonthTotals()

  return {
    allTimeTotals: allTimeQuery.data,
    monthlyTotals: monthlyQuery.data,
    isLoading: allTimeQuery.isLoading || monthlyQuery.isLoading,
    isError: allTimeQuery.isError || monthlyQuery.isError,
  }
}

/**
 * Hook to fetch net worth history for the chart
 * @param range - Time range: '1m' (1 month), '1y' (1 year), or 'all'
 */
export function useNetWorthHistory(range: TimeRange) {
  return useQuery({
    queryKey: queryKeys.dashboard.netWorthHistory(range),
    queryFn: () => fetchNetWorthSnapshots(range),
    staleTime: STALE_TIME.history,
  })
}

// Re-export types for convenience
export type { AllTimeTotals, MonthlyTotals, NetWorthSnapshot, TimeRange }
