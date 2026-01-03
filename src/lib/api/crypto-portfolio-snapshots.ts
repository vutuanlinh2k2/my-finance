import type { Tables } from '@/types/database'
import type {
  PortfolioTimeRange,
  SnapshotAllocations,
} from '@/lib/crypto/types'
import { supabase } from '@/lib/supabase'

export type PortfolioSnapshotRow = Tables<'crypto_portfolio_snapshots'>

/**
 * Get the date range for a given time range option
 */
function getDateRange(range: PortfolioTimeRange): { startDate: string } | null {
  const now = new Date()

  switch (range) {
    case '7d': {
      const date = new Date(now)
      date.setDate(date.getDate() - 7)
      return { startDate: date.toISOString().split('T')[0] }
    }
    case '30d': {
      const date = new Date(now)
      date.setDate(date.getDate() - 30)
      return { startDate: date.toISOString().split('T')[0] }
    }
    case '60d': {
      const date = new Date(now)
      date.setDate(date.getDate() - 60)
      return { startDate: date.toISOString().split('T')[0] }
    }
    case '1y': {
      const date = new Date(now)
      date.setFullYear(date.getFullYear() - 1)
      return { startDate: date.toISOString().split('T')[0] }
    }
    case 'all':
      return null // No date filter
  }
}

/**
 * Fetch portfolio snapshots for a given time range
 */
export async function fetchPortfolioSnapshots(
  range: PortfolioTimeRange,
): Promise<Array<PortfolioSnapshotRow>> {
  const dateRange = getDateRange(range)

  let query = supabase
    .from('crypto_portfolio_snapshots')
    .select('*')
    .order('snapshot_date', { ascending: true })

  if (dateRange) {
    query = query.gte('snapshot_date', dateRange.startDate)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch portfolio snapshots: ${error.message}`)
  }

  return data
}

/**
 * Create a portfolio snapshot (used by edge function)
 * This is typically called by the cron job, not the frontend
 */
export async function createPortfolioSnapshot(input: {
  snapshotDate: string
  totalValueUsd: number
  allocations: SnapshotAllocations
}): Promise<PortfolioSnapshotRow> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('crypto_portfolio_snapshots')
    .insert({
      user_id: userData.user.id,
      snapshot_date: input.snapshotDate,
      total_value_usd: input.totalValueUsd,
      allocations: input.allocations,
    })
    .select()
    .single()

  if (error) {
    // Handle unique constraint violation - snapshot already exists for this date
    if (error.code === '23505') {
      throw new Error('Snapshot already exists for this date')
    }
    throw new Error(`Failed to create portfolio snapshot: ${error.message}`)
  }

  return data
}
