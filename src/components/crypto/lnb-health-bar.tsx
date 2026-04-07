import { Skeleton } from '@/components/ui/skeleton'
import { convertUsdToVnd } from '@/lib/crypto/utils'
import { formatCompact, formatCurrency } from '@/lib/currency'
import {
  formatUsdDetailed,
  getHealthBarMetrics,
  getRelativePosition,
} from '@/lib/aave/lnb'

interface LnbHealthBarProps {
  borrowedUsd: number
  borrowLimitUsd: number
  liquidationThresholdUsd: number | null
  exchangeRate: number
  isLoading?: boolean
}

export function LnbHealthBar({
  borrowedUsd,
  borrowLimitUsd,
  liquidationThresholdUsd,
  exchangeRate,
  isLoading = false,
}: LnbHealthBarProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-sidebar p-5">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-full rounded-full" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
      </div>
    )
  }

  const metrics = getHealthBarMetrics({
    borrowedUsd,
    borrowLimitUsd,
    liquidationUsd: liquidationThresholdUsd,
  })

  const scaleMax = Math.max(
    metrics.borrowedUsd,
    metrics.borrowLimitUsd,
    metrics.liquidationUsd ?? 0,
    1,
  )

  const borrowedWidth = getRelativePosition(metrics.borrowedUsd, scaleMax) ?? 0
  const borrowLimitPosition =
    getRelativePosition(metrics.borrowLimitUsd, scaleMax) ?? 0
  const liquidationPosition = getRelativePosition(metrics.liquidationUsd, scaleMax)
  const borrowedVnd = convertUsdToVnd(metrics.borrowedUsd, exchangeRate)
  const borrowLimitVnd = convertUsdToVnd(metrics.borrowLimitUsd, exchangeRate)
  const liquidationVnd =
    metrics.liquidationUsd === null
      ? null
      : convertUsdToVnd(metrics.liquidationUsd, exchangeRate)

  return (
    <div className="rounded-lg border border-border bg-sidebar p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Health Bar
          </h2>
          <p className="text-sm text-muted-foreground">
            Current debt against your safe borrowing limit and liquidation point.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">USD scale</span>
      </div>

      <div className="relative h-4 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${borrowedWidth}%` }}
        />

        <div
          className="absolute top-1/2 h-6 w-0.5 -translate-y-1/2 bg-amber-500"
          style={{ left: `${borrowLimitPosition}%` }}
        />

        {liquidationPosition !== null ? (
          <div
            className="absolute top-1/2 h-6 w-0.5 -translate-y-1/2 bg-rose-500"
            style={{ left: `${liquidationPosition}%` }}
          />
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Borrowed
          </p>
          <div className="flex flex-wrap items-baseline gap-2">
            <p
              className="tooltip-fast font-semibold"
              data-tooltip={formatUsdDetailed(metrics.borrowedUsd)}
            >
              {formatUsdDetailed(metrics.borrowedUsd)}
            </p>
            <p
              className="tooltip-fast text-xs text-muted-foreground"
              data-tooltip={formatCurrency(borrowedVnd)}
            >
              {formatCompact(borrowedVnd)}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Borrow Limit
          </p>
          <div className="flex flex-wrap items-baseline gap-2">
            <p
              className="tooltip-fast font-semibold"
              data-tooltip={formatUsdDetailed(metrics.borrowLimitUsd)}
            >
              {formatUsdDetailed(metrics.borrowLimitUsd)}
            </p>
            <p
              className="tooltip-fast text-xs text-muted-foreground"
              data-tooltip={formatCurrency(borrowLimitVnd)}
            >
              {formatCompact(borrowLimitVnd)}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Liquidation Point
          </p>
          <div className="flex flex-wrap items-baseline gap-2">
            <p
              className="tooltip-fast font-semibold"
              data-tooltip={
                metrics.liquidationUsd === null
                  ? 'Borrowing is required before a liquidation point can be estimated.'
                  : formatUsdDetailed(metrics.liquidationUsd)
              }
            >
              {metrics.liquidationUsd === null
                ? '—'
                : formatUsdDetailed(metrics.liquidationUsd)}
            </p>
            <p
              className="tooltip-fast text-xs text-muted-foreground"
              data-tooltip={
                liquidationVnd === null
                  ? 'Borrowing is required before a liquidation point can be estimated.'
                  : formatCurrency(liquidationVnd)
              }
            >
              {liquidationVnd === null ? '—' : formatCompact(liquidationVnd)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
