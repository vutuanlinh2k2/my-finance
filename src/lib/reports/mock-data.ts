import { MONTH_NAMES } from './types'
import type { MonthlyTagTotal, TagDistribution, TransactionType } from './types'

/**
 * Color palette for chart segments
 */
export const CHART_COLORS = [
  '#EAB308', // yellow-500 (primary)
  '#1C1917', // stone-900 (dark)
  '#A8A29E', // stone-400 (medium)
  '#D6D3D1', // stone-300 (light)
  '#78716C', // stone-500
  '#57534E', // stone-600
  '#F59E0B', // amber-500
  '#84CC16', // lime-500
] as const

/**
 * Color for untagged transactions
 */
export const UNTAGGED_COLOR = '#9CA3AF' // gray-400

/**
 * Mock transaction interface
 */
export interface MockTransaction {
  id: string
  title: string
  amount: number
  date: string
  tagId: string | null
  tagEmoji: string
  type: TransactionType
}

/**
 * Period key for data lookup
 */
function getPeriodKey(year: number, month?: number): string {
  if (month !== undefined) {
    return `${year}-${month}`
  }
  return `${year}`
}

/**
 * Mock expense data by period (year-month)
 * Only recent months have data, older periods are empty
 */
const expenseDataByPeriod: Partial<Record<string, Array<TagDistribution>>> = {
  // January 2026 - Current month, full data
  '2026-0': [
    { tagId: 'tag-1', tagName: 'Food & Dining', tagEmoji: '🍔', amount: 5500000, percentage: 35, color: CHART_COLORS[0] },
    { tagId: 'tag-2', tagName: 'Transportation', tagEmoji: '🚗', amount: 3200000, percentage: 20, color: CHART_COLORS[1] },
    { tagId: 'tag-3', tagName: 'Shopping', tagEmoji: '🛍️', amount: 2800000, percentage: 18, color: CHART_COLORS[2] },
    { tagId: 'tag-4', tagName: 'Entertainment', tagEmoji: '🎮', amount: 2000000, percentage: 13, color: CHART_COLORS[3] },
    { tagId: 'tag-5', tagName: 'Utilities', tagEmoji: '💡', amount: 1500000, percentage: 10, color: CHART_COLORS[4] },
    { tagId: null, tagName: 'Untagged', tagEmoji: '📝', amount: 600000, percentage: 4, color: UNTAGGED_COLOR },
  ],
  // December 2025 - Holiday spending
  '2025-11': [
    { tagId: 'tag-3', tagName: 'Shopping', tagEmoji: '🛍️', amount: 8500000, percentage: 45, color: CHART_COLORS[0] },
    { tagId: 'tag-1', tagName: 'Food & Dining', tagEmoji: '🍔', amount: 4200000, percentage: 22, color: CHART_COLORS[1] },
    { tagId: 'tag-4', tagName: 'Entertainment', tagEmoji: '🎮', amount: 3800000, percentage: 20, color: CHART_COLORS[2] },
    { tagId: 'tag-2', tagName: 'Transportation', tagEmoji: '🚗', amount: 2500000, percentage: 13, color: CHART_COLORS[3] },
  ],
  // November 2025 - Normal month
  '2025-10': [
    { tagId: 'tag-1', tagName: 'Food & Dining', tagEmoji: '🍔', amount: 4800000, percentage: 40, color: CHART_COLORS[0] },
    { tagId: 'tag-2', tagName: 'Transportation', tagEmoji: '🚗', amount: 3000000, percentage: 25, color: CHART_COLORS[1] },
    { tagId: 'tag-5', tagName: 'Utilities', tagEmoji: '💡', amount: 2400000, percentage: 20, color: CHART_COLORS[2] },
    { tagId: 'tag-4', tagName: 'Entertainment', tagEmoji: '🎮', amount: 1800000, percentage: 15, color: CHART_COLORS[3] },
  ],
  // October 2025 - Light spending
  '2025-9': [
    { tagId: 'tag-1', tagName: 'Food & Dining', tagEmoji: '🍔', amount: 3200000, percentage: 50, color: CHART_COLORS[0] },
    { tagId: 'tag-5', tagName: 'Utilities', tagEmoji: '💡', amount: 1800000, percentage: 28, color: CHART_COLORS[1] },
    { tagId: 'tag-2', tagName: 'Transportation', tagEmoji: '🚗', amount: 1400000, percentage: 22, color: CHART_COLORS[2] },
  ],
}

