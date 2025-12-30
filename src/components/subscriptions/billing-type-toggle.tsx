import type { SubscriptionType } from '@/lib/subscriptions'
import { cn } from '@/lib/utils'

interface BillingTypeToggleProps {
  value: SubscriptionType
  onChange: (type: SubscriptionType) => void
  disabled?: boolean
}

export function BillingTypeToggle({
  value,
  onChange,
  disabled = false,
}: BillingTypeToggleProps) {
  return (
    <div className="flex rounded-lg border border-border p-1">
      <button
        type="button"
        onClick={() => onChange('monthly')}
        disabled={disabled}
        className={cn(
          'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50',
          value === 'monthly'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange('yearly')}
        disabled={disabled}
        className={cn(
          'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50',
          value === 'yearly'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Yearly
      </button>
    </div>
  )
}
