import { useCallback, useRef, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { formatCompact, formatCurrency } from '@/lib/currency'

interface AllocationData {
  id: string
  name: string
  symbol: string
  valueVnd: number
  percentage: number
  color: string
  iconUrl?: string | null
}

interface AllocationPieChartProps {
  allocations: Array<AllocationData>
  totalValueVnd: number
  isLoading?: boolean
}

// Predefined color palette for crypto assets
const COLORS = [
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#10b981', // emerald
  '#f43f5e', // rose
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
  '#6366f1', // indigo
  '#14b8a6', // teal
]

export function getAssetColor(index: number): string {
  return COLORS[index % COLORS.length]
}

export function AllocationPieChart({
  allocations,
  totalValueVnd,
  isLoading = false,
}: AllocationPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const onPieEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index)
  }, [])

  const onPieLeave = useCallback(() => {
    setActiveIndex(null)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }, [])

  // Get the hovered allocation for tooltip
  const hoveredAllocation =
    activeIndex !== null ? allocations[activeIndex] : null

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="size-40 animate-pulse rounded-full bg-muted" />
      </div>
    )
  }

  if (allocations.length === 0) {
    return (
      <div className="flex h-80 flex-col items-center justify-center text-center">
        <div className="size-40 rounded-full border-2 border-dashed border-muted-foreground/30" />
        <p className="mt-4 text-sm text-muted-foreground">
          No assets in portfolio yet
        </p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      onMouseMove={handleMouseMove}
    >
      <ResponsiveContainer width={320} height={320}>
        <PieChart>
          <Pie
            data={allocations}
            cx="50%"
            cy="50%"
            innerRadius={84}
            outerRadius={120}
            dataKey="valueVnd"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            style={{ outline: 'none' }}
          >
            {allocations.map((entry) => (
              <Cell
                key={entry.id}
                fill={entry.color}
                stroke="var(--card)"
                strokeWidth={2}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="pointer-events-none absolute flex size-40 flex-col items-center justify-center rounded-full bg-card">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Total
        </span>
        <span
          className="tooltip-fast text-lg font-semibold"
          data-tooltip={formatCurrency(totalValueVnd)}
        >
          {formatCompact(totalValueVnd)}
        </span>
      </div>

      {/* Custom tooltip */}
      {hoveredAllocation && (
        <div
          className="pointer-events-none absolute z-50 rounded-lg border border-border bg-popover px-3 py-2 shadow-lg"
          style={{
            left: mousePos.x,
            top: mousePos.y - 80,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex items-center gap-2">
            {hoveredAllocation.iconUrl ? (
              <img
                src={hoveredAllocation.iconUrl}
                alt={hoveredAllocation.name}
                className="size-5 rounded-full"
              />
            ) : (
              <div
                className="size-3 rounded"
                style={{ backgroundColor: hoveredAllocation.color }}
              />
            )}
            <span className="font-medium">
              {hoveredAllocation.name}{' '}
              <span className="text-muted-foreground">
                ({hoveredAllocation.symbol})
              </span>
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-4 text-sm">
            <span
              className="tooltip-fast font-semibold"
              data-tooltip={formatCurrency(hoveredAllocation.valueVnd)}
            >
              {formatCompact(hoveredAllocation.valueVnd)}
            </span>
            <span className="text-muted-foreground">
              {hoveredAllocation.percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