/**
 * Mock income data by period
 */
const incomeDataByPeriod: Partial<Record<string, Array<TagDistribution>>> = {
  // January 2026
  '2026-0': [
    { tagId: 'tag-10', tagName: 'Salary', tagEmoji: '💰', amount: 25000000, percentage: 70, color: CHART_COLORS[0] },
    { tagId: 'tag-11', tagName: 'Freelance', tagEmoji: '💻', amount: 8000000, percentage: 22, color: CHART_COLORS[1] },
    { tagId: 'tag-12', tagName: 'Investments', tagEmoji: '📈', amount: 2800000, percentage: 8, color: CHART_COLORS[2] },
  ],
  // December 2025 - Year-end bonus
  '2025-11': [
    { tagId: 'tag-10', tagName: 'Salary', tagEmoji: '💰', amount: 25000000, percentage: 45, color: CHART_COLORS[0] },
    { tagId: 'tag-13', tagName: 'Bonus', tagEmoji: '🎁', amount: 20000000, percentage: 36, color: CHART_COLORS[1] },
    { tagId: 'tag-11', tagName: 'Freelance', tagEmoji: '💻', amount: 10500000, percentage: 19, color: CHART_COLORS[2] },
  ],
  // November 2025
  '2025-10': [
    { tagId: 'tag-10', tagName: 'Salary', tagEmoji: '💰', amount: 25000000, percentage: 78, color: CHART_COLORS[0] },
    { tagId: 'tag-11', tagName: 'Freelance', tagEmoji: '💻', amount: 7000000, percentage: 22, color: CHART_COLORS[1] },
  ],
  // October 2025
  '2025-9': [
    { tagId: 'tag-10', tagName: 'Salary', tagEmoji: '💰', amount: 25000000, percentage: 100, color: CHART_COLORS[0] },
  ],
}

/**
 * Mock transactions by period and tag
 */
const transactionsByPeriod: Partial<Record<string, Array<MockTransaction>>> = {
  '2026-0': [
    { id: 'txn-1', title: 'Grab Food Order', amount: 150000, date: '2026-01-28', tagId: 'tag-1', tagEmoji: '🍔', type: 'expense' },
    { id: 'txn-2', title: 'Coffee Shop', amount: 85000, date: '2026-01-25', tagId: 'tag-1', tagEmoji: '🍔', type: 'expense' },
    { id: 'txn-3', title: 'Supermarket', amount: 450000, date: '2026-01-22', tagId: 'tag-1', tagEmoji: '🍔', type: 'expense' },
    { id: 'txn-4', title: 'Restaurant Dinner', amount: 320000, date: '2026-01-18', tagId: 'tag-1', tagEmoji: '🍔', type: 'expense' },
    { id: 'txn-5', title: 'Lunch Meeting', amount: 280000, date: '2026-01-15', tagId: 'tag-1', tagEmoji: '🍔', type: 'expense' },
    { id: 'txn-6', title: 'Grab Ride', amount: 120000, date: '2026-01-27', tagId: 'tag-2', tagEmoji: '🚗', type: 'expense' },
    { id: 'txn-7', title: 'Gas Station', amount: 500000, date: '2026-01-20', tagId: 'tag-2', tagEmoji: '🚗', type: 'expense' },
    { id: 'txn-8', title: 'Clothing Store', amount: 850000, date: '2026-01-15', tagId: 'tag-3', tagEmoji: '🛍️', type: 'expense' },
    { id: 'txn-9', title: 'Netflix', amount: 180000, date: '2026-01-10', tagId: 'tag-4', tagEmoji: '🎮', type: 'expense' },
    { id: 'txn-10', title: 'Electricity Bill', amount: 850000, date: '2026-01-05', tagId: 'tag-5', tagEmoji: '💡', type: 'expense' },
    { id: 'txn-11', title: 'Monthly Salary', amount: 25000000, date: '2026-01-01', tagId: 'tag-10', tagEmoji: '💰', type: 'income' },
    { id: 'txn-12', title: 'Website Project', amount: 8000000, date: '2026-01-15', tagId: 'tag-11', tagEmoji: '💻', type: 'income' },
  ],
  '2025-11': [
    { id: 'txn-20', title: 'Christmas Gifts', amount: 3500000, date: '2025-12-24', tagId: 'tag-3', tagEmoji: '🛍️', type: 'expense' },
    { id: 'txn-21', title: 'Holiday Dinner', amount: 1200000, date: '2025-12-25', tagId: 'tag-1', tagEmoji: '🍔', type: 'expense' },
    { id: 'txn-22', title: 'New Year Party', amount: 800000, date: '2025-12-31', tagId: 'tag-4', tagEmoji: '🎮', type: 'expense' },
    { id: 'txn-23', title: 'Year-end Bonus', amount: 20000000, date: '2025-12-25', tagId: 'tag-13', tagEmoji: '🎁', type: 'income' },
    { id: 'txn-24', title: 'Monthly Salary', amount: 25000000, date: '2025-12-01', tagId: 'tag-10', tagEmoji: '💰', type: 'income' },
  ],
  '2025-10': [
    { id: 'txn-30', title: 'Grocery Shopping', amount: 650000, date: '2025-11-28', tagId: 'tag-1', tagEmoji: '🍔', type: 'expense' },
    { id: 'txn-31', title: 'Phone Bill', amount: 350000, date: '2025-11-15', tagId: 'tag-5', tagEmoji: '💡', type: 'expense' },
    { id: 'txn-32', title: 'Bus Pass', amount: 200000, date: '2025-11-05', tagId: 'tag-2', tagEmoji: '🚗', type: 'expense' },
    { id: 'txn-33', title: 'Monthly Salary', amount: 25000000, date: '2025-11-01', tagId: 'tag-10', tagEmoji: '💰', type: 'income' },
  ],
  '2025-9': [
    { id: 'txn-40', title: 'Restaurant', amount: 420000, date: '2025-10-20', tagId: 'tag-1', tagEmoji: '🍔', type: 'expense' },
    { id: 'txn-41', title: 'Internet Bill', amount: 280000, date: '2025-10-10', tagId: 'tag-5', tagEmoji: '💡', type: 'expense' },
    { id: 'txn-42', title: 'Monthly Salary', amount: 25000000, date: '2025-10-01', tagId: 'tag-10', tagEmoji: '💰', type: 'income' },
  ],
}

