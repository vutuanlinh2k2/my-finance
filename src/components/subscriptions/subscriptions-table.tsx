import { ArrowSquareOut, PencilSimple, Trash } from '@phosphor-icons/react'
import type { Tag } from '@/lib/api/tags'
import type { Subscription } from '@/lib/subscriptions'
import {
  calculateUpcomingDueDate,
  formatDueDate,
  formatUSD,
  sanitizeUrl,
} from '@/lib/subscriptions'
import { formatCompact, formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SubscriptionsTableProps {
  subscriptions: Array<Subscription>
  tags: Array<Tag>
  onEdit: (subscription: Subscription) => void
  onDelete: (subscription: Subscription) => void
}

// Generate a consistent color based on the first letter
function getInitialColor(letter: string): string {
  const colors = [
    'bg-red-100 text-red-700',
    'bg-orange-100 text-orange-700',
    'bg-amber-100 text-amber-700',
    'bg-yellow-100 text-yellow-700',
    'bg-lime-100 text-lime-700',
    'bg-green-100 text-green-700',
    'bg-emerald-100 text-emerald-700',
    'bg-teal-100 text-teal-700',
    'bg-cyan-100 text-cyan-700',
    'bg-sky-100 text-sky-700',
    'bg-blue-100 text-blue-700',
    'bg-indigo-100 text-indigo-700',
    'bg-violet-100 text-violet-700',
    'bg-purple-100 text-purple-700',
    'bg-fuchsia-100 text-fuchsia-700',
    'bg-pink-100 text-pink-700',
    'bg-rose-100 text-rose-700',
  ]

  const index = letter.toUpperCase().charCodeAt(0) % colors.length
  return colors[index]
}

export function SubscriptionsTable({
  subscriptions,
  tags,
  onEdit,
  onDelete,
}: SubscriptionsTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Title</TableHead>
            <TableHead>Tag</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="w-[80px]">Manage</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => {
            const tag = tags.find((t) => t.id === subscription.tag_id)
            const upcomingDate = calculateUpcomingDueDate(subscription)
            const { formatted, urgency } = formatDueDate(upcomingDate)
            const firstLetter = subscription.title.charAt(0).toUpperCase()

            return (
              <TableRow key={subscription.id}>
                {/* Title with initial badge */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold',
                        getInitialColor(firstLetter),
                      )}
                    >
                      {firstLetter}
                    </div>
                    <span className="font-medium">{subscription.title}</span>
                  </div>
                </TableCell>

                {/* Tag */}
                <TableCell>
                  {tag ? (
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-base">
                        {tag.emoji}
                      </span>
                      <span className="text-sm">{tag.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Type */}
                <TableCell>
                  <span className="text-sm capitalize">{subscription.type}</span>
                </TableCell>

                {/* Price */}
                <TableCell>
                  {subscription.currency === 'VND' ? (
                    <span
                      className="tooltip-fast text-sm font-medium"
                      data-tooltip={formatCurrency(subscription.amount)}
                    >
                      {formatCompact(subscription.amount)}
                    </span>
                  ) : (
                    <span className="text-sm font-medium">
                      {formatUSD(subscription.amount)}
                    </span>
                  )}
                </TableCell>

                {/* Due Date */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{formatted}</span>
                    {urgency && (
                      <span className="text-xs font-medium text-amber-600">
                        {urgency}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Manage Link */}
                <TableCell>
                  {(() => {
                    const safeUrl = sanitizeUrl(subscription.management_url)
                    return safeUrl ? (
                      <a
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <ArrowSquareOut weight="duotone" className="size-5" />
                      </a>
                    ) : (
                      <span className="flex size-8 items-center justify-center text-muted-foreground/30">
                        <ArrowSquareOut weight="duotone" className="size-5" />
                      </span>
                    )
                  })()}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(subscription)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <PencilSimple weight="duotone" className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(subscription)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash weight="duotone" className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3">
        <span className="text-sm text-muted-foreground">
          Showing {subscriptions.length} of {subscriptions.length} subscriptions
        </span>
      </div>
    </div>
  )
}
