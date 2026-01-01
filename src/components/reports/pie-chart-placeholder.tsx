import { useState } from 'react'
import type { TagDistribution } from '@/lib/reports/types'
import { formatCompact, formatCurrency } from '@/lib/currency'

interface PieChartPlaceholderProps {
  distributions: Array<TagDistribution>
  centerLabel: string
  onSegmentClick?: (tagId: string | null) => void
  selectedTagId?: string | null
}

export function PieChartPlaceholder({
  distributions,
  centerLabel,
  onSegmentClick,
  selectedTagId,
}: PieChartPlaceholderProps) {
  const [hoveredSegment, setHoveredSegment] = useState<TagDistribution | null>(
    null,
  )
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const size = 224 // size-56 = 14rem = 224px
  const center = size / 2
  const outerRadius = size / 2
  const innerRadius = 72 // size-36 / 2 = 72px

  // Calculate path for each segment
  const getSegmentPath = (startAngle: number, endAngle: number) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180
    const endRad = ((endAngle - 90) * Math.PI) / 180

    const x1 = center + outerRadius * Math.cos(startRad)
    const y1 = center + outerRadius * Math.sin(startRad)
    const x2 = center + outerRadius * Math.cos(endRad)
    const y2 = center + outerRadius * Math.sin(endRad)

    const x3 = center + innerRadius * Math.cos(endRad)
    const y3 = center + innerRadius * Math.sin(endRad)
    const x4 = center + innerRadius * Math.cos(startRad)
    const y4 = center + innerRadius * Math.sin(startRad)

    const largeArc = endAngle - startAngle > 180 ? 1 : 0

    return `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `
  }

  // Build segments with angles
  let currentAngle = 0
  const segments = distributions.map((dist) => {
    const startAngle = currentAngle
    const sweepAngle = (dist.percentage / 100) * 360
    currentAngle += sweepAngle
    return {
      ...dist,
      startAngle,
      endAngle: startAngle + sweepAngle,
      path: getSegmentPath(startAngle, startAngle + sweepAngle),
    }
  })

  const handleMouseMove = (
    e: React.MouseEvent<SVGPathElement>,
    segment: TagDistribution,
  ) => {
    const rect = e.currentTarget.closest('svg')?.getBoundingClientRect()
    if (rect) {
      setTooltipPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
    setHoveredSegment(segment)
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {segments.map((segment) => (
          <path
            key={segment.tagId ?? 'untagged'}
            d={segment.path}
            fill={segment.color}
            stroke={
              selectedTagId === segment.tagId ? 'var(--primary)' : 'transparent'
            }
            strokeWidth={selectedTagId === segment.tagId ? 3 : 0}
            className="cursor-pointer transition-opacity hover:opacity-80"
            onMouseMove={(e) => handleMouseMove(e, segment)}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={() => onSegmentClick?.(segment.tagId)}
          />
        ))}
      </svg>

      {/* Center label */}
      <div className="pointer-events-none absolute flex size-36 flex-col items-center justify-center rounded-full bg-card">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          PERIOD
        </span>
        <span className="text-lg font-semibold">{centerLabel}</span>
      </div>

      {/* Tooltip */}
      {hoveredSegment && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-border bg-popover px-3 py-2 shadow-lg"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y - 70,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="size-3 rounded"
              style={{ backgroundColor: hoveredSegment.color }}
            />
            <span className="font-medium">{hoveredSegment.tagName}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-4 text-sm">
            <span
              className="font-semibold tooltip-fast"
              data-tooltip={formatCurrency(hoveredSegment.amount)}
            >
              {formatCompact(hoveredSegment.amount)}
            </span>
            <span className="text-muted-foreground">
              {hoveredSegment.percentage}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
