import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { TimeMode, TransactionType } from '@/lib/reports/types'
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

// Search params type for URL persistence
type ReportsSearch = {
  mode?: TimeMode
  type?: TransactionType
  year?: number
  month?: number
  tag?: string // 'untagged' for null, tag ID for specific tag, omitted for no selection
}

// Validate and parse search params
function validateSearch(search: Record<string, unknown>): ReportsSearch {
  return {
    mode:
      search.mode === 'monthly' || search.mode === 'yearly'
        ? search.mode
        : undefined,
    type:
      search.type === 'expense' || search.type === 'income'
        ? search.type
        : undefined,
    year:
      typeof search.year === 'number' ||
      (typeof search.year === 'string' && !isNaN(Number(search.year)))
        ? Number(search.year)
        : undefined,
    month:
      (typeof search.month === 'number' ||
        (typeof search.month === 'string' && !isNaN(Number(search.month)))) &&
      Number(search.month) >= 0 &&
      Number(search.month) <= 11
        ? Number(search.month)
        : undefined,
    tag: typeof search.tag === 'string' ? search.tag : undefined,
  }
}

// Convert tag URL param to selectedTagId state
function parseTagParam(tag: string | undefined): string | null | undefined {
  if (tag === undefined) return undefined // no selection
  if (tag === 'untagged') return null // untagged transactions
  return tag // specific tag ID
}

// Convert selectedTagId state to tag URL param
function serializeTagParam(
  selectedTagId: string | null | undefined,
): string | undefined {
  if (selectedTagId === undefined) return undefined // no selection - omit from URL
  if (selectedTagId === null) return 'untagged' // untagged transactions
  return selectedTagId // specific tag ID
}

export const Route = createFileRoute('/_authenticated/reports')({
  validateSearch,
  component: ReportsPage,
})

function ReportsPage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const search = Route.useSearch()

  // Current date for defaults and boundary checks
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  // Derive state from URL params with defaults
  const timeMode: TimeMode = search.mode ?? 'monthly'
  const transactionType: TransactionType = search.type ?? 'expense'
  const year = search.year ?? currentYear
  const month = search.month ?? currentMonth
  const selectedTagId = parseTagParam(search.tag)

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
      const newMonth = month === 0 ? 11 : month - 1
      const newYear = month === 0 ? year - 1 : year
      navigate({
        search: {
          ...search,
          month: newMonth,
          year: newYear,
          tag: undefined, // Clear selection
        },
      })
    } else {
      navigate({
        search: {
          ...search,
          year: year - 1,
          tag: undefined, // Clear selection
        },
      })
    }
  }

  const handleNextPeriod = () => {
    if (!canGoNext) return

    if (timeMode === 'monthly') {
      const newMonth = month === 11 ? 0 : month + 1
      const newYear = month === 11 ? year + 1 : year
      navigate({
        search: {
          ...search,
          month: newMonth,
          year: newYear,
          tag: undefined, // Clear selection
        },
      })
    } else {
      navigate({
        search: {
          ...search,
          year: year + 1,
          tag: undefined, // Clear selection
        },
      })
    }
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
    const newTagId =
      selectedTagId !== undefined && tagId === selectedTagId ? undefined : tagId
    navigate({
      search: {
        ...search,
        tag: serializeTagParam(newTagId),
      },
    })
  }

  // Handle time mode change - reset selected tag
  const handleTimeModeChange = (mode: TimeMode) => {
    navigate({
      search: {
        ...search,
        mode,
        tag: undefined, // Clear selection
      },
    })
  }

  // Handle transaction type change - reset selected tag
  const handleTransactionTypeChange = (type: TransactionType) => {
    navigate({
      search: {
        ...search,
        type,
        tag: undefined, // Clear selection
      },
    })
  }

  // Handle month click in yearly mode - drill down to that month
  const handleMonthClick = (clickedMonth: number) => {
    navigate({
      search: {
        ...search,
        mode: 'monthly',
        month: clickedMonth,
        // Keep the selected tag
      },
    })
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
          <div className="mb-2 flex items-start justify-between">
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
            <div className="mb-2 flex flex-col items-center justify-center py-2">
              <Skeleton className="size-70 rounded-full" />
            </div>
          ) : hasData ? (
            <div className="mb-2 flex flex-col items-center justify-center py-2">
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
        <div className="flex w-100 flex-col rounded-xl border border-dashed border-border bg-card">
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
