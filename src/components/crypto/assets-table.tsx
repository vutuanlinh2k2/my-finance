import { useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  CaretDown,
  CaretUp,
  CaretUpDown,
  Minus,
  Trash,
} from '@phosphor-icons/react'
import type { CryptoAsset } from '@/lib/crypto/types'
import {
  formatCryptoAmount,
  formatUsdCompact,
  formatUsdPrice,
} from '@/lib/crypto/utils'
import { formatCompact, formatCurrency } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SortKey =
  | 'price'
  | 'change24h'
  | 'change7d'
  | 'change30d'
  | 'change60d'
  | 'change1y'
  | 'marketCap'
  | 'balance'
  | 'value'
  | 'percentage'

type SortDirection = 'asc' | 'desc'

interface AssetWithPriceData extends CryptoAsset {
  currentPriceVnd: number
  currentPriceUsd: number
  marketCapUsd: number
  priceChange24h: number | null
  priceChange7d: number | null
  priceChange30d: number | null
  priceChange60d: number | null
  priceChange1y: number | null
  balance: number
  valueVnd: number
  portfolioPercentage: number
}

interface AssetsTableProps {
  assets: Array<AssetWithPriceData>
  onDelete: (asset: CryptoAsset) => void
  isLoading?: boolean
}

function PriceChangeCell({ change }: { change: number | null }) {
  if (change === null) {
    return (
      <div className="flex items-center justify-end gap-1 text-muted-foreground">
        <Minus weight="bold" className="size-3" />
        <span>—</span>
      </div>
    )
  }

  const isPositive = change >= 0
  return (
    <div className="flex items-center justify-end gap-1">
      {isPositive ? (
        <ArrowUp weight="bold" className="size-3 text-emerald-600" />
      ) : (
        <ArrowDown weight="bold" className="size-3 text-rose-600" />
      )}
      <span
        className={`font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}
      >
        {isPositive ? '+' : ''}
        {change.toFixed(2)}%
      </span>
    </div>
  )
}

interface SortableHeaderProps {
  label: string
  sortKey: SortKey
  currentSort: SortKey | null
  direction: SortDirection
  onSort: (key: SortKey) => void
}

function SortableHeader({
  label,
  sortKey,
  currentSort,
  direction,
  onSort,
}: SortableHeaderProps) {
  const isActive = currentSort === sortKey

  return (
    <button
      onClick={() => onSort(sortKey)}
      className={cn(
        'flex w-full cursor-pointer items-center justify-end gap-1 text-right text-xs font-medium uppercase tracking-wide whitespace-nowrap transition-colors',
        isActive
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <span>{label}</span>
      {isActive ? (
        direction === 'asc' ? (
          <CaretUp weight="bold" className="size-3" />
        ) : (
          <CaretDown weight="bold" className="size-3" />
        )
      ) : (
        <CaretUpDown weight="bold" className="size-3 opacity-50" />
      )}
    </button>
  )
}

function getSortValue(asset: AssetWithPriceData, key: SortKey): number {
  switch (key) {
    case 'price':
      return asset.currentPriceUsd
    case 'change24h':
      return asset.priceChange24h ?? -Infinity
    case 'change7d':
      return asset.priceChange7d ?? -Infinity
    case 'change30d':
      return asset.priceChange30d ?? -Infinity
    case 'change60d':
      return asset.priceChange60d ?? -Infinity
    case 'change1y':
      return asset.priceChange1y ?? -Infinity
    case 'marketCap':
      return asset.marketCapUsd
    case 'balance':
      return asset.balance
    case 'value':
      return asset.valueVnd
    case 'percentage':
      return asset.portfolioPercentage
  }
}

export function AssetsTable({
  assets,
  onDelete,
  isLoading = false,
}: AssetsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      // Toggle direction if same column
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      // New column, default to descending
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  const sortedAssets = useMemo(() => {
    if (!sortKey) return assets

    return [...assets].sort((a, b) => {
      const aValue = getSortValue(a, sortKey)
      const bValue = getSortValue(b, sortKey)

      if (sortDirection === 'asc') {
        return aValue - bValue
      }
      return bValue - aValue
    })
  }, [assets, sortKey, sortDirection])

  const cellClasses = 'flex items-center justify-end'

  if (isLoading) {
    return (
      <div className="w-full overflow-hidden rounded-lg border border-border bg-sidebar">
        <div className="overflow-x-auto">
          {/* Header */}
          <div className="grid min-w-[1400px] grid-cols-[200px_100px_90px_90px_90px_90px_90px_100px_110px_110px_80px_60px] gap-2 border-b border-border px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Asset
            </span>
            <span className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              Price
            </span>
            <span className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              24h
            </span>
            <span className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              7d
            </span>
            <span className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              30d
            </span>
            <span className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              60d
            </span>
            <span className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              1y
            </span>
            <span className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              Market Cap
            </span>
            <span className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              Balance
            </span>
            <span className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              Value
            </span>
            <span className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              %
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground"></span>
          </div>
        {/* Loading skeleton */}
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="grid min-w-[1400px] grid-cols-[200px_100px_90px_90px_90px_90px_90px_100px_110px_110px_80px_60px] gap-2 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 animate-pulse rounded-full bg-muted" />
                <div className="space-y-1">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-10 animate-pulse rounded bg-muted" />
                </div>
              </div>
              {[...Array(10)].map((_, j) => (
                <div key={j} className="flex items-center justify-end">
                  <div className="h-4 w-14 animate-pulse rounded bg-muted" />
                </div>
              ))}
              <div className="flex items-center justify-center">
                <div className="size-6 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-sidebar py-16">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
          <span className="text-2xl">📊</span>
        </div>
        <h3 className="mb-1 text-lg font-medium">No assets yet</h3>
        <p className="text-sm text-muted-foreground">
          Add your first cryptocurrency to start tracking your portfolio
        </p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-sidebar">
      <div className="overflow-x-auto">
        {/* Table Header */}
        <div className="grid min-w-[1400px] grid-cols-[200px_100px_90px_90px_90px_90px_90px_100px_110px_110px_80px_60px] gap-2 border-b border-border px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Asset
          </span>
          <SortableHeader
            label="Price"
            sortKey="price"
            currentSort={sortKey}
            direction={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="24h"
            sortKey="change24h"
            currentSort={sortKey}
            direction={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="7d"
            sortKey="change7d"
            currentSort={sortKey}
            direction={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="30d"
            sortKey="change30d"
            currentSort={sortKey}
            direction={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="60d"
            sortKey="change60d"
            currentSort={sortKey}
            direction={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="1y"
            sortKey="change1y"
            currentSort={sortKey}
            direction={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Market Cap"
            sortKey="marketCap"
            currentSort={sortKey}
            direction={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Balance"
            sortKey="balance"
            currentSort={sortKey}
            direction={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Value"
            sortKey="value"
            currentSort={sortKey}
            direction={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="%"
            sortKey="percentage"
            currentSort={sortKey}
            direction={sortDirection}
            onSort={handleSort}
          />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground"></span>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border">
          {sortedAssets.map((asset) => (
          <div
            key={asset.id}
            className="grid min-w-[1400px] grid-cols-[200px_100px_90px_90px_90px_90px_90px_100px_110px_110px_80px_60px] gap-2 px-4 py-3 transition-colors hover:bg-muted/30"
          >
            {/* Asset (icon + symbol) */}
            <div className="flex items-center gap-3">
              {asset.iconUrl ? (
                <img
                  src={asset.iconUrl}
                  alt={asset.name}
                  className="size-8 rounded-full"
                />
              ) : (
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                  {asset.symbol.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate font-medium">{asset.name}</div>
                <div className="text-xs text-muted-foreground">
                  {asset.symbol}
                </div>
              </div>
            </div>

            {/* Price (USD) */}
            <div className={cellClasses}>
              <span
                className="tooltip-fast font-medium"
                data-tooltip={formatUsdPrice(asset.currentPriceUsd)}
              >
                {formatUsdPrice(asset.currentPriceUsd)}
              </span>
            </div>

            {/* 24h Change */}
            <PriceChangeCell change={asset.priceChange24h} />

            {/* 7d Change */}
            <PriceChangeCell change={asset.priceChange7d} />

            {/* 30d Change */}
            <PriceChangeCell change={asset.priceChange30d} />

            {/* 60d Change */}
            <PriceChangeCell change={asset.priceChange60d} />

            {/* 1y Change */}
            <PriceChangeCell change={asset.priceChange1y} />

            {/* Market Cap */}
            <div className={cellClasses}>
              <span className="text-sm text-muted-foreground">
                {asset.marketCapUsd > 0
                  ? formatUsdCompact(asset.marketCapUsd)
                  : '—'}
              </span>
            </div>

            {/* Balance */}
            <div className={cellClasses}>
              <span className="text-sm">
                {formatCryptoAmount(asset.balance, asset.symbol)}
              </span>
            </div>

            {/* Value (VND) */}
            <div className={cellClasses}>
              <span
                className="tooltip-fast font-medium"
                data-tooltip={formatCurrency(asset.valueVnd)}
              >
                {formatCompact(asset.valueVnd)}
              </span>
            </div>

            {/* Portfolio % */}
            <div className={cellClasses}>
              <span className="text-sm text-muted-foreground">
                {asset.portfolioPercentage > 0
                  ? `${asset.portfolioPercentage.toFixed(1)}%`
                  : '—'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(asset)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash weight="duotone" className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3">
        <span className="text-sm text-muted-foreground">
          {assets.length} asset{assets.length !== 1 ? 's' : ''} in portfolio
        </span>
      </div>
    </div>
  )
}
