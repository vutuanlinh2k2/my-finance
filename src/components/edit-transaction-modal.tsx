import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Check, SpinnerGap, Trash } from '@phosphor-icons/react'
import type { Transaction, TransactionType } from '@/lib/hooks/use-transactions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { useTags } from '@/lib/hooks/use-tags'
import {
  useDeleteTransaction,
  useUpdateTransaction,
} from '@/lib/hooks/use-transactions'
import { useExchangeRateValue } from '@/lib/hooks/use-exchange-rate'
import { formatCompact, formatCurrency } from '@/lib/currency'

type Currency = 'VND' | 'USD'

interface EditTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
  onSuccess?: () => void
}

export function EditTransactionModal({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}: EditTransactionModalProps) {
  const { data: tags = [] } = useTags()
  const updateMutation = useUpdateTransaction()
  const deleteMutation = useDeleteTransaction()
  const { rate: exchangeRate, isLoading: isRateLoading } = useExchangeRateValue()

  const [type, setType] = useState<TransactionType>('expense')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<Currency>('VND')
  const [date, setDate] = useState('')
  const [tagId, setTagId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const isPending = updateMutation.isPending || deleteMutation.isPending

  // Populate form when modal opens
  useEffect(() => {
    if (open && transaction) {
      setType(transaction.type as TransactionType)
      setTitle(transaction.title)
      setAmount(String(transaction.amount))
      setCurrency('VND') // Always show existing amount in VND
      setDate(transaction.date)
      setTagId(transaction.tag_id)
      setIsDeleteDialogOpen(false)
    }
  }, [open, transaction])

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
    if (!transaction) return

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
      await updateMutation.mutateAsync({
        id: transaction.id,
        updates: {
          title: title.trim(),
          amount: finalAmount,
          date,
          type,
          tag_id: tagId,
        },
        originalDate: transaction.date,
      })

      toast.success('Transaction updated successfully')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to update transaction:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to update transaction',
      )
    }
  }

  const handleDelete = async () => {
    if (!transaction) return

    try {
      await deleteMutation.mutateAsync({
        id: transaction.id,
        date: transaction.date,
      })

      toast.success('Transaction deleted')
      setIsDeleteDialogOpen(false)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete transaction',
      )
    }
  }

  if (!transaction) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Transaction Type Selector */}
            <div className="flex rounded-lg border border-border p-1">
              <button
                type="button"
                onClick={() => setType('expense')}
                disabled={isPending}
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
                disabled={isPending}
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
                disabled={isPending}
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
                    disabled={isPending}
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
                    disabled={isPending}
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
                    disabled={isPending || isRateLoading}
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
                  disabled={isPending}
                />
              </div>

              {/* Tag Dropdown */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">Tag</label>
                <TagSelect
                  value={tagId}
                  onChange={setTagId}
                  tags={filteredTags}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isPending}
              className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash weight="duotone" className="size-4" />
              Delete
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="gap-2"
                disabled={isPending}
              >
                {updateMutation.isPending ? (
                  <SpinnerGap className="size-4 animate-spin" />
                ) : (
                  <Check weight="bold" className="size-4" />
                )}
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{transaction.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <SpinnerGap className="size-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
