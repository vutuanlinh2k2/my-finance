import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Check, SpinnerGap } from '@phosphor-icons/react'
import { CurrencySelect } from './currency-select'
import { BillingTypeToggle } from './billing-type-toggle'
import { DaySelect } from './day-select'
import { MonthSelect } from './month-select'
import type { CreateSubscriptionInput } from '@/lib/hooks/use-subscriptions'
import type {
  SubscriptionCurrency,
  SubscriptionType,
} from '@/lib/subscriptions'
import { isValidUrl, sanitizeUrl } from '@/lib/subscriptions'
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

interface AddSubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateSubscriptionInput) => Promise<void>
  isSubmitting?: boolean
}

export function AddSubscriptionModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting: externalIsSubmitting = false,
}: AddSubscriptionModalProps) {
  const { data: tags = [] } = useTags()
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false)
  const isSubmitting = externalIsSubmitting || internalIsSubmitting

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

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTitle('')
      setTagId(null)
      setCurrency('VND')
      setAmount('')
      setType('monthly')
      setDayOfMonth(null)
      setMonthOfYear(null)
      setManagementUrl('')
      setInternalIsSubmitting(false)
    }
  }, [open])

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

      const input: CreateSubscriptionInput = {
        title: title.trim(),
        tag_id: tagId,
        currency,
        amount: amountToStore,
        type,
        day_of_month: dayOfMonth,
        month_of_year: type === 'yearly' ? monthOfYear : null,
        management_url: sanitizeUrl(managementUrl),
      }

      await onSubmit(input)
      onOpenChange(false)
    } catch {
      // Error handling is done by parent
    } finally {
      setInternalIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Subscription</DialogTitle>
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
              disabled={isSubmitting}
            />
          </div>

          {/* Tag Dropdown */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Tag</label>
            <TagSelect
              value={tagId}
              onChange={setTagId}
              tags={expenseTags}
              disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Amount</label>
              <div className="relative">
                <Input
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  className="h-10 rounded-lg pr-7 text-sm"
                  disabled={isSubmitting}
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
              disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <SpinnerGap className="size-4 animate-spin" />
            ) : (
              <Check weight="bold" className="size-4" />
            )}
            Add Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
