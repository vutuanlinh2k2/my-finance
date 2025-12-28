import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, CaretDown, Trash } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import {
  type Transaction,
  type TransactionType,
  updateTransaction,
  deleteTransaction,
} from '@/lib/transactions'
import { type Tag, getTags } from '@/lib/tags'

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
  const [type, setType] = useState<TransactionType>('expense')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [tagId, setTagId] = useState<string | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load tags and populate form when modal opens
  useEffect(() => {
    if (open && transaction) {
      setTags(getTags())
      setType(transaction.type)
      setTitle(transaction.title)
      setAmount(String(transaction.amount))
      setDate(transaction.date)
      setTagId(transaction.tagId)
      setIsDeleting(false)
    }
  }, [open, transaction])

  // Filter tags based on transaction type
  const filteredTags = tags.filter((t) => t.type === type)
  const selectedTag = tags.find((t) => t.id === tagId)

  // Reset tag when type changes if current tag doesn't match
  useEffect(() => {
    if (tagId && selectedTag && selectedTag.type !== type) {
      setTagId(null)
    }
  }, [type, tagId, selectedTag])

  const handleAmountChange = (value: string) => {
    // Only allow whole numbers (VND doesn't use decimals)
    const cleaned = value.replace(/[^\d]/g, '')
    setAmount(cleaned)
  }

  const handleSubmit = () => {
    if (!transaction) return

    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    const numAmount = parseInt(amount, 10)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!date) {
      toast.error('Please select a date')
      return
    }

    updateTransaction(transaction.id, {
      title: title.trim(),
      amount: numAmount,
      date,
      type,
      tagId,
    })

    toast.success('Transaction updated successfully')
    onOpenChange(false)
    onSuccess?.()
  }

  const handleDelete = () => {
    if (!transaction) return

    if (!isDeleting) {
      setIsDeleting(true)
      return
    }

    deleteTransaction(transaction.id)
    toast.success('Transaction deleted')
    onOpenChange(false)
    onSuccess?.()
  }

  if (!transaction) return null

  return (
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
              className={cn(
                'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
                type === 'expense'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
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
                  : 'text-muted-foreground hover:text-foreground'
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
            />
          </div>

          {/* Amount Input */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Amount</label>
            <div className="relative">
              <Input
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                className="h-10 rounded-lg pr-7 text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₫
              </span>
            </div>
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
              />
            </div>

            {/* Tag Dropdown */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tag</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                  className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 text-sm transition-colors hover:bg-muted/50"
                >
                  {selectedTag ? (
                    <span className="flex items-center gap-2">
                      <span>{selectedTag.emoji}</span>
                      <span className="truncate">{selectedTag.name}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select Tag</span>
                  )}
                  <CaretDown
                    weight="bold"
                    className={cn(
                      'size-4 text-muted-foreground transition-transform',
                      isTagDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                {isTagDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsTagDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
                      {filteredTags.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No tags available
                        </div>
                      ) : (
                        <>
                          {/* Option to clear selection */}
                          <button
                            type="button"
                            onClick={() => {
                              setTagId(null)
                              setIsTagDropdownOpen(false)
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                          >
                            No tag
                          </button>
                          {filteredTags.map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => {
                                setTagId(tag.id)
                                setIsTagDropdownOpen(false)
                              }}
                              className={cn(
                                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted',
                                tagId === tag.id && 'bg-primary/10'
                              )}
                            >
                              <span>{tag.emoji}</span>
                              <span className="flex-1 truncate text-left">{tag.name}</span>
                              {tagId === tag.id && (
                                <Check weight="bold" className="size-4 text-primary" />
                              )}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleDelete}
            className={cn(
              'gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive',
              isDeleting && 'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground'
            )}
          >
            <Trash weight="duotone" className="size-4" />
            {isDeleting ? 'Click to confirm' : 'Delete'}
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Check weight="bold" className="size-4" />
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
