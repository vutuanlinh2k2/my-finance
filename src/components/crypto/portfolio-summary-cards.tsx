import {
  ArrowDown,
  ArrowUp,
  ChartLine,
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

interface PortfolioSummaryCardsProps {
  totalValueVnd: number
  change24h: number // percentage
  change7d: number // percentage
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

function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function PortfolioSummaryCards({
  totalValueVnd,
  change24h,
  change7d,
  isLoading = false,
  exchangeRate,
}: PortfolioSummaryCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Total Portfolio Value */}
      <div className="rounded-lg border border-border bg-sidebar p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100">
            <Wallet weight="duotone" className="size-4 text-emerald-600" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Portfolio Value
          </span>
          <span
            className="tooltip-fast"
            data-tooltip="Total value of all crypto assets"
          >
            <Info weight="fill" className="size-3.5 text-muted-foreground/50" />
          </span>
        </div>
        {isLoading ? (
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <p
            className="tooltip-fast text-xl font-semibold"
            data-tooltip={formatCurrency(totalValueVnd)}
          >
            {formatCompact(totalValueVnd)}
          </p>
        )}
      </div>

      {/* 24h Change */}
      <div className="rounded-lg border border-border bg-sidebar p-4">
        <div className="mb-2 flex items-center gap-2">
          <div
            className={`flex size-8 items-center justify-center rounded-lg ${
              change24h >= 0 ? 'bg-emerald-100' : 'bg-rose-100'
            }`}
          >
            {change24h >= 0 ? (
              <ArrowUp weight="bold" className="size-4 text-emerald-600" />
            ) : (
              <ArrowDown weight="bold" className="size-4 text-rose-600" />
            )}
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            24h Change
          </span>
        </div>
        {isLoading ? (
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <p
            className={`text-xl font-semibold ${
              change24h >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatPercentage(change24h)}
          </p>
        )}
      </div>

      {/* 7d Change */}
      <div className="rounded-lg border border-border bg-sidebar p-4">
        <div className="mb-2 flex items-center gap-2">
          <div
            className={`flex size-8 items-center justify-center rounded-lg ${
              change7d >= 0 ? 'bg-emerald-100' : 'bg-rose-100'
            }`}
          >
            <ChartLine
              weight="duotone"
              className={`size-4 ${
                change7d >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            />
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            7d Change
          </span>
        </div>
        {isLoading ? (
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <p
            className={`text-xl font-semibold ${
              change7d >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatPercentage(change7d)}
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