/**
 * Yearly expense totals by tag (for 2025 and 2026)
 */
const yearlyExpenseTotals: Partial<Record<string, Record<string, Array<MonthlyTagTotal>>>> = {
  '2026': {
    'tag-1': MONTH_NAMES.map((monthName, i) => ({ month: i, monthName, amount: i === 0 ? 5500000 : 0 })),
    'tag-2': MONTH_NAMES.map((monthName, i) => ({ month: i, monthName, amount: i === 0 ? 3200000 : 0 })),
    'tag-3': MONTH_NAMES.map((monthName, i) => ({ month: i, monthName, amount: i === 0 ? 2800000 : 0 })),
    'tag-4': MONTH_NAMES.map((monthName, i) => ({ month: i, monthName, amount: i === 0 ? 2000000 : 0 })),
    'tag-5': MONTH_NAMES.map((monthName, i) => ({ month: i, monthName, amount: i === 0 ? 1500000 : 0 })),
  },
  '2025': {
    'tag-1': MONTH_NAMES.map((monthName, i) => ({
      month: i,
      monthName,
      amount: i === 9 ? 3200000 : i === 10 ? 4800000 : i === 11 ? 4200000 : 0,
    })),
    'tag-2': MONTH_NAMES.map((monthName, i) => ({
      month: i,
      monthName,
      amount: i === 9 ? 1400000 : i === 10 ? 3000000 : i === 11 ? 2500000 : 0,
    })),
    'tag-3': MONTH_NAMES.map((monthName, i) => ({
      month: i,
      monthName,
      amount: i === 11 ? 8500000 : 0,
    })),
    'tag-4': MONTH_NAMES.map((monthName, i) => ({
      month: i,
      monthName,
      amount: i === 10 ? 1800000 : i === 11 ? 3800000 : 0,
    })),
    'tag-5': MONTH_NAMES.map((monthName, i) => ({
      month: i,
      monthName,
      amount: i === 9 ? 1800000 : i === 10 ? 2400000 : 0,
    })),
  },
}

/**
 * Yearly income totals by tag
 */
