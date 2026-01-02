import { ChartPieSlice, ListBullets, Tag } from '@phosphor-icons/react'

/**
 * Empty state for pie chart when no data exists for the period
 */
export function NoDataState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative flex size-48 items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-[20px] border-muted" />
        {/* Center content */}
        <span className="text-sm font-medium text-muted-foreground">
          No Data
        </span>
      </div>
    </div>
  )
}

/**
 * Empty state for tag list when no tags to display
 */
export function NoTagsState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8">
      <div className="mb-3 flex size-12 items-center justify-center rounded-lg bg-muted">
        <Tag weight="duotone" className="size-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">No tags to display</p>
    </div>
  )
}

/**
 * Empty state for right panel when no tag is selected
 */
export function NoTagSelectedState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
        <ListBullets
          weight="duotone"
          className="size-8 text-muted-foreground"
        />
      </div>
      <h3 className="mb-2 text-lg font-semibold">No Tag Selected</h3>
      <p className="max-w-xs text-sm text-muted-foreground">
        Select a category tag from the list on the left to view detailed
        transactions and breakdown for that category.
      </p>
    </div>
  )
}

/**
 * Empty state for right panel when period has no activity
 */
export function NoActivityState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
        <ChartPieSlice
          weight="duotone"
          className="size-8 text-muted-foreground"
        />
      </div>
      <h3 className="mb-2 text-lg font-semibold">No Activity</h3>
      <p className="max-w-xs text-sm text-muted-foreground">
        No financial activity for this period.
      </p>
    </div>
  )
}
