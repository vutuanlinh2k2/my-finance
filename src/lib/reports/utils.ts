import { CHART_COLORS, UNTAGGED_COLOR } from './colors'
import { MONTH_NAMES } from './types'
import type { MonthlyTagTotal, TagDistribution, TransactionType } from './types'
import type { Tag } from '@/lib/api/tags'
import type { Transaction } from '@/lib/api/transactions'

/**
 * Calculate tag distribution from transactions
 * Groups transactions by tag and calculates amounts/percentages
 */
export function calculateTagDistribution(
  transactions: Array<Transaction>,
  tags: Array<Tag>,
  type: TransactionType,
): Array<TagDistribution> {
  // Filter by transaction type
  const filtered = transactions.filter((t) => t.type === type)

  if (filtered.length === 0) return []

  // Group by tag_id and sum amounts
  const tagAmounts = new Map<string | null, number>()
  for (const t of filtered) {
    const current = tagAmounts.get(t.tag_id) || 0
    tagAmounts.set(t.tag_id, current + t.amount)
  }

  // Calculate total
  const total = filtered.reduce((sum, t) => sum + t.amount, 0)

  // Build distributions
  const distributions: Array<TagDistribution> = []
  let colorIndex = 0

  for (const [tagId, amount] of tagAmounts) {
    const tag = tagId ? tags.find((t) => t.id === tagId) : null
    const percentage = total > 0 ? Math.round((amount / total) * 100) : 0

    distributions.push({
      tagId,
      tagName: tag?.name ?? 'Untagged',
      tagEmoji: tag?.emoji ?? '📝',
      amount,
      percentage,
      color:
        tagId === null
          ? UNTAGGED_COLOR
          : CHART_COLORS[colorIndex++ % CHART_COLORS.length],
    })
  }

  // Sort by amount descending
  return distributions.sort((a, b) => b.amount - a.amount)
}

/**
 * Calculate total amount for a transaction type
 */
export function calculateTotal(
  transactions: Array<Transaction>,
  type: TransactionType,
): number {
  return transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Calculate monthly totals for a specific tag across a year
 * Used for yearly view right panel
 */
export function calculateMonthlyTagTotals(
  transactionsByMonth: Array<{
    month: number
    transactions: Array<Transaction>
  }>,
  tagId: string | null,
  type: TransactionType,
): Array<MonthlyTagTotal> {
  return MONTH_NAMES.map((monthName, month) => {
    const monthData = transactionsByMonth.find((m) => m.month === month)
    const transactions = monthData?.transactions ?? []

    const amount = transactions
      .filter((t) => t.type === type && t.tag_id === tagId)
      .reduce((sum, t) => sum + t.amount, 0)

    return { month, monthName, amount }
  })
}

/**
 * Filter transactions by tag and type
 */
export function filterTransactionsByTag(
  transactions: Array<Transaction>,
  tagId: string | null,
  type: TransactionType,
): Array<Transaction> {
  return transactions.filter((t) => t.tag_id === tagId && t.type === type)
}
