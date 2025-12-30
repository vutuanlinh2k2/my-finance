import type { Subscription, SubscriptionSummary } from './types'

/**
 * Get the last day of a given month
 */
function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Clamp the day to the valid range for a given month
 * e.g., day 31 in February becomes 28 or 29
 */
function clampDayToMonth(day: number, year: number, month: number): number {
  const lastDay = getLastDayOfMonth(year, month)
  return Math.min(day, lastDay)
}

/**
 * Calculate the next upcoming due date for a subscription
 */
export function calculateUpcomingDueDate(subscription: Subscription): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  const currentDay = today.getDate()

  if (subscription.type === 'monthly') {
    // For monthly subscriptions
    const dayOfMonth = subscription.day_of_month

    // Try current month first
    const clampedDayThisMonth = clampDayToMonth(
      dayOfMonth,
      currentYear,
      currentMonth,
    )
    const thisMonthDate = new Date(
      currentYear,
      currentMonth,
      clampedDayThisMonth,
    )

    if (thisMonthDate >= today) {
      return thisMonthDate
    }

    // Otherwise, next month
    const nextMonth = currentMonth + 1
    const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear
    const normalizedNextMonth = nextMonth > 11 ? 0 : nextMonth
    const clampedDayNextMonth = clampDayToMonth(
      dayOfMonth,
      nextYear,
      normalizedNextMonth,
    )

    return new Date(nextYear, normalizedNextMonth, clampedDayNextMonth)
  } else {
    // For yearly subscriptions
    const dayOfMonth = subscription.day_of_month
    const monthOfYear = (subscription.month_of_year ?? 1) - 1 // Convert 1-12 to 0-11

    // Try this year first
    const clampedDayThisYear = clampDayToMonth(
      dayOfMonth,
      currentYear,
      monthOfYear,
    )
    const thisYearDate = new Date(currentYear, monthOfYear, clampedDayThisYear)

    if (thisYearDate >= today) {
      return thisYearDate
    }

    // Otherwise, next year
    const nextYear = currentYear + 1
    const clampedDayNextYear = clampDayToMonth(
      dayOfMonth,
      nextYear,
      monthOfYear,
    )

    return new Date(nextYear, monthOfYear, clampedDayNextYear)
  }
}

/**
 * Calculate days until a due date from today
 */
export function getDaysUntilDue(dueDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Format a due date with optional urgency indicator
 */
export function formatDueDate(dueDate: Date): {
  formatted: string
  urgency: string | null
} {
  const daysUntil = getDaysUntilDue(dueDate)

  const formatted = dueDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  let urgency: string | null = null
  if (daysUntil === 0) {
    urgency = 'TODAY'
  } else if (daysUntil === 1) {
    urgency = 'TOMORROW'
  } else if (daysUntil > 0 && daysUntil <= 7) {
    urgency = `IN ${daysUntil} DAYS`
  }

  return { formatted, urgency }
}

/**
 * Convert amount to VND based on currency
 */
export function convertToVND(
  amount: number,
  currency: 'VND' | 'USD',
  exchangeRate: number,
): number {
  if (currency === 'VND') {
    return amount
  }
  return Math.round(amount * exchangeRate)
}

/**
 * Calculate summary totals for subscriptions
 * All values are converted to VND
 */
export function calculateSummaryTotals(
  subscriptions: Array<Subscription>,
  exchangeRate: number,
): SubscriptionSummary {
  let totalMonthly = 0
  let totalYearly = 0

  for (const sub of subscriptions) {
    const amountInVND = convertToVND(sub.amount, sub.currency, exchangeRate)

    if (sub.type === 'monthly') {
      totalMonthly += amountInVND
    } else {
      totalYearly += amountInVND
    }
  }

  // Average monthly = Total Monthly + (Total Yearly / 12)
  const avgMonthly = totalMonthly + Math.round(totalYearly / 12)

  return {
    avgMonthly,
    totalMonthly,
    totalYearly,
  }
}

/**
 * Format USD amount with 2 decimal places
 */
export function formatUSD(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Get month name from 1-12 index
 */
export function getMonthName(month: number): string {
  const months = [
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
  ]
  return months[month - 1] ?? ''
}
