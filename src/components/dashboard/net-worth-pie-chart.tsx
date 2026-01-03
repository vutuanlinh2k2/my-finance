import { useCallback, useRef, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Wallet } from '@phosphor-icons/react'
import type { NetWorthSegment } from '@/lib/dashboard/types'
import { formatCompact, formatCurrency } from '@/lib/currency'

interface NetWorthPieChartProps {
  segments: Array<NetWorthSegment>
  totalNetWorth: number
  isLoading?: boolean
}

export function NetWorthPieChart({
  segments,
  totalNetWorth,
  isLoading = false,
}: NetWorthPieChartProps) {
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

  const hoveredSegment = activeIndex !== null ? segments[activeIndex] : null

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="size-40 animate-pulse rounded-full bg-muted" />
      </div>
    )
  }

  // Empty state: both bank and crypto are 0
  if (totalNetWorth === 0) {
    return (
      <div className="flex h-80 flex-col items-center justify-center text-center">
        <div className="flex size-40 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30">
          <Wallet
            weight="duotone"
            className="size-12 text-muted-foreground/30"
          />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          No assets tracked yet
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Add transactions or crypto assets to see your net worth
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
            data={segments}
            cx="50%"
            cy="50%"
            innerRadius={84}
            outerRadius={120}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            style={{ outline: 'none' }}
          >
            {segments.map((entry) => (
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
          Net Worth
        </span>
        <span
          className="tooltip-fast text-lg font-semibold"
          data-tooltip={formatCurrency(totalNetWorth)}
        >
          {formatCompact(totalNetWorth)}
        </span>
      </div>

      {/* Custom tooltip */}
      {hoveredSegment && (
        <div
          className="pointer-events-none absolute z-50 rounded-lg border border-border bg-popover px-3 py-2 shadow-lg"
          style={{
            left: mousePos.x,
            top: mousePos.y - 70,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="size-3 rounded"
              style={{ backgroundColor: hoveredSegment.color }}
            />
            <span className="font-medium">{hoveredSegment.name}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-4 text-sm">
            <span
              className="tooltip-fast font-semibold"
              data-tooltip={formatCurrency(hoveredSegment.value)}
            >
              {formatCompact(hoveredSegment.value)}
            </span>
            <span className="text-muted-foreground">
              {hoveredSegment.percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
