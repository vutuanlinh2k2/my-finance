import { MonthlyTotalsPanel } from './monthly-totals-panel'
import { NoActivityState, NoTagSelectedState } from './reports-empty-states'
import { TransactionListPanel } from './transaction-list-panel'
import type { Tag } from '@/lib/api/tags'
import type { Transaction } from '@/lib/api/transactions'
import type {
  MonthlyTagTotal,
  TagDistribution,
  TimeMode,
} from '@/lib/reports/types'
import { Skeleton } from '@/components/ui/skeleton'

interface RightPanelProps {
  timeMode: TimeMode
  hasData: boolean
  isLoading: boolean
  // undefined = no selection, null = untagged, string = specific tag
  selectedTagId: string | null | undefined
  selectedDistribution?: TagDistribution

  // Monthly mode props
  transactions: Array<Transaction>
  tags: Array<Tag>

  // Yearly mode props
  monthlyTotals: Array<MonthlyTagTotal>
  onMonthClick?: (month: number) => void
}

export function RightPanel({
  timeMode,
  hasData,
  isLoading,
  selectedTagId,
  selectedDistribution,
  transactions,
  tags,
  monthlyTotals,
  onMonthClick,
}: RightPanelProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col p-4">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // No data state
  if (!hasData) {
    return <NoActivityState />
  }

  // No tag selected state (undefined = no selection, null = untagged)
  if (selectedTagId === undefined) {
    return <NoTagSelectedState />
  }

  const selectedTagName = selectedDistribution?.tagName

  // Monthly mode - show transaction list
  if (timeMode === 'monthly') {
    return (
      <TransactionListPanel
        transactions={transactions}
        tags={tags}
        selectedTagName={selectedTagName}
      />
    )
  }

  // Yearly mode - show monthly totals
  return (
    <MonthlyTotalsPanel
      monthlyTotals={monthlyTotals}
      selectedTagName={selectedTagName}
      onMonthClick={onMonthClick}
    />
  )
}
