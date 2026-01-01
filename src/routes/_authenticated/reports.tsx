import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import type { TimeMode, TransactionType } from '@/lib/reports/types'
import { cn } from '@/lib/utils'
import { formatCompact, formatCurrency } from '@/lib/currency'
import { ReportsHeader } from '@/components/reports/reports-header'
import {
  NoDataState,
  NoTagsState,
} from '@/components/reports/reports-empty-states'
import { RightPanel } from '@/components/reports/right-panel'
import { DistributionPieChart } from '@/components/reports/distribution-pie-chart'
import { PeriodNavigator } from '@/components/reports/period-navigator'
import { TagList } from '@/components/reports/tag-list'
import { MONTH_NAMES_SHORT } from '@/lib/reports/types'
import { useTags } from '@/lib/hooks/use-tags'
import {
  useMonthlyReportDistribution,
  useTagTransactions,
  useYearlyReportDistribution,
} from '@/lib/hooks/use-reports'
import { calculateMonthlyTagTotals } from '@/lib/reports/utils'
import { Skeleton } from '@/components/ui/skeleton'

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
  // undefined = no selection, null = untagged, string = specific tag
  const [selectedTagId, setSelectedTagId] = useState<string | null | undefined>(
    undefined,
  )

  // Current date for boundary checks
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  // Check if we can navigate to next period (can't go to future)
  const canGoNext =
    timeMode === 'monthly'
      ? year < currentYear || (year === currentYear && month < currentMonth)
      : year < currentYear

  // Fetch tags
  const { data: tags = [], isLoading: isLoadingTags } = useTags()

  // Fetch distributions based on time mode
  const monthlyReport = useMonthlyReportDistribution(
    year,
    month,
    transactionType,
    tags,
  )
  const yearlyReport = useYearlyReportDistribution(year, transactionType, tags)

  // Select the appropriate report based on time mode
  const isLoading =
    isLoadingTags ||
    (timeMode === 'monthly' ? monthlyReport.isLoading : yearlyReport.isLoading)

  const distributions =
    timeMode === 'monthly'
      ? (monthlyReport.data?.distributions ?? [])
      : (yearlyReport.data?.distributions ?? [])

  const total =
    timeMode === 'monthly'
      ? (monthlyReport.data?.total ?? 0)
      : (yearlyReport.data?.total ?? 0)

  const hasData = distributions.length > 0

  // Get transactions for selected tag - only for monthly mode
  const { data: tagTransactions = [] } = useTagTransactions(
    year,
    month,
    selectedTagId ?? null,
    transactionType,
    timeMode === 'monthly' && selectedTagId !== undefined,
  )

  // Get monthly totals for selected tag - only for yearly mode
  const monthlyTotals =
    selectedTagId !== undefined && timeMode === 'yearly' && yearlyReport.data
      ? calculateMonthlyTagTotals(
          yearlyReport.data.transactionsByMonth,
          selectedTagId,
          transactionType,
        )
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
    setSelectedTagId(undefined)
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
    setSelectedTagId(undefined)
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
    // Toggle off if already selected, otherwise select the tag
    if (selectedTagId !== undefined && tagId === selectedTagId) {
      setSelectedTagId(undefined)
    } else {
      setSelectedTagId(tagId)
    }
  }

  // Handle time mode change - reset selected tag
  const handleTimeModeChange = (mode: TimeMode) => {
    setTimeMode(mode)
    setSelectedTagId(undefined)
  }

  // Handle transaction type change - reset selected tag
  const handleTransactionTypeChange = (type: TransactionType) => {
    setTransactionType(type)
    setSelectedTagId(undefined)
  }

  // Handle month click in yearly mode - drill down to that month
  const handleMonthClick = (clickedMonth: number) => {
    setTimeMode('monthly')
    setMonth(clickedMonth)
    // Keep the selected tag
  }

  // Find the selected distribution for the right panel
  const selectedDistribution = distributions.find(
    (d) => d.tagId === selectedTagId,
  )

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
              {isLoading ? (
                <Skeleton className="mt-1 h-9 w-24" />
              ) : (
                <p
                  className="text-3xl font-bold tooltip-fast"
                  data-tooltip={formatCurrency(total)}
                >
                  {formatCompact(total)}
                </p>
              )}
            </div>

            {/* Period Navigator */}
            <PeriodNavigator
              label={getPeriodButtonLabel()}
              onPrevious={handlePrevPeriod}
              onNext={handleNextPeriod}
              canGoNext={canGoNext}
            />
          </div>

          {/* Pie Chart */}
          {isLoading ? (
            <div className="mb-6 flex flex-col items-center justify-center py-8">
              <Skeleton className="size-[280px] rounded-full" />
            </div>
          ) : hasData ? (
            <div className="mb-6 flex flex-col items-center justify-center py-8">
              <DistributionPieChart
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
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : hasData ? (
            <TagList
              distributions={distributions}
              selectedTagId={selectedTagId}
              onTagSelect={handleTagSelect}
            />
          ) : (
            <NoTagsState />
          )}
        </div>

        {/* Right Panel - Transaction List or Monthly Totals */}
        <div className="flex w-[400px] flex-col rounded-xl border border-dashed border-border bg-card">
          <RightPanel
            timeMode={timeMode}
            hasData={hasData}
            isLoading={isLoading}
            selectedTagId={selectedTagId}
            selectedDistribution={selectedDistribution}
            transactions={tagTransactions}
            tags={tags}
            monthlyTotals={monthlyTotals}
            onMonthClick={handleMonthClick}
          />
        </div>
      </div>
    </div>
  )
}
