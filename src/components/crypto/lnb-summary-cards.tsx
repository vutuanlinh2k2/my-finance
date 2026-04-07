import { ArrowDown, HandCoins, ShieldCheck, Wallet } from '@phosphor-icons/react'
import { convertUsdToVnd, formatUsdCompact } from '@/lib/crypto/utils'
import { formatCompact, formatCurrency } from '@/lib/currency'
import {
  formatUsdDetailed,
  getHealthStatus,
} from '@/lib/aave/lnb'

interface LnbSummaryCardsProps {
  healthFactor: number | null
  totalCollateralUsd: number
  totalBorrowedUsd: number
  availableToBorrowUsd: number
  exchangeRate: number
  isLoading?: boolean
}

function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-sidebar p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="size-8 animate-pulse rounded-lg bg-muted" />
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-7 w-28 animate-pulse rounded bg-muted" />
    </div>
  )
}

export function LnbSummaryCards({
  healthFactor,
  totalCollateralUsd,
  totalBorrowedUsd,
  availableToBorrowUsd,
  exchangeRate,
  isLoading = false,
}: LnbSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    )
  }

  const healthStatus = getHealthStatus(healthFactor)
  const totalCollateralVnd = convertUsdToVnd(totalCollateralUsd, exchangeRate)
  const totalBorrowedVnd = convertUsdToVnd(totalBorrowedUsd, exchangeRate)
  const availableToBorrowVnd = convertUsdToVnd(availableToBorrowUsd, exchangeRate)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-lg border border-border bg-sidebar p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100">
            <ShieldCheck weight="duotone" className="size-4 text-emerald-600" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Health Factor
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className={`text-xl font-semibold ${healthStatus.toneClass}`}>
            {healthFactor === null ? '—' : healthFactor.toFixed(2)}
          </p>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${healthStatus.badgeClass}`}
          >
            {healthStatus.label}
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-sidebar p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sky-100">
            <Wallet weight="duotone" className="size-4 text-sky-600" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total Collateral
          </span>
        </div>
        <div className="flex flex-wrap items-baseline gap-2">
          <p
            className="tooltip-fast text-xl font-semibold"
            data-tooltip={formatUsdDetailed(totalCollateralUsd)}
          >
            {formatUsdCompact(totalCollateralUsd)}
          </p>
          <p
            className="tooltip-fast text-sm text-muted-foreground"
            data-tooltip={formatCurrency(totalCollateralVnd)}
          >
            {formatCompact(totalCollateralVnd)}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-sidebar p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-rose-100">
            <ArrowDown weight="bold" className="size-4 text-rose-600" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total Borrowed
          </span>
        </div>
        <div className="flex flex-wrap items-baseline gap-2">
          <p
            className="tooltip-fast text-xl font-semibold"
            data-tooltip={formatUsdDetailed(totalBorrowedUsd)}
          >
            {formatUsdCompact(totalBorrowedUsd)}
          </p>
          <p
            className="tooltip-fast text-sm text-muted-foreground"
            data-tooltip={formatCurrency(totalBorrowedVnd)}
          >
            {formatCompact(totalBorrowedVnd)}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-sidebar p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100">
            <HandCoins weight="duotone" className="size-4 text-amber-600" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Available To Borrow
          </span>
        </div>
        <div className="flex flex-wrap items-baseline gap-2">
          <p
            className="tooltip-fast text-xl font-semibold"
            data-tooltip={formatUsdDetailed(availableToBorrowUsd)}
          >
            {formatUsdCompact(availableToBorrowUsd)}
          </p>
          <p
            className="tooltip-fast text-sm text-muted-foreground"
            data-tooltip={formatCurrency(availableToBorrowVnd)}
          >
            {formatCompact(availableToBorrowVnd)}
          </p>
        </div>
      </div>
    </div>
  )
}