const yearlyIncomeTotals: Partial<Record<string, Record<string, Array<MonthlyTagTotal>>>> = {
  '2026': {
    'tag-10': MONTH_NAMES.map((monthName, i) => ({ month: i, monthName, amount: i === 0 ? 25000000 : 0 })),
    'tag-11': MONTH_NAMES.map((monthName, i) => ({ month: i, monthName, amount: i === 0 ? 8000000 : 0 })),
    'tag-12': MONTH_NAMES.map((monthName, i) => ({ month: i, monthName, amount: i === 0 ? 2800000 : 0 })),
  },
  '2025': {
    'tag-10': MONTH_NAMES.map((monthName, i) => ({
      month: i,
      monthName,
      amount: i >= 9 && i <= 11 ? 25000000 : 0,
    })),
    'tag-11': MONTH_NAMES.map((monthName, i) => ({
      month: i,
      monthName,
      amount: i === 10 ? 7000000 : i === 11 ? 10500000 : 0,
    })),
    'tag-13': MONTH_NAMES.map((monthName, i) => ({
      month: i,
      monthName,
      amount: i === 11 ? 20000000 : 0,
    })),
  },
}

/**
 * Get mock distributions by type and period
 */
export function getMockDistributions(
  type: TransactionType,
  year: number,
  month?: number,
): Array<TagDistribution> {
  const key = getPeriodKey(year, month)
  const data = type === 'expense' ? expenseDataByPeriod : incomeDataByPeriod

  // For yearly view, aggregate all months
  if (month === undefined) {
    const yearData = type === 'expense' ? yearlyExpenseTotals[String(year)] : yearlyIncomeTotals[String(year)]
    if (!yearData) return []

    // Aggregate totals by tag
    const tagTotals = new Map<string, { amount: number; tagId: string | null; tagName: string; tagEmoji: string }>()

    // Get tag info from any month's data
    for (let m = 0; m < 12; m++) {
      const monthData = data[`${year}-${m}`]
      if (monthData) {
        for (const tag of monthData) {
          const existing = tagTotals.get(tag.tagId ?? 'null')
          if (!existing) {
            tagTotals.set(tag.tagId ?? 'null', {
              amount: 0,
              tagId: tag.tagId,
              tagName: tag.tagName,
              tagEmoji: tag.tagEmoji,
            })
          }
        }
      }
    }

    // Sum up yearly amounts
    for (const [tagKey, totals] of Object.entries(yearData)) {
      const yearlyAmount = totals.reduce((sum, m) => sum + m.amount, 0)
      const existing = tagTotals.get(tagKey)
      if (existing) {
        existing.amount = yearlyAmount
      }
    }

    // Calculate percentages and build result
    const total = Array.from(tagTotals.values()).reduce((sum, t) => sum + t.amount, 0)
    if (total === 0) return []

    const result: Array<TagDistribution> = []
    let colorIndex = 0
    for (const tag of tagTotals.values()) {
      if (tag.amount > 0) {
        result.push({
          tagId: tag.tagId,
          tagName: tag.tagName,
          tagEmoji: tag.tagEmoji,
          amount: tag.amount,
          percentage: Math.round((tag.amount / total) * 100),
          color: tag.tagId === null ? UNTAGGED_COLOR : CHART_COLORS[colorIndex++ % CHART_COLORS.length],
        })
      }
    }

    return result.sort((a, b) => b.amount - a.amount)
  }

  return data[key] ?? []
}

/**
 * Get mock total by type and period
 */
export function getMockTotal(type: TransactionType, year: number, month?: number): number {
  const distributions = getMockDistributions(type, year, month)
  return distributions.reduce((sum, d) => sum + d.amount, 0)
}

/**
 * Get mock transactions for a period and tag
 */
export function getMockTransactions(
  year: number,
  month: number,
  tagId: string | null,
  type: TransactionType,
): Array<MockTransaction> {
  const key = getPeriodKey(year, month)
  const allTransactions = transactionsByPeriod[key] ?? []
  return allTransactions.filter((t) => t.tagId === tagId && t.type === type)
}

/**
 * Get mock monthly totals for yearly view
 */
export function getMockMonthlyTotals(
  year: number,
  tagId: string | null,
  type: TransactionType,
): Array<MonthlyTagTotal> {
  const yearData = type === 'expense' ? yearlyExpenseTotals[String(year)] : yearlyIncomeTotals[String(year)]

  if (!yearData || !tagId) {
    return MONTH_NAMES.map((monthName, i) => ({ month: i, monthName, amount: 0 }))
  }

  return yearData[tagId] ?? MONTH_NAMES.map((monthName, i) => ({ month: i, monthName, amount: 0 }))
}
