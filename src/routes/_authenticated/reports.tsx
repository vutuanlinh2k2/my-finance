import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import type { TimeMode, TransactionType } from '@/lib/reports/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatCompact, formatCurrency } from '@/lib/currency'
import { ReportsHeader } from '@/components/reports/reports-header'
import {
  NoActivityState,
  NoDataState,
  NoTagSelectedState,
  NoTagsState,
} from '@/components/reports/reports-empty-states'
import { PieChartPlaceholder } from '@/components/reports/pie-chart-placeholder'
import { MONTH_NAMES_SHORT } from '@/lib/reports/types'
import {
  getMockDistributions,
  getMockMonthlyTotals,
  getMockTotal,
  getMockTransactions,
} from '@/lib/reports/mock-data'

export const Route = createFileRoute('/_authenticated/reports')({
  component: ReportsPage,
})

function ReportsPage() {
  // Page state
  const [timeMode, setTimeMode] = useState<TimeMode>('monthly')
  const [transactionType, setTransactionType] =
    useState<TransactionType>('expense')
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth())
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)

  // Current date for boundary checks
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  // Check if we can navigate to next period (can't go to future)
  const canGoNext =
    timeMode === 'monthly'
      ? year < currentYear || (year === currentYear && month < currentMonth)
      : year < currentYear

  // Get mock data based on current state (now period-aware)
  const distributions =
    timeMode === 'monthly'
      ? getMockDistributions(transactionType, year, month)
      : getMockDistributions(transactionType, year)
  const total =
    timeMode === 'monthly'
      ? getMockTotal(transactionType, year, month)
      : getMockTotal(transactionType, year)
  const hasData = distributions.length > 0

  // Get transactions for selected tag (mock) - only for monthly mode
  const tagTransactions =
    selectedTagId && timeMode === 'monthly'
      ? getMockTransactions(year, month, selectedTagId, transactionType)
      : []

  // Get monthly totals for selected tag - only for yearly mode
  const monthlyTotals =
    selectedTagId && timeMode === 'yearly'
      ? getMockMonthlyTotals(year, selectedTagId, transactionType)
      : []

  // Period navigation handlers
  const handlePrevPeriod = () => {
    if (timeMode === 'monthly') {
      if (month === 0) {
        setMonth(11)
        setYear(year - 1)
      } else {
        setMonth(month - 1)
      }
    } else {
      setYear(year - 1)
    }
    setSelectedTagId(null)
  }

  const handleNextPeriod = () => {
    if (!canGoNext) return

    if (timeMode === 'monthly') {
      if (month === 11) {
        setMonth(0)
        setYear(year + 1)
      } else {
        setMonth(month + 1)
      }
    } else {
      setYear(year + 1)
    }
    setSelectedTagId(null)
  }

  // Format period label for display
  const getPeriodLabel = () => {
    if (timeMode === 'monthly') {
      return `${MONTH_NAMES_SHORT[month]} ${year}`
    }
    return `${year}`
  }

  const getPeriodButtonLabel = () => {
    if (timeMode === 'monthly') {
      return `${MONTH_NAMES_SHORT[month]} ${year}`
    }
    return `${year}`
  }

  // Handle tag selection
  const handleTagSelect = (tagId: string | null) => {
    setSelectedTagId(tagId === selectedTagId ? null : tagId)
  }

  // Handle time mode change - reset selected tag
  const handleTimeModeChange = (mode: TimeMode) => {
    setTimeMode(mode)
    setSelectedTagId(null)
  }

  // Handle transaction type change - reset selected tag
  const handleTransactionTypeChange = (type: TransactionType) => {
    setTransactionType(type)
    setSelectedTagId(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header with Toggles */}
      <ReportsHeader
        timeMode={timeMode}
        onTimeModeChange={handleTimeModeChange}
        transactionType={transactionType}
        onTransactionTypeChange={handleTransactionTypeChange}
      />

      {/* Main Content - Two Panel Layout */}
      <div className="flex gap-6">
        {/* Left Panel - Chart & Tag List */}
        <div className="flex flex-1 flex-col rounded-xl border border-border bg-card p-6">
          {/* Total Display with Period Selector */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                {transactionType === 'expense'
                  ? 'TOTAL EXPENSES'
                  : 'TOTAL INCOME'}
              </p>
              <p
                className="text-3xl font-bold tooltip-fast"
                data-tooltip={formatCurrency(total)}
              >
                {formatCompact(total)}
              </p>
            </div>

            {/* Period Navigator */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handlePrevPeriod}
                className="bg-background"
              >
                <CaretLeft weight="bold" className="size-4" />
              </Button>
              <div className="min-w-[90px] rounded-md border border-border bg-background px-3 py-1.5 text-center text-sm font-medium">
                {getPeriodButtonLabel()}
              </div>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handleNextPeriod}
                disabled={!canGoNext}
                className="bg-background"
              >
                <CaretRight weight="bold" className="size-4" />
              </Button>
            </div>
          </div>

          {/* Pie Chart Area (Placeholder for Phase 2) */}
          {hasData ? (
            <div className="mb-6 flex flex-col items-center justify-center py-8">
              <PieChartPlaceholder
                distributions={distributions}
                centerLabel={getPeriodLabel()}
                onSegmentClick={handleTagSelect}
                selectedTagId={selectedTagId}
              />
            </div>
          ) : (
            <NoDataState />
          )}

          {/* Tag List */}
          {hasData ? (
            <div className="flex flex-col gap-2">
              {distributions.map((distribution) => (
                <button
                  key={distribution.tagId ?? 'untagged'}
                  type="button"
                  onClick={() => handleTagSelect(distribution.tagId)}
                  className={cn(
                    'flex items-center justify-between rounded-lg border border-transparent p-3 text-left transition-colors hover:bg-muted/50',
                    selectedTagId === distribution.tagId &&
                      'border-primary bg-primary/5',
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Color indicator */}
                    <div
                      className="size-4 shrink-0 rounded"
                      style={{ backgroundColor: distribution.color }}
                    />
                    {/* Tag info */}
                    <span className="font-medium">{distribution.tagName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Amount */}
                    <span
                      className="font-semibold tooltip-fast"
                      data-tooltip={formatCurrency(distribution.amount)}
                    >
                      {formatCompact(distribution.amount)}
                    </span>
                    {/* Percentage badge */}
                    <span className="rounded border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {distribution.percentage}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <NoTagsState />
          )}
        </div>

        {/* Right Panel - Transaction List or Monthly Totals */}
        <div className="flex w-[400px] flex-col rounded-xl border border-dashed border-border bg-card">
          {!hasData ? (
            <NoActivityState />
          ) : !selectedTagId ? (
            <NoTagSelectedState />
          ) : timeMode === 'monthly' ? (
            // Transaction List (Monthly Mode)
            <div className="flex flex-1 flex-col">
              <div className="border-b border-border p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Transaction Listing
                </h3>
              </div>
              <div className="flex flex-1 flex-col overflow-y-auto">
                {tagTransactions.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center p-6">
                    <p className="text-sm text-muted-foreground">
                      No transactions for this tag
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {tagTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between border-b border-border p-4 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-lg">
                            {transaction.tagEmoji}
                          </span>
                          <div>
                            <p className="font-medium">{transaction.title}</p>
                            <p className="text-xs uppercase text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString(
                                'en-US',
                                { month: 'short', day: 'numeric' },
                              )}
                            </p>
                          </div>
                        </div>
                        <span
                          className={cn(
                            'font-semibold tooltip-fast',
                            transaction.type === 'income'
                              ? 'text-emerald-600'
                              : 'text-foreground',
                          )}
                          data-tooltip={formatCurrency(transaction.amount)}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCompact(transaction.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Monthly Totals (Yearly Mode)
            <div className="flex flex-1 flex-col">
              <div className="border-b border-border p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Monthly Totals
                </h3>
              </div>
              <div className="flex flex-1 flex-col overflow-y-auto">
                {monthlyTotals.map((monthData) => (
                  <div
                    key={monthData.month}
                    className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0"
                  >
                    <span className="font-medium">{monthData.monthName}</span>
                    <span
                      className="font-semibold tooltip-fast"
                      data-tooltip={formatCurrency(monthData.amount)}
                    >
                      {formatCompact(monthData.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
