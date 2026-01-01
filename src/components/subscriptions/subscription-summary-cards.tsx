import {
  CalendarDots,
  Coins,
  CurrencyDollar,
  Info,
  Wallet,
} from '@phosphor-icons/react'
import { formatCompact, formatCurrency } from '@/lib/currency'

interface ExchangeRateInfo {
  rate: number
  source: 'api' | 'cache' | 'fallback' | 'default'
  lastUpdated: Date | null
  isLoading: boolean
}

interface SubscriptionSummaryCardsProps {
  avgMonthly: number
  totalMonthly: number
  totalYearly: number
  isLoading?: boolean
  exchangeRate?: ExchangeRateInfo
}

function formatExchangeRateTooltip(info: ExchangeRateInfo): string {
  const rate = info.rate.toLocaleString('en-US')
  const sourceLabel = {
    api: 'Live rate',
    cache: 'Cached rate',
    fallback: 'Fallback rate',
    default: 'Default rate',
  }[info.source]

  if (info.lastUpdated) {
    const updated = info.lastUpdated.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
    return `1 USD = ${rate} VND\n${sourceLabel} • Updated ${updated}`
  }

  return `1 USD = ${rate} VND\n${sourceLabel}`
}

export function SubscriptionSummaryCards({
  avgMonthly,
  totalMonthly,
  totalYearly,
  isLoading = false,
  exchangeRate,
}: SubscriptionSummaryCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Monthly Cost - true average cost per month (monthly + yearly/12) */}
      <div className="rounded-lg border border-border bg-sidebar p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100">
            <CalendarDots weight="duotone" className="size-4 text-amber-600" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Monthly Cost
          </span>
          <span
            className="tooltip-fast"
            data-tooltip="Monthly plans + annual plans ÷ 12"
          >
            <Info
              weight="fill"
              className="size-3.5 text-muted-foreground/50"
            />
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

      {/* Monthly Plans - sum of monthly-billed subscriptions only */}
      <div className="rounded-lg border border-border bg-sidebar p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-rose-100">
            <Coins weight="duotone" className="size-4 text-rose-600" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Monthly Plans
          </span>
          <span
            className="tooltip-fast"
            data-tooltip="Total from subscriptions billed monthly"
          >
            <Info
              weight="fill"
              className="size-3.5 text-muted-foreground/50"
            />
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

      {/* Annual Plans - sum of yearly-billed subscriptions only */}
      <div className="rounded-lg border border-border bg-sidebar p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100">
            <Wallet weight="duotone" className="size-4 text-emerald-600" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Annual Plans
          </span>
          <span
            className="tooltip-fast"
            data-tooltip="Total from subscriptions billed yearly"
          >
            <Info
              weight="fill"
              className="size-3.5 text-muted-foreground/50"
            />
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

      {/* Exchange Rate - USD to VND conversion rate */}
      <div className="rounded-lg border border-border bg-sidebar p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100">
            <CurrencyDollar weight="duotone" className="size-4 text-blue-600" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            USD Rate
          </span>
          {exchangeRate && (
            <span
              className="tooltip-fast"
              data-tooltip={formatExchangeRateTooltip(exchangeRate)}
            >
              <Info
                weight="fill"
                className="size-3.5 text-muted-foreground/50"
              />
            </span>
          )}
        </div>
        {!exchangeRate || exchangeRate.isLoading ? (
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <div className="flex items-baseline gap-1.5">
            <p className="text-xl font-semibold">
              {exchangeRate.rate.toLocaleString('en-US')}
            </p>
            <span className="text-xs text-muted-foreground">VND</span>
            {exchangeRate.source === 'fallback' ||
            exchangeRate.source === 'default' ? (
              <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                Offline
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
