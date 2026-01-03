import { useCallback, useRef, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Buildings, Wallet as WalletIcon } from '@phosphor-icons/react'
import type { CryptoStorageWithValue } from '@/lib/crypto/types'
import { formatCompact, formatCurrency } from '@/lib/currency'

interface StoragePieChartProps {
  storages: Array<CryptoStorageWithValue>
  totalValueVnd: number
  selectedId: string | null
  onSelect: (id: string | null) => void
}

// Predefined color palette for storages
const STORAGE_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#10b981', // emerald
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
]

export function getStorageColor(index: number): string {
  return STORAGE_COLORS[index % STORAGE_COLORS.length]
}

export function StoragePieChart({
  storages,
  selectedId,
  onSelect,
}: StoragePieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const onPieEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index)
  }, [])

  const onPieLeave = useCallback(() => {
    setActiveIndex(null)
  }, [])

  const handlePieClick = useCallback(
    (_: unknown, index: number) => {
      const storageId = storages[index].id
      // Toggle selection if clicking the same storage
      onSelect(selectedId === storageId ? null : storageId)
    },
    [storages, selectedId, onSelect],
  )

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }, [])

  // Get the hovered storage for tooltip
  const hoveredStorage = activeIndex !== null ? storages[activeIndex] : null

  // Find selected index for visual feedback
  const selectedIndex = storages.findIndex((s) => s.id === selectedId)

  if (storages.length === 0) {
    return (
      <div className="flex h-[280px] flex-col items-center justify-center text-center">
        <div className="size-40 rounded-full border-2 border-dashed border-muted-foreground/30" />
        <p className="mt-3 text-sm text-muted-foreground">No storages yet</p>
      </div>
    )
  }

  // Check if all values are zero - use equal distribution for visualization
  const allZeroValues = storages.every((s) => s.totalValueVnd === 0)
  const chartData = allZeroValues
    ? storages.map((s) => ({ ...s, displayValue: 1 }))
    : storages

  const dataKey = allZeroValues ? 'displayValue' : 'totalValueVnd'

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      onMouseMove={handleMouseMove}
    >
      <ResponsiveContainer width={280} height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={105}
            dataKey={dataKey}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            onClick={handlePieClick}
            style={{ cursor: 'pointer', outline: 'none' }}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.id}
                fill={entry.color}
                stroke="var(--card)"
                strokeWidth={2}
              />
            ))}
          </Pie>

          {/* Overlay pie for selected segment border - renders on top */}
          {selectedIndex !== -1 && (
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={105}
              dataKey={dataKey}
              isAnimationActive={false}
              style={{ pointerEvents: 'none' }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`border-${entry.id}`}
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
      <div className="pointer-events-none absolute flex size-32 flex-col items-center justify-center rounded-full bg-card">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Storages
        </span>
        <span className="text-lg font-semibold">{storages.length}</span>
      </div>

      {/* Custom tooltip */}
      {hoveredStorage && (
        <StorageTooltip
          storage={hoveredStorage}
          mousePos={mousePos}
          showPercentage={!allZeroValues}
        />
      )}
    </div>
  )
}

function StorageTooltip({
  storage,
  mousePos,
  showPercentage = true,
}: {
  storage: CryptoStorageWithValue
  mousePos: { x: number; y: number }
  showPercentage?: boolean
}) {
  return (
    <div
      className="pointer-events-none absolute z-50 rounded-lg border border-border bg-popover px-3 py-2 shadow-lg"
      style={{
        left: mousePos.x,
        top: mousePos.y - 80,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="flex items-center gap-2">
        {storage.type === 'cex' ? (
          <Buildings className="size-4" style={{ color: storage.color }} />
        ) : (
          <WalletIcon className="size-4" style={{ color: storage.color }} />
        )}
        <span className="font-medium">{storage.name}</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-4 text-sm">
        <span
          className="tooltip-fast font-semibold"
          data-tooltip={formatCurrency(storage.totalValueVnd)}
        >
          {formatCompact(storage.totalValueVnd)}
        </span>
        {showPercentage && (
          <span className="text-muted-foreground">
            {storage.percentage.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  )
}
