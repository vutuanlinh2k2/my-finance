/**
 * Time mode for reports view
 */
export type TimeMode = 'monthly' | 'yearly'

/**
 * Transaction type filter
 */
export type TransactionType = 'expense' | 'income'

/**
 * Distribution of transactions by tag
 */
export interface TagDistribution {
  tagId: string | null
  tagName: string
  tagEmoji: string
  amount: number
  percentage: number
  color: string
}

/**
 * Monthly totals for yearly view
 */
export interface MonthlyTagTotal {
  month: number
  monthName: string
  amount: number
}

/**
 * Page state for reports
 */
export interface ReportsState {
  timeMode: TimeMode
  transactionType: TransactionType
  year: number
  month: number
  selectedTagId: string | null
}

/**
 * Month names for display
 */
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

/**
 * Short month names for display
 */
export const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const
