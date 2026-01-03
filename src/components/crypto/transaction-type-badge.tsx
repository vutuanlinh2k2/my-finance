import { cva } from 'class-variance-authority'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowsClockwise,
  ArrowsLeftRight,
  CurrencyDollar,
  ShoppingCart,
} from '@phosphor-icons/react'
import type { VariantProps } from 'class-variance-authority'
import type { CryptoTransactionType } from '@/lib/crypto/types'
import { cn } from '@/lib/utils'

const transactionTypeBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium',
  {
    variants: {
      type: {
        buy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
        sell: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
        transfer_between:
          'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
        swap: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
        transfer_in:
          'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
        transfer_out:
          'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
      },
    },
    defaultVariants: {
      type: 'buy',
    },
  },
)

const typeConfig: Record<
  CryptoTransactionType,
  { label: string; icon: typeof ShoppingCart }
> = {
  buy: { label: 'Buy', icon: ShoppingCart },
  sell: { label: 'Sell', icon: CurrencyDollar },
  transfer_between: { label: 'Transfer', icon: ArrowsLeftRight },
  swap: { label: 'Swap', icon: ArrowsClockwise },
  transfer_in: { label: 'In', icon: ArrowDownLeft },
  transfer_out: { label: 'Out', icon: ArrowUpRight },
}

interface TransactionTypeBadgeProps extends VariantProps<
  typeof transactionTypeBadgeVariants
> {
  type: CryptoTransactionType
  className?: string
  showLabel?: boolean
}

export function TransactionTypeBadge({
  type,
  className,
  showLabel = true,
}: TransactionTypeBadgeProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <span className={cn(transactionTypeBadgeVariants({ type }), className)}>
      <Icon weight="bold" className="size-3.5" />
      {showLabel && <span>{config.label}</span>}
    </span>
  )
}

/**
 * Get human-readable label for a transaction type
 */
export function getTransactionTypeLabel(type: CryptoTransactionType): string {
  return typeConfig[type].label
}

/**
 * Get all transaction types for filtering
 */
export function getAllTransactionTypes(): Array<CryptoTransactionType> {
  return [
    'buy',
    'sell',
    'transfer_between',
    'swap',
    'transfer_in',
    'transfer_out',
  ]
}
