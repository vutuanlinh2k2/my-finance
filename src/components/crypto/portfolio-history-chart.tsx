import { useState } from 'react'
import { ChartLine } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type ChartTab = 'allocation' | 'value'
type TimeRange = '7d' | '30d' | '60d' | '1y' | 'all'

const TIME_RANGES: Array<{ value: TimeRange; label: string }> = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '60d', label: '60d' },
  { value: '1y', label: '1y' },
  { value: 'all', label: 'All' },
]

export function PortfolioHistoryChart() {
  const [activeTab, setActiveTab] = useState<ChartTab>('allocation')
  const [_timeRange, setTimeRange] = useState<TimeRange>('30d')

  return (
    <div className="flex flex-1 flex-col rounded-lg border border-border bg-sidebar p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        {/* Tabs - matching reports header style */}
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

        {/* Time Range Selector (disabled for now) */}
        <div className="flex rounded-lg border border-border bg-card p-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => setTimeRange(range.value)}
              disabled
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                'cursor-not-allowed text-muted-foreground/50',
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State / Coming Soon */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <ChartLine
          weight="duotone"
          className="size-12 text-muted-foreground/30"
        />
        <p className="mt-3 font-medium text-muted-foreground">
          Historical data coming soon
        </p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Portfolio snapshots will be collected daily
        </p>
      </div>
    </div>
  )
}
