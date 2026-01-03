import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Check, SpinnerGap } from '@phosphor-icons/react'
import type { TransactionType } from '@/lib/hooks/use-transactions'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TagSelect } from '@/components/tag-select'
import { cn } from '@/lib/utils'
import { formatDateToISO } from '@/lib/api/transactions'
import { useTags } from '@/lib/hooks/use-tags'
import { useCreateTransaction } from '@/lib/hooks/use-transactions'
import { useExchangeRateValue } from '@/lib/hooks/use-exchange-rate'
import { formatCompact, formatCurrency } from '@/lib/currency'

type Currency = 'VND' | 'USD'

interface AddTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: Date
  onSuccess?: () => void
}

export function AddTransactionModal({
  open,
  onOpenChange,
  defaultDate,
  onSuccess,
}: AddTransactionModalProps) {
  const { data: tags = [] } = useTags()
  const createMutation = useCreateTransaction()
  const { rate: exchangeRate, isLoading: isRateLoading } = useExchangeRateValue()

  const [type, setType] = useState<TransactionType>('expense')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<Currency>('VND')
  const [date, setDate] = useState('')
  const [tagId, setTagId] = useState<string | null>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setType('expense')
      setTitle('')
      setAmount('')
      setCurrency('VND')
      setDate(
        defaultDate
          ? formatDateToISO(defaultDate)
          : formatDateToISO(new Date()),
      )
      setTagId(null)
    }
  }, [open, defaultDate])

  // Filter tags based on transaction type
  const filteredTags = tags.filter((t) => t.type === type)

  // Reset tag when type changes if current tag doesn't match
  useEffect(() => {
    const currentTag = tags.find((t) => t.id === tagId)
    if (tagId && currentTag && currentTag.type !== type) {
      setTagId(null)
    }
  }, [type, tagId, tags])

  const handleAmountChange = (value: string) => {
    if (currency === 'VND') {
      // Only allow whole numbers (VND doesn't use decimals)
      const cleaned = value.replace(/[^\d]/g, '')
      setAmount(cleaned)
    } else {
      // Allow decimals for USD (max 2 decimal places)
      const cleaned = value.replace(/[^\d.]/g, '')
      // Ensure only one decimal point and max 2 decimal places
      const parts = cleaned.split('.')
      if (parts.length > 2) {
        setAmount(parts[0] + '.' + parts[1])
      } else if (parts[1]?.length > 2) {
        setAmount(parts[0] + '.' + parts[1].slice(0, 2))
      } else {
        setAmount(cleaned)
      }
    }
  }

  // Calculate VND equivalent for USD amounts
  const vndEquivalent =
    currency === 'USD' && amount
      ? Math.round(parseFloat(amount) * exchangeRate)
      : null

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    const numAmount =
      currency === 'VND' ? parseInt(amount, 10) : parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!date) {
      toast.error('Please select a date')
      return
    }

    // Convert USD to VND if needed
    const finalAmount =
      currency === 'USD' ? Math.round(numAmount * exchangeRate) : numAmount

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        amount: finalAmount,
        date,
        type,
        tag_id: tagId,
      })

      toast.success('Transaction added successfully')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to add transaction:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to add transaction',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Transaction Type Selector */}
          <div className="flex rounded-lg border border-border p-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={cn(
                'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
                type === 'expense'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={cn(
                'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
                type === 'income'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Income
            </button>
          </div>

          {/* Title Input */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly Groceries"
              className="h-10 rounded-lg text-sm"
              disabled={createMutation.isPending}
            />
          </div>

          {/* Amount Input */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Amount</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  className="h-10 rounded-lg pr-8 text-sm"
                  disabled={createMutation.isPending}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {currency === 'VND' ? '₫' : '$'}
                </span>
              </div>
              {/* Currency Toggle */}
              <div className="flex rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => {
                    setCurrency('VND')
                    setAmount('')
                  }}
                  className={cn(
                    'rounded-l-md px-3 py-2 text-sm font-medium transition-colors',
                    currency === 'VND'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  disabled={createMutation.isPending}
                >
                  VND
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrency('USD')
                    setAmount('')
                  }}
                  className={cn(
                    'rounded-r-md px-3 py-2 text-sm font-medium transition-colors',
                    currency === 'USD'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  disabled={createMutation.isPending || isRateLoading}
                >
                  USD
                </button>
              </div>
            </div>
            {/* VND Conversion Preview */}
            {currency === 'USD' && vndEquivalent !== null && !isNaN(vndEquivalent) && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                ≈ {formatCompact(vndEquivalent)}{' '}
                <span className="tooltip-fast" data-tooltip={formatCurrency(vndEquivalent)}>
                  (hover for full)
                </span>
              </p>
            )}
          </div>

          {/* Date and Tag Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Date Input */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 rounded-lg text-sm"
                disabled={createMutation.isPending}
              />
            </div>

            {/* Tag Dropdown */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tag</label>
              <TagSelect
                value={tagId}
                onChange={setTagId}
                tags={filteredTags}
                disabled={createMutation.isPending}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="gap-2"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <SpinnerGap className="size-4 animate-spin" />
            ) : (
              <Check weight="bold" className="size-4" />
            )}
            Save Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
