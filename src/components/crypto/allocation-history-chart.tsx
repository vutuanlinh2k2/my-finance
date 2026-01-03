import { useMemo } from 'react'
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
import { getAssetColor } from './allocation-pie-chart'
import type { AllocationHistoryPoint } from '@/lib/crypto/types'

interface AssetInfo {
  coingeckoId: string
  name: string
  symbol: string
  iconUrl?: string | null
}

interface AllocationHistoryChartProps {
  data: Array<AllocationHistoryPoint>
  assetIds: Array<string>
  assets: Array<AssetInfo>
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
  dataKey: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<TooltipPayloadItem>
  label?: string
  assets: Array<AssetInfo>
}

function CustomTooltip({ active, payload, label, assets }: CustomTooltipProps) {
  if (!active || !payload || !label) return null

  const assetMap = new Map(assets.map((a) => [a.coingeckoId, a]))

  // Sort by percentage descending
  const sorted = [...payload]
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value)

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <div className="mb-2 text-sm font-medium">{formatDate(label)}</div>
      <div className="space-y-1">
        {sorted.map((entry) => {
          const asset = assetMap.get(entry.dataKey)
          return (
            <div
              key={entry.dataKey}
              className="flex items-center gap-2 text-sm"
            >
              <div
                className="size-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">
                {asset?.symbol ?? entry.dataKey}
              </span>
              <span className="ml-auto font-medium">
                {entry.value.toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AllocationHistoryChart({
  data,
  assetIds,
  assets,
  isLoading = false,
}: AllocationHistoryChartProps) {
  // Create color map for assets
  const colorMap = useMemo(() => {
    const map = new Map<string, string>()
    assetIds.forEach((id, index) => {
      map.set(id, getAssetColor(index))
    })
    return map
  }, [assetIds])

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

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
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
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          width={50}
          domain={[0, 100]}
        />
        <Tooltip content={<CustomTooltip assets={assets} />} />
        {assetIds.map((id) => (
          <Area
            key={id}
            type="monotone"
            dataKey={id}
            stackId="1"
            stroke={colorMap.get(id)}
            fill={colorMap.get(id)}
            fillOpacity={0.8}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
