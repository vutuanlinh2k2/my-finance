import type { TagDistribution } from '@/lib/reports/types'
import { formatCompact, formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'

interface TagListProps {
  distributions: Array<TagDistribution>
  selectedTagId: string | null
  onTagSelect: (tagId: string | null) => void
}

export function TagList({
  distributions,
  selectedTagId,
  onTagSelect,
}: TagListProps) {
  return (
    <div className="flex flex-col gap-2">
      {distributions.map((distribution) => (
        <button
          key={distribution.tagId ?? 'untagged'}
          type="button"
          onClick={() => onTagSelect(distribution.tagId)}
          className={cn(
            'flex items-center justify-between rounded-lg border border-transparent p-3 text-left transition-colors hover:bg-muted/50',
            selectedTagId === distribution.tagId &&
              'border-primary bg-primary/5',
          )}
        >
          <div className="flex items-center gap-3">
            {/* Color indicator */}
            <div
              className="size-4 shrink-0 rounded"
              style={{ backgroundColor: distribution.color }}
            />
            {/* Tag info */}
            <span className="font-medium">{distribution.tagName}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Amount */}
            <span
              className="font-semibold tooltip-fast"
              data-tooltip={formatCurrency(distribution.amount)}
            >
              {formatCompact(distribution.amount)}
            </span>
            {/* Percentage badge */}
            <span className="rounded border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {distribution.percentage}%
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
