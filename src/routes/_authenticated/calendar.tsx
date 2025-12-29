import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  CalendarBlank,
  CaretLeft,
  CaretRight,
  Plus,
  SpinnerGap,
  Tag,
} from '@phosphor-icons/react'
import type { Transaction } from '@/lib/hooks/use-transactions'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatCompact, formatCurrency } from '@/lib/currency'
import { ManageTagsModal } from '@/components/manage-tags-modal'
import { AddTransactionModal } from '@/components/add-transaction-modal'
import { EditTransactionModal } from '@/components/edit-transaction-modal'
import { formatDateToISO } from '@/lib/api/transactions'
import { useTags } from '@/lib/hooks/use-tags'
import {
  useDailyTotals,
  useMonthlyTotals,
  useTransactionsByDate,
} from '@/lib/hooks/use-transactions'

export const Route = createFileRoute('/_authenticated/calendar')({
  component: CalendarPage,
})

// Helper functions for calendar
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = [
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

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function CalendarPage() {
  // Calendar state
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    () => new Date(),
  )

  // Modal state
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false)
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const selectedDateISO = selectedDate ? formatDateToISO(selectedDate) : null

  // React Query hooks
  const { data: tags = [] } = useTags()
  const { data: monthlyTotals, isLoading: isLoadingTotals } = useMonthlyTotals(
    currentYear,
    currentMonth,
  )
  const { data: dailyTotals, isLoading: isLoadingDaily } = useDailyTotals(
    currentYear,
    currentMonth,
  )
  const { data: transactions = [], isLoading: isLoadingTransactions } =
    useTransactionsByDate(selectedDateISO)

  const {
    totalIncome = 0,
    totalExpenses = 0,
    balance = 0,
  } = monthlyTotals || {}

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth)

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(currentYear, currentMonth, day))
  }

  // Generate calendar days
  const calendarDays: Array<number | null> = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsManageTagsOpen(true)}
          >
            <Tag weight="duotone" className="size-4" />
            Manage Tags
          </Button>
          <Button
            className="gap-2"
            onClick={() => setIsAddTransactionOpen(true)}
          >
            <Plus weight="bold" className="size-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Calendar Section - 2/3 width */}
        <div className="flex-2 rounded-xl border border-border bg-card p-6">
          {/* Month Navigator */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handlePrevMonth}
              >
                <CaretLeft weight="bold" className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handleNextMonth}
              >
                <CaretRight weight="bold" className="size-4" />
              </Button>
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="mb-1 flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Total Income
                </span>
              </div>
              {isLoadingTotals ? (
                <div className="h-7 w-20 animate-pulse rounded bg-muted" />
              ) : (
                <p
                  className="text-xl font-semibold tooltip-fast"
                  data-tooltip={formatCurrency(totalIncome)}
                >
                  {formatCompact(totalIncome)}
                </p>
              )}
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="mb-1 flex items-center gap-2">
                <div className="size-2 rounded-full bg-rose-500" />
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Total Expenses
                </span>
              </div>
              {isLoadingTotals ? (
                <div className="h-7 w-20 animate-pulse rounded bg-muted" />
              ) : (
                <p
                  className="text-xl font-semibold tooltip-fast"
                  data-tooltip={formatCurrency(totalExpenses)}
                >
                  {formatCompact(totalExpenses)}
                </p>
              )}
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="mb-1 flex items-center gap-2">
                <div className="size-2 rounded-full bg-blue-500" />
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Balance
                </span>
              </div>
              {isLoadingTotals ? (
                <div className="h-7 w-20 animate-pulse rounded bg-muted" />
              ) : (
                <p
                  className="text-xl font-semibold tooltip-fast"
                  data-tooltip={formatCurrency(balance)}
                >
                  {formatCompact(balance)}
                </p>
              )}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-hidden rounded-lg border border-border">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/30">
              {DAY_NAMES.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const isSelected =
                  selectedDate &&
                  day !== null &&
                  selectedDate.getDate() === day &&
                  selectedDate.getMonth() === currentMonth &&
                  selectedDate.getFullYear() === currentYear

                const isLastRow = index >= calendarDays.length - 7
                const isFirstCol = index % 7 === 0

                // Get daily totals for this day
                const dayTotals =
                  day !== null && dailyTotals ? dailyTotals.get(day) : null
                const hasIncome = dayTotals && dayTotals.income > 0
                const hasExpense = dayTotals && dayTotals.expense > 0

                return (
                  <div
                    key={index}
                    className={cn(
                      'min-h-20 border-border p-2',
                      !isFirstCol && 'border-l',
                      !isLastRow && 'border-b',
                      day !== null && 'cursor-pointer hover:bg-muted/50',
                      isSelected && 'bg-primary/10',
                    )}
                    onClick={() => day !== null && handleDateClick(day)}
                  >
                    {day !== null && (
                      <div className="flex flex-col gap-1">
                        <span
                          className={cn(
                            'text-sm',
                            isSelected && 'font-semibold text-primary',
                          )}
                        >
                          {day}
                        </span>
                        {/* Daily totals */}
                        <div className="mt-1 flex flex-col gap-0.5">
                          {isLoadingDaily ? (
                            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                          ) : (
                            <>
                              {hasIncome && (
                                <span
                                  className="text-xs font-medium text-emerald-600 tooltip-fast"
                                  data-tooltip={formatCurrency(
                                    dayTotals.income,
                                  )}
                                >
                                  +{formatCompact(dayTotals.income)}
                                </span>
                              )}
                              {hasExpense && (
                                <span
                                  className="text-xs font-medium text-rose-600 tooltip-fast"
                                  data-tooltip={formatCurrency(
                                    dayTotals.expense,
                                  )}
                                >
                                  -{formatCompact(dayTotals.expense)}
                                </span>
                              )}
                              {!hasIncome && !hasExpense && (
                                <span className="text-xs text-muted-foreground/50">
                                  --
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Transaction List Panel - 1/3 width */}
        <div className="flex flex-1 flex-col rounded-xl border border-border bg-card">
          {/* Header with selected date */}
          <div className="border-b border-border p-4">
            <h3 className="text-lg font-semibold">
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Select a date'}
            </h3>
          </div>

          {/* Transaction List */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            {isLoadingTransactions ? (
              <div className="flex flex-1 items-center justify-center p-6">
                <SpinnerGap className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-muted">
                  <CalendarBlank
                    weight="duotone"
                    className="size-8 text-muted-foreground"
                  />
                </div>
                <h3 className="mb-1 font-semibold">No transactions</h3>
                <p className="text-sm text-muted-foreground">
                  Click &quot;Add Transaction&quot; to get started!
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {transactions.map((transaction) => {
                  const tag = tags.find((t) => t.id === transaction.tag_id)
                  return (
                    <button
                      key={transaction.id}
                      type="button"
                      onClick={() => setEditingTransaction(transaction)}
                      className="flex w-full items-center justify-between border-b border-border p-4 text-left transition-colors last:border-b-0 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-lg">
                          {tag ? tag.emoji : '📝'}
                        </span>
                        <div>
                          <p className="font-medium">{transaction.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.type === 'income'
                              ? 'Income'
                              : 'Expense'}
                            {tag && ` • ${tag.name}`}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'font-semibold tooltip-fast',
                          transaction.type === 'income'
                            ? 'text-emerald-600'
                            : 'text-rose-600',
                        )}
                        data-tooltip={formatCurrency(transaction.amount)}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCompact(transaction.amount)}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Add entry button */}
          <div className="border-t border-border p-4">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setIsAddTransactionOpen(true)}
            >
              <Plus weight="bold" className="size-4" />
              Add entry
            </Button>
          </div>
        </div>
      </div>

      {/* Manage Tags Modal */}
      <ManageTagsModal
        open={isManageTagsOpen}
        onOpenChange={setIsManageTagsOpen}
      />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        open={isAddTransactionOpen}
        onOpenChange={setIsAddTransactionOpen}
        defaultDate={selectedDate || undefined}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        transaction={editingTransaction}
      />
    </div>
  )
}
