import type { Tables, TablesInsert, TablesUpdate } from '@/types/database'
import { supabase } from '@/lib/supabase'

export type Transaction = Tables<'transactions'>
export type TransactionType = 'expense' | 'income'
export type CreateTransactionInput = Pick<
  TablesInsert<'transactions'>,
  'title' | 'amount' | 'date' | 'type' | 'tag_id'
>
export type UpdateTransactionInput = Pick<
  TablesUpdate<'transactions'>,
  'title' | 'amount' | 'date' | 'type' | 'tag_id'
>

export interface MonthlyTotals {
  totalIncome: number
  totalExpenses: number
  balance: number
}

export type DailyTotalsMap = Map<number, { income: number; expense: number }>

/**
 * Fetch transactions for a specific date
 */
export async function fetchTransactionsByDate(
  date: string,
): Promise<Array<Transaction>> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('date', date)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`)
  }

  return data
}

/**
 * Fetch transactions for a specific month
 */
export async function fetchTransactionsByMonth(
  year: number,
  month: number,
): Promise<Array<Transaction>> {
  // month is 0-indexed (0 = January)
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  // Get last day of month
  const lastDay = new Date(year, month + 1, 0).getDate()
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`)
  }

  return data
}

/**
 * Create a new transaction
 */
export async function createTransaction(
  input: CreateTransactionInput,
): Promise<Transaction> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userData.user.id,
      title: input.title,
      amount: input.amount,
      date: input.date,
      type: input.type,
      tag_id: input.tag_id,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create transaction: ${error.message}`)
  }

  return data
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  id: string,
  updates: UpdateTransactionInput,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update transaction: ${error.message}`)
  }

  return data
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete transaction: ${error.message}`)
  }
}

/**
 * Calculate monthly totals (income, expenses, balance)
 */
export async function fetchMonthlyTotals(
  year: number,
  month: number,
): Promise<MonthlyTotals> {
  const transactions = await fetchTransactionsByMonth(year, month)

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
  }
}

/**
 * Calculate daily totals for calendar grid display
 */
export async function fetchDailyTotals(
  year: number,
  month: number,
): Promise<DailyTotalsMap> {
  const transactions = await fetchTransactionsByMonth(year, month)
  const dailyTotals = new Map<number, { income: number; expense: number }>()

  for (const t of transactions) {
    const day = parseInt(t.date.split('-')[2], 10)
    const current = dailyTotals.get(day) || { income: 0, expense: 0 }

    if (t.type === 'income') {
      current.income += t.amount
    } else {
      current.expense += t.amount
    }

    dailyTotals.set(day, current)
  }

  return dailyTotals
}

/**
 * Format a Date object to ISO date string (YYYY-MM-DD)
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
