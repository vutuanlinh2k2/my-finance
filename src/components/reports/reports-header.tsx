import type { TimeMode, TransactionType } from '@/lib/reports/types'
import { cn } from '@/lib/utils'

interface ReportsHeaderProps {
  timeMode: TimeMode
  onTimeModeChange: (mode: TimeMode) => void
  transactionType: TransactionType
  onTransactionTypeChange: (type: TransactionType) => void
}

export function ReportsHeader({
  timeMode,
  onTimeModeChange,
  transactionType,
  onTransactionTypeChange,
}: ReportsHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      {/* Title and Subtitle */}
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Detailed breakdown of your finances
        </p>
      </div>

      {/* Toggle Controls */}
      <div className="flex items-center gap-3">
        {/* Time Mode Toggle (Monthly/Yearly) */}
        <div className="flex rounded-lg border border-border bg-sidebar p-1">
          <button
            type="button"
            onClick={() => onTimeModeChange('monthly')}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              timeMode === 'monthly'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => onTimeModeChange('yearly')}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              timeMode === 'yearly'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Yearly
          </button>
        </div>

        {/* Transaction Type Toggle (Expense/Income) */}
        <div className="flex rounded-lg border border-border bg-sidebar p-1">
          <button
            type="button"
            onClick={() => onTransactionTypeChange('expense')}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              transactionType === 'expense'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => onTransactionTypeChange('income')}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              transactionType === 'income'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Income
          </button>
        </div>
      </div>
    </div>
  )
}
