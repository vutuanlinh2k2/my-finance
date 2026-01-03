import { supabase } from '@/lib/supabase'

export interface AllTimeTotals {
  totalIncome: number
  totalExpenses: number
  bankBalance: number
}

export interface MonthlyTotals {
  totalIncome: number
  totalExpenses: number
}

export interface NetWorthSnapshot {
  id: string
  snapshotDate: string
  bankBalance: number
  cryptoValueVnd: number
  totalNetWorth: number
  exchangeRate: number
}

export type TimeRange = '1m' | '1y' | 'all'

/**
 * Fetch all-time totals for the current user
 * Returns total income, total expenses, and bank balance
 */
export async function fetchAllTimeTotals(): Promise<AllTimeTotals> {
  const { data, error } = await supabase.rpc('get_all_time_totals')

  if (error) {
    throw new Error(`Failed to fetch all-time totals: ${error.message}`)
  }

  // RPC returns an array, we take the first (and only) row
  // If no data, return zeros
  if (data.length === 0) {
    return { totalIncome: 0, totalExpenses: 0, bankBalance: 0 }
  }

  const result = data[0]

  return {
    totalIncome: result.total_income,
    totalExpenses: result.total_expenses,
    bankBalance: result.bank_balance,
  }
}

/**
 * Fetch monthly totals for the current user
 * @param year - Full year (e.g., 2026)
 * @param month - Month (1-12, NOT 0-indexed)
 */
export async function fetchMonthlyTotals(
  year: number,
  month: number,
): Promise<MonthlyTotals> {
  const { data, error } = await supabase.rpc('get_monthly_totals', {
    p_year: year,
    p_month: month,
  })

  if (error) {
    throw new Error(`Failed to fetch monthly totals: ${error.message}`)
  }

  // RPC returns an array, we take the first (and only) row
  // If no data, return zeros
  if (data.length === 0) {
    return { totalIncome: 0, totalExpenses: 0 }
  }

  const result = data[0]

  return {
    totalIncome: result.total_income,
    totalExpenses: result.total_expenses,
  }
}

/**
 * Calculate the start date for a given time range
 */
function getStartDate(range: TimeRange): string | null {
  const now = new Date()

  switch (range) {
    case '1m': {
      const date = new Date(now)
      date.setMonth(date.getMonth() - 1)
      return date.toISOString().split('T')[0]
    }
    case '1y': {
      const date = new Date(now)
      date.setFullYear(date.getFullYear() - 1)
      return date.toISOString().split('T')[0]
    }
    case 'all':
      return null
  }
}

/**
 * Fetch net worth snapshots for the current user
 * @param range - Time range: '1m' (1 month), '1y' (1 year), or 'all'
 */
export async function fetchNetWorthSnapshots(
  range: TimeRange,
): Promise<Array<NetWorthSnapshot>> {
  const startDate = getStartDate(range)

  let query = supabase
    .from('net_worth_snapshots')
    .select('id, snapshot_date, bank_balance, crypto_value_vnd, total_net_worth, exchange_rate')
    .order('snapshot_date', { ascending: true })

  if (startDate) {
    query = query.gte('snapshot_date', startDate)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch net worth snapshots: ${error.message}`)
  }

  return data.map((row) => ({
    id: row.id,
    snapshotDate: row.snapshot_date,
    bankBalance: row.bank_balance,
    cryptoValueVnd: row.crypto_value_vnd,
    totalNetWorth: row.total_net_worth,
    exchangeRate: row.exchange_rate,
  }))
}
