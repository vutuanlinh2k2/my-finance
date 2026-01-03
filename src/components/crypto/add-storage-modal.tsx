import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Buildings,
  Check,
  SpinnerGap,
  Wallet as WalletIcon,
} from '@phosphor-icons/react'
import type { CreateCryptoStorageInput } from '@/lib/api/crypto-storages'
import type { StorageType } from '@/lib/crypto/types'
import { isValidUrl, sanitizeUrl } from '@/lib/subscriptions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface AddStorageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateCryptoStorageInput) => Promise<void>
  isSubmitting?: boolean
}

export function AddStorageModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting: externalIsSubmitting = false,
}: AddStorageModalProps) {
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false)
  const isSubmitting = externalIsSubmitting || internalIsSubmitting

  // Form state
  const [type, setType] = useState<StorageType>('cex')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [explorerUrl, setExplorerUrl] = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setType('cex')
      setName('')
      setAddress('')
      setExplorerUrl('')
      setInternalIsSubmitting(false)
    }
  }, [open])

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      toast.error('Please enter a name')
      return
    }

    // Wallet type requires address
    if (type === 'wallet' && !address.trim()) {
      toast.error('Please enter a wallet address')
      return
    }

    // Validate explorer URL if provided
    if (explorerUrl.trim() && !isValidUrl(explorerUrl)) {
      toast.error('Please enter a valid URL (http:// or https://)')
      return
    }

    setInternalIsSubmitting(true)

    try {
      const input: CreateCryptoStorageInput = {
        type,
        name: name.trim(),
        address: type === 'wallet' ? address.trim() : null,
        explorer_url: sanitizeUrl(explorerUrl) ?? null,
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
          <DialogTitle>Add Storage</DialogTitle>
          <DialogDescription className="sr-only">
            Add a new exchange or wallet to track your crypto holdings
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Storage Type Toggle */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Storage Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('cex')}
                disabled={isSubmitting}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors',
                  type === 'cex'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50',
                  isSubmitting && 'opacity-50 cursor-not-allowed',
                )}
              >
                <Buildings className="size-4" />
                Exchange (CEX)
              </button>
              <button
                type="button"
                onClick={() => setType('wallet')}
                disabled={isSubmitting}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors',
                  type === 'wallet'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50',
                  isSubmitting && 'opacity-50 cursor-not-allowed',
                )}
              >
                <WalletIcon className="size-4" />
                Wallet
              </button>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                type === 'cex'
                  ? 'e.g. Binance, Coinbase'
                  : 'e.g. MetaMask, Ledger'
              }
              className="h-10 rounded-lg text-sm"
              disabled={isSubmitting}
            />
          </div>

          {/* Wallet Address (only for wallet type) */}
          {type === 'wallet' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Wallet Address
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                className="h-10 rounded-lg font-mono text-sm"
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Link/Explorer URL (optional) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {type === 'cex' ? 'Link' : 'Explorer URL'}{' '}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Input
              value={explorerUrl}
              onChange={(e) => setExplorerUrl(e.target.value)}
              placeholder={
                type === 'cex'
                  ? 'https://www.binance.com/...'
                  : 'https://etherscan.io/address/...'
              }
              className="h-10 rounded-lg text-sm"
              disabled={isSubmitting}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              {type === 'cex'
                ? 'Link to your exchange account or portfolio page'
                : 'Link to view this wallet on a blockchain explorer'}
            </p>
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
            Add Storage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
