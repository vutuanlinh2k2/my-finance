import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartLineUp } from '@phosphor-icons/react'
import type { NetWorthSnapshot, TimeRange } from '@/lib/dashboard/types'
import { cn } from '@/lib/utils'
import { formatCompact, formatCurrency } from '@/lib/currency'

const TIME_RANGES: Array<{ value: TimeRange; label: string }> = [
  { value: '1m', label: '1M' },
  { value: '1y', label: '1Y' },
  { value: 'all', label: 'All' },
]

interface NetWorthHistoryChartProps {
  data: Array<NetWorthSnapshot>
  isLoading?: boolean
  onTimeRangeChange?: (range: TimeRange) => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

interface TooltipPayloadItem {
  value: number
  payload: NetWorthSnapshot
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<TooltipPayloadItem>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.[0] || !label) return null

  const data = payload[0].payload

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <div className="text-sm text-muted-foreground">{formatDate(label)}</div>
      <div
        className="tooltip-fast mt-1 text-lg font-semibold"
        data-tooltip={formatCurrency(data.totalNetWorth)}
      >
        {formatCompact(data.totalNetWorth)}
      </div>
      <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-emerald-500" />
          Bank: {formatCompact(data.bankBalance)}
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-blue-500" />
          Crypto: {formatCompact(data.cryptoValue)}
        </span>
      </div>
    </div>
  )
}

export function NetWorthHistoryChart({
  data,
  isLoading = false,
  onTimeRangeChange,
}: NetWorthHistoryChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1m')

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range)
    onTimeRangeChange?.(range)
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col rounded-lg border border-border bg-sidebar p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-sidebar p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Net Worth History
        </h3>

        {/* Time Range Selector */}
        <div className="flex rounded-lg border border-border bg-card p-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => handleTimeRangeChange(range.value)}
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
        {data.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <ChartLineUp
              weight="duotone"
              className="size-12 text-muted-foreground/30"
            />
            <p className="mt-3 font-medium text-muted-foreground">
              No historical data yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Net worth snapshots will be collected daily
            </p>
          </div>
        ) : (
          <ChartContent data={data} />
        )}
      </div>
    </div>
  )
}

function ChartContent({ data }: { data: Array<NetWorthSnapshot> }) {
  // Calculate min/max for better Y axis range
  const values = data.map((d) => d.totalNetWorth)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const padding = (maxValue - minValue) * 0.1 || maxValue * 0.1

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="var(--border)"
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatCompact(v)}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          width={70}
          domain={[Math.max(0, minValue - padding), maxValue + padding]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="totalNetWorth"
          stroke="#8b5cf6"
          strokeWidth={2}
          fill="url(#netWorthGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
