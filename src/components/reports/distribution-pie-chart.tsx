import { useCallback, useRef, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import type { TagDistribution } from '@/lib/reports/types'
import { formatCompact, formatCurrency } from '@/lib/currency'

interface DistributionPieChartProps {
  distributions: Array<TagDistribution>
  centerLabel: string
  onSegmentClick?: (tagId: string | null) => void
  selectedTagId?: string | null
}

export function DistributionPieChart({
  distributions,
  centerLabel,
  onSegmentClick,
  selectedTagId,
}: DistributionPieChartProps) {
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

  const handleClick = useCallback(
    (data: TagDistribution) => {
      onSegmentClick?.(data.tagId)
    },
    [onSegmentClick],
  )

  // Find selected index for visual feedback
  const selectedIndex = distributions.findIndex(
    (d) => d.tagId === selectedTagId,
  )

  // Get the hovered distribution for tooltip
  const hoveredDistribution =
    activeIndex !== null ? distributions[activeIndex] : null

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      onMouseMove={handleMouseMove}
    >
      <ResponsiveContainer width={320} height={320}>
        <PieChart>
          <Pie
            data={distributions}
            cx="50%"
            cy="50%"
            innerRadius={84}
            outerRadius={120}
            dataKey="amount"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            onClick={(_, index) => handleClick(distributions[index])}
            style={{ cursor: 'pointer', outline: 'none' }}
          >
            {distributions.map((entry) => (
              <Cell
                key={entry.tagId ?? 'untagged'}
                fill={entry.color}
                stroke="var(--card)"
                strokeWidth={2}
              />
            ))}
          </Pie>

          {/* Overlay pie for selected segment border - renders on top */}
          {selectedIndex !== -1 && (
            <Pie
              data={distributions}
              cx="50%"
              cy="50%"
              innerRadius={84}
              outerRadius={120}
              dataKey="amount"
              isAnimationActive={false}
              style={{ pointerEvents: 'none' }}
            >
              {distributions.map((entry, index) => (
                <Cell
                  key={`border-${entry.tagId ?? 'untagged'}`}
                  fill="none"
                  stroke={selectedIndex === index ? '#f59e0b' : 'transparent'}
                  strokeWidth={selectedIndex === index ? 3 : 0}
                />
              ))}
            </Pie>
          )}
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="pointer-events-none absolute flex size-40 flex-col items-center justify-center rounded-full bg-card">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Period
        </span>
        <span className="text-lg font-semibold">{centerLabel}</span>
      </div>

      {/* Custom tooltip - rendered outside chart with high z-index */}
      {hoveredDistribution && (
        <div
          className="pointer-events-none absolute z-50 rounded-lg border border-border bg-popover px-3 py-2 shadow-lg"
          style={{
            left: mousePos.x,
            top: mousePos.y - 80,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="size-3 rounded"
              style={{ backgroundColor: hoveredDistribution.color }}
            />
            <span className="font-medium">{hoveredDistribution.tagName}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-4 text-sm">
            <span
              className="font-semibold tooltip-fast"
              data-tooltip={formatCurrency(hoveredDistribution.amount)}
            >
              {formatCompact(hoveredDistribution.amount)}
            </span>
            <span className="text-muted-foreground">
              {hoveredDistribution.percentage}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
