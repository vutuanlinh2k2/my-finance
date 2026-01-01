import { useQueries, useQuery } from '@tanstack/react-query'
import type { Tag } from '@/lib/api/tags'
import type { Transaction } from '@/lib/api/transactions'
import type { TagDistribution, TransactionType } from '@/lib/reports/types'
import { fetchTransactionsByMonth } from '@/lib/api/transactions'
import { queryKeys } from '@/lib/query-keys'
import {
  calculateTagDistribution,
  calculateTotal,
  filterTransactionsByTag,
} from '@/lib/reports/utils'

/**
 * Result type for distribution hooks
 */
export interface DistributionResult {
  distributions: Array<TagDistribution>
  total: number
  transactions: Array<Transaction>
}

/**
 * Result type for yearly distribution with monthly breakdown
 */
export interface YearlyDistributionResult extends DistributionResult {
  transactionsByMonth: Array<{
    month: number
    transactions: Array<Transaction>
  }>
}

/**
 * Hook for monthly report distribution
 * Reuses transactions.byMonth query with select transform
 */
export function useMonthlyReportDistribution(
  year: number,
  month: number,
  type: TransactionType,
  tags: Array<Tag>,
) {
  return useQuery({
    queryKey: queryKeys.transactions.byMonth(year, month),
    queryFn: () => fetchTransactionsByMonth(year, month),
    select: (transactions): DistributionResult => ({
      distributions: calculateTagDistribution(transactions, tags, type),
      total: calculateTotal(transactions, type),
      transactions,
    }),
    enabled: tags.length >= 0, // Always enabled, even with empty tags
  })
}

/**
 * Hook for yearly report distribution
 * Fetches all 12 months in parallel and aggregates
 */
export function useYearlyReportDistribution(
  year: number,
  type: TransactionType,
  tags: Array<Tag>,
) {
  const monthQueries = useQueries({
    queries: Array.from({ length: 12 }, (_, month) => ({
      queryKey: queryKeys.transactions.byMonth(year, month),
      queryFn: () => fetchTransactionsByMonth(year, month),
    })),
    combine: (results) => {
      const isLoading = results.some((r) => r.isLoading)
      const isPending = results.some((r) => r.isPending)
      const isError = results.some((r) => r.isError)
      const error = results.find((r) => r.error)?.error

      // Store transactions by month for monthly totals calculation
      const transactionsByMonth = results.map((r, month) => ({
        month,
        transactions: r.data ?? [],
      }))

      // Aggregate all transactions
      const allTransactions = transactionsByMonth.flatMap((m) => m.transactions)

      const data: YearlyDistributionResult | undefined =
        isLoading || isPending
          ? undefined
          : {
              distributions: calculateTagDistribution(
                allTransactions,
                tags,
                type,
              ),
              total: calculateTotal(allTransactions, type),
              transactions: allTransactions,
              transactionsByMonth,
            }

      return {
        isLoading,
        isPending,
        isError,
        error,
        data,
      }
    },
  })

  return monthQueries
}

/**
 * Hook for transactions by tag (monthly mode)
 * Returns transactions for a specific tag in a month
 */
export function useTagTransactions(
  year: number,
  month: number,
  tagId: string | null,
  type: TransactionType,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: queryKeys.transactions.byMonth(year, month),
    queryFn: () => fetchTransactionsByMonth(year, month),
    select: (transactions) =>
      filterTransactionsByTag(transactions, tagId, type),
    enabled,
  })
}
