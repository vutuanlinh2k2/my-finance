import type { MonthlyTagTotal } from '@/lib/reports/types'
import { formatCompact, formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'

interface MonthlyTotalsPanelProps {
  monthlyTotals: Array<MonthlyTagTotal>
  selectedTagName?: string
  onMonthClick?: (month: number) => void
}

export function MonthlyTotalsPanel({
  monthlyTotals,
  selectedTagName,
  onMonthClick,
}: MonthlyTotalsPanelProps) {
  // Calculate total for the year
  const yearTotal = monthlyTotals.reduce((sum, m) => sum + m.amount, 0)

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {selectedTagName
            ? `${selectedTagName} - Monthly Breakdown`
            : 'Monthly Totals'}
        </h3>
        {yearTotal > 0 && (
          <p
            className="tooltip-fast mt-1 text-lg font-bold"
            data-tooltip={formatCurrency(yearTotal)}
          >
            {formatCompact(yearTotal)} total
          </p>
        )}
      </div>

      {/* Monthly List */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {monthlyTotals.map((monthData) => (
          <button
            key={monthData.month}
            type="button"
            onClick={() => onMonthClick?.(monthData.month)}
            disabled={monthData.amount === 0 || !onMonthClick}
            className={cn(
              'flex items-center justify-between border-b border-border px-4 py-3 text-left last:border-b-0',
              monthData.amount > 0 && onMonthClick
                ? 'cursor-pointer hover:bg-muted/50'
                : 'cursor-default',
              monthData.amount === 0 && 'opacity-50',
            )}
          >
            <span className="font-medium">{monthData.monthName}</span>
            <span
              className={cn(
                'font-semibold',
                monthData.amount > 0 && 'tooltip-fast',
              )}
              data-tooltip={
                monthData.amount > 0
                  ? formatCurrency(monthData.amount)
                  : undefined
              }
            >
              {monthData.amount > 0 ? formatCompact(monthData.amount) : '--'}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
