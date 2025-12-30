import { CalendarDots, Coins, Wallet } from '@phosphor-icons/react'
import { formatCompact, formatCurrency } from '@/lib/currency'

interface SubscriptionSummaryCardsProps {
  avgMonthly: number
  totalMonthly: number
  totalYearly: number
  isLoading?: boolean
}

export function SubscriptionSummaryCards({
  avgMonthly,
  totalMonthly,
  totalYearly,
  isLoading = false,
}: SubscriptionSummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Average Monthly Cost */}
      <div className="rounded-lg border border-border bg-sidebar p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100">
            <CalendarDots weight="duotone" className="size-4 text-amber-600" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Average Monthly Cost
          </span>
        </div>
        {isLoading ? (
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <p
            className="tooltip-fast text-xl font-semibold"
            data-tooltip={formatCurrency(avgMonthly)}
          >
            {formatCompact(avgMonthly)}
          </p>
        )}
      </div>

      {/* Total Monthly Cost */}
      <div className="rounded-lg border border-border bg-sidebar p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-rose-100">
            <Coins weight="duotone" className="size-4 text-rose-600" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total Monthly Cost
          </span>
        </div>
        {isLoading ? (
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <p
            className="tooltip-fast text-xl font-semibold"
            data-tooltip={formatCurrency(totalMonthly)}
          >
            {formatCompact(totalMonthly)}
          </p>
        )}
      </div>

      {/* Total Yearly Cost */}
      <div className="rounded-lg border border-border bg-sidebar p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100">
            <Wallet weight="duotone" className="size-4 text-emerald-600" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total Yearly Cost
          </span>
        </div>
        {isLoading ? (
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <p
            className="tooltip-fast text-xl font-semibold"
            data-tooltip={formatCurrency(totalYearly)}
          >
            {formatCompact(totalYearly)}
          </p>
        )}
      </div>
    </div>
  )
}
