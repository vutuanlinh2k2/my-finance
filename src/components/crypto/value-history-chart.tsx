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
import type { ValueHistoryPoint } from '@/lib/crypto/types'
import { formatCompact, formatCurrency } from '@/lib/currency'

interface ValueHistoryChartProps {
  data: Array<ValueHistoryPoint>
  isLoading?: boolean
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
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<TooltipPayloadItem>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.[0] || !label) return null

  const value = payload[0].value

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <div className="text-sm text-muted-foreground">{formatDate(label)}</div>
      <div
        className="tooltip-fast mt-1 text-lg font-semibold"
        data-tooltip={formatCurrency(value)}
      >
        {formatCompact(value)}
      </div>
    </div>
  )
}

export function ValueHistoryChart({
  data,
  isLoading = false,
}: ValueHistoryChartProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <ChartLineUp
          weight="duotone"
          className="size-12 text-muted-foreground/30"
        />
        <p className="mt-3 font-medium text-muted-foreground">
          No historical data yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Portfolio snapshots will be collected daily
        </p>
      </div>
    )
  }

  // Calculate min/max for better Y axis range
  const values = data.map((d) => d.valueVnd)
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
          <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
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
          dataKey="valueVnd"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#valueGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
