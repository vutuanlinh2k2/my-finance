import { ArrowDown, ArrowUp, Wallet } from '@phosphor-icons/react'
import type { DashboardTotals } from '@/lib/dashboard/types'
import { formatCompact, formatCurrency } from '@/lib/currency'

interface DashboardSummaryCardsProps {
  totals: DashboardTotals
  isLoading?: boolean
}

export function DashboardSummaryCards({
  totals,
  isLoading = false,
}: DashboardSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Net Worth */}
      <div className="rounded-lg border border-border bg-sidebar p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-violet-100">
            <Wallet weight="duotone" className="size-4 text-violet-600" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Net Worth
          </span>
        </div>
        {isLoading ? (
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <p
            className="tooltip-fast text-xl font-semibold"
            data-tooltip={formatCurrency(totals.netWorth)}
          >
            {formatCompact(totals.netWorth)}
          </p>
        )}
      </div>

      {/* Monthly Income */}
      <div className="rounded-lg border border-border bg-sidebar p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100">
            <ArrowUp weight="bold" className="size-4 text-emerald-600" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            This Month Income
          </span>
        </div>
        {isLoading ? (
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <p
            className="tooltip-fast text-xl font-semibold text-emerald-600"
            data-tooltip={formatCurrency(totals.monthlyIncome)}
          >
            +{formatCompact(totals.monthlyIncome)}
          </p>
        )}
      </div>

      {/* Monthly Expenses */}
      <div className="rounded-lg border border-border bg-sidebar p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-rose-100">
            <ArrowDown weight="bold" className="size-4 text-rose-600" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            This Month Expenses
          </span>
        </div>
        {isLoading ? (
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <p
            className="tooltip-fast text-xl font-semibold text-rose-600"
            data-tooltip={formatCurrency(totals.monthlyExpenses)}
          >
            -{formatCompact(totals.monthlyExpenses)}
          </p>
        )}
      </div>
    </div>
  )
}
