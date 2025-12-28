import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateTransactionInput,
  DailyTotalsMap,
  MonthlyTotals,
  Transaction,
  TransactionType,
  UpdateTransactionInput,
} from '@/lib/api/transactions'
import { queryKeys } from '@/lib/query-keys'
import {
  createTransaction,
  deleteTransaction,
  fetchDailyTotals,
  fetchMonthlyTotals,
  fetchTransactionsByDate,
  fetchTransactionsByMonth,
  updateTransaction,
} from '@/lib/api/transactions'

/**
 * Hook to fetch transactions for a specific date
 */
export function useTransactionsByDate(date: string | null) {
  return useQuery({
    queryKey: queryKeys.transactions.byDate(date ?? ''),
    queryFn: () => fetchTransactionsByDate(date!),
    enabled: !!date,
  })
}

/**
 * Hook to fetch transactions for a specific month
 */
export function useTransactionsByMonth(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.transactions.byMonth(year, month),
    queryFn: () => fetchTransactionsByMonth(year, month),
  })
}

/**
 * Hook to fetch monthly totals (income, expenses, balance)
 */
export function useMonthlyTotals(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.totals.monthly(year, month),
    queryFn: () => fetchMonthlyTotals(year, month),
  })
}

/**
 * Hook to fetch daily totals for calendar grid display
 */
export function useDailyTotals(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.totals.daily(year, month),
    queryFn: () => fetchDailyTotals(year, month),
  })
}

/**
 * Hook to create a new transaction
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTransactionInput) => createTransaction(input),
    onSuccess: (data) => {
      // Extract year and month from the new transaction's date
      const [year, month] = data.date.split('-').map(Number)

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.byDate(data.date),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.byMonth(year, month - 1),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.totals.monthly(year, month - 1),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.totals.daily(year, month - 1),
      })
    },
  })
}

/**
 * Hook to update an existing transaction
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateTransactionInput
    }) => updateTransaction(id, updates),
    onSuccess: (data) => {
      const [year, month] = data.date.split('-').map(Number)

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.byDate(data.date),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.byMonth(year, month - 1),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.totals.monthly(year, month - 1),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.totals.daily(year, month - 1),
      })
    },
  })
}

/**
 * Hook to delete a transaction
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      deleteTransaction(id),
    onSuccess: (_, variables) => {
      const [year, month] = variables.date.split('-').map(Number)

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.byDate(variables.date),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.byMonth(year, month - 1),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.totals.monthly(year, month - 1),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.totals.daily(year, month - 1),
      })
    },
  })
}

// Re-export types for convenience
export type {
  Transaction,
  TransactionType,
  CreateTransactionInput,
  UpdateTransactionInput,
  MonthlyTotals,
  DailyTotalsMap,
}
