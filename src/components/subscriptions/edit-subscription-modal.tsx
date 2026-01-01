import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Check, SpinnerGap, Trash } from '@phosphor-icons/react'
import { CurrencySelect } from './currency-select'
import { BillingTypeToggle } from './billing-type-toggle'
import { DaySelect } from './day-select'
import { MonthSelect } from './month-select'
import type {
  Subscription,
  UpdateSubscriptionInput,
} from '@/lib/hooks/use-subscriptions'
import type {
  SubscriptionCurrency,
  SubscriptionType,
} from '@/lib/subscriptions'
import { isValidUrl, sanitizeUrl } from '@/lib/subscriptions'
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
import { useTags } from '@/lib/hooks/use-tags'

interface EditSubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: Subscription | null
  onUpdate: (id: string, updates: UpdateSubscriptionInput) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isSubmitting?: boolean
}

export function EditSubscriptionModal({
  open,
  onOpenChange,
  subscription,
  onUpdate,
  onDelete,
  isSubmitting: externalIsSubmitting = false,
}: EditSubscriptionModalProps) {
  const { data: tags = [] } = useTags()
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false)
  const [internalIsDeleting, setInternalIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const isSubmitting = externalIsSubmitting || internalIsSubmitting
  const isDeleting = internalIsDeleting

  // Form state
  const [title, setTitle] = useState('')
  const [tagId, setTagId] = useState<string | null>(null)
  const [currency, setCurrency] = useState<SubscriptionCurrency>('VND')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<SubscriptionType>('monthly')
  const [dayOfMonth, setDayOfMonth] = useState<number | null>(null)
  const [monthOfYear, setMonthOfYear] = useState<number | null>(null)
  const [managementUrl, setManagementUrl] = useState('')

  // Filter to expense tags only
  const expenseTags = tags.filter((t) => t.type === 'expense')

  const isPending = isSubmitting || isDeleting

  // Populate form when modal opens
  useEffect(() => {
    if (open && subscription) {
      setTitle(subscription.title)
      setTagId(subscription.tag_id)
      setCurrency(subscription.currency)
      // USD is stored as cents, convert back to dollars for display
      const displayAmount =
        subscription.currency === 'USD'
          ? (subscription.amount / 100).toFixed(2)
          : String(subscription.amount)
      setAmount(displayAmount)
      setType(subscription.type)
      setDayOfMonth(subscription.day_of_month)
      setMonthOfYear(subscription.month_of_year)
      setManagementUrl(subscription.management_url ?? '')
      setInternalIsSubmitting(false)
      setInternalIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }, [open, subscription])

  // Clear month when switching to monthly
  useEffect(() => {
    if (type === 'monthly') {
      setMonthOfYear(null)
    }
  }, [type])

  const handleAmountChange = (value: string) => {
    if (currency === 'VND') {
      // VND: whole numbers only
      const cleaned = value.replace(/[^\d]/g, '')
      setAmount(cleaned)
    } else {
      // USD: allow decimals
      const cleaned = value.replace(/[^\d.]/g, '')
      // Ensure only one decimal point
      const parts = cleaned.split('.')
      if (parts.length > 2) {
        setAmount(parts[0] + '.' + parts.slice(1).join(''))
      } else {
        setAmount(cleaned)
      }
    }
  }

  const handleSubmit = async () => {
    if (!subscription) return

    // Validation
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

    if (dayOfMonth === null) {
      toast.error('Please select a billing day')
      return
    }

    if (type === 'yearly' && monthOfYear === null) {
      toast.error('Please select a billing month')
      return
    }

    if (managementUrl.trim() && !isValidUrl(managementUrl)) {
      toast.error('Please enter a valid URL (http:// or https://)')
      return
    }

    setInternalIsSubmitting(true)

    try {
      // Store USD as cents (multiply by 100) for BIGINT storage
      const amountToStore =
        currency === 'USD' ? Math.round(numAmount * 100) : numAmount

      const updates: UpdateSubscriptionInput = {
        title: title.trim(),
        tag_id: tagId,
        currency,
        amount: amountToStore,
        type,
        day_of_month: dayOfMonth,
        month_of_year: type === 'yearly' ? monthOfYear : null,
        management_url: sanitizeUrl(managementUrl),
      }

      await onUpdate(subscription.id, updates)
      onOpenChange(false)
    } catch {
      // Error handling is done by parent
    } finally {
      setInternalIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!subscription) return

    setInternalIsDeleting(true)

    try {
      await onDelete(subscription.id)
      setIsDeleteDialogOpen(false)
      onOpenChange(false)
    } catch {
      // Error handling is done by parent
    } finally {
      setInternalIsDeleting(false)
    }
  }

  if (!subscription) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Title Input */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Netflix, Spotify"
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
                tags={expenseTags}
                disabled={isPending}
                placeholder="Select a category"
              />
            </div>

            {/* Currency and Amount Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Currency
                </label>
                <CurrencySelect
                  value={currency}
                  onChange={(newCurrency) => {
                    setCurrency(newCurrency)
                    setAmount('') // Reset amount when currency changes
                  }}
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Amount
                </label>
                <div className="relative">
                  <Input
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0"
                    className="h-10 rounded-lg pr-7 text-sm"
                    disabled={isPending}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {currency === 'VND' ? '₫' : '$'}
                  </span>
                </div>
              </div>
            </div>

            {/* Billing Type */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Billing Cycle
              </label>
              <BillingTypeToggle
                value={type}
                onChange={setType}
                disabled={isPending}
              />
            </div>

            {/* Billing Date */}
            <div className={type === 'yearly' ? 'grid grid-cols-2 gap-3' : ''}>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Day of Month
                </label>
                <DaySelect
                  value={dayOfMonth}
                  onChange={setDayOfMonth}
                  disabled={isPending}
                />
              </div>

              {type === 'yearly' && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Month
                  </label>
                  <MonthSelect
                    value={monthOfYear}
                    onChange={setMonthOfYear}
                    disabled={isPending}
                  />
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Next billing date will be calculated automatically.
            </p>

            {/* Management URL */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Management URL{' '}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <Input
                value={managementUrl}
                onChange={(e) => setManagementUrl(e.target.value)}
                placeholder="https://..."
                className="h-10 rounded-lg text-sm"
                disabled={isPending}
              />
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
                {isSubmitting ? (
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
            <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{subscription.title}"? This
              action cannot be undone. Previously created expense transactions
              will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
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
