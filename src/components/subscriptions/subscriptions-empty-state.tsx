import { CreditCard, Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface SubscriptionsEmptyStateProps {
  onAddClick: () => void
}

export function SubscriptionsEmptyState({
  onAddClick,
}: SubscriptionsEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-border bg-sidebar p-12 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-muted">
        <CreditCard weight="duotone" className="size-8 text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-lg font-semibold">No subscriptions added yet</h3>
      <p className="mb-6 text-sm text-muted-foreground">
        Start tracking your recurring payments and services
      </p>
      <Button onClick={onAddClick} className="gap-2">
        <Plus weight="bold" className="size-4" />
        Add Subscription
      </Button>
    </div>
  )
}
