import { useState } from 'react'
import { AllocationHistoryChart } from './allocation-history-chart'
import { ValueHistoryChart } from './value-history-chart'
import type { CryptoAsset, PortfolioTimeRange } from '@/lib/crypto/types'
import { cn } from '@/lib/utils'
import {
  useAllocationHistory,
  useValueHistory,
} from '@/lib/hooks/use-portfolio-history'

type ChartTab = 'allocation' | 'value'

const TIME_RANGES: Array<{ value: PortfolioTimeRange; label: string }> = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '60d', label: '60d' },
  { value: '1y', label: '1y' },
  { value: 'all', label: 'All' },
]

interface PortfolioHistoryChartProps {
  assets?: Array<CryptoAsset>
  exchangeRate?: number
}

export function PortfolioHistoryChart({
  assets = [],
  exchangeRate = 25500,
}: PortfolioHistoryChartProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>('allocation')
  const [timeRange, setTimeRange] = useState<PortfolioTimeRange>('30d')

  // Fetch data based on active tab
  const allocationHistory = useAllocationHistory(timeRange)
  const valueHistory = useValueHistory(timeRange, exchangeRate)

  const isLoading =
    activeTab === 'allocation'
      ? allocationHistory.isLoading
      : valueHistory.isLoading

  // Prepare asset info for allocation chart tooltip
  const assetInfo = assets.map((a) => ({
    coingeckoId: a.coingeckoId,
    name: a.name,
    symbol: a.symbol,
    iconUrl: a.iconUrl,
  }))

  return (
    <div className="flex flex-1 flex-col rounded-lg border border-border bg-sidebar p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        {/* Tabs */}
        <div className="flex rounded-lg border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setActiveTab('allocation')}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              activeTab === 'allocation'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Allocation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('value')}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              activeTab === 'value'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Total Value
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="flex rounded-lg border border-border bg-card p-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => setTimeRange(range.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                timeRange === range.value
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Content */}
      <div className="flex-1">
        {activeTab === 'allocation' ? (
          <AllocationHistoryChart
            data={allocationHistory.data}
            assetIds={allocationHistory.assetIds}
            assets={assetInfo}
            isLoading={isLoading}
          />
        ) : (
          <ValueHistoryChart data={valueHistory.data} isLoading={isLoading} />
        )}
      </div>
    </div>
  )
}
