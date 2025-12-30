import type { SubscriptionCurrency } from '@/lib/subscriptions'
import { cn } from '@/lib/utils'

interface CurrencySelectProps {
  value: SubscriptionCurrency
  onChange: (currency: SubscriptionCurrency) => void
  disabled?: boolean
}

export function CurrencySelect({
  value,
  onChange,
  disabled = false,
}: CurrencySelectProps) {
  return (
    <div className="flex rounded-lg border border-border p-1">
      <button
        type="button"
        onClick={() => onChange('VND')}
        disabled={disabled}
        className={cn(
          'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50',
          value === 'VND'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        VND
      </button>
      <button
        type="button"
        onClick={() => onChange('USD')}
        disabled={disabled}
        className={cn(
          'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50',
          value === 'USD'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        USD
      </button>
    </div>
  )
}
