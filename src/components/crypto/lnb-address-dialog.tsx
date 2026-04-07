import { useEffect, useState } from 'react'
import { Trash } from '@phosphor-icons/react'
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
import { isValidEvmAddress, normalizeAddress } from '@/lib/aave/lnb'

interface LnbAddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: string | null
  onSave: (address: string) => Promise<unknown>
  onRemove: () => Promise<unknown>
}

export function LnbAddressDialog({
  open,
  onOpenChange,
  address,
  onSave,
  onRemove,
}: LnbAddressDialogProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setValue(address ?? '')
      setError(null)
    }
  }, [address, open])

  const handleSave = async () => {
    const normalized = normalizeAddress(value)

    if (!normalized) {
      setError('Enter an Ethereum wallet address.')
      return
    }

    if (!isValidEvmAddress(normalized)) {
      setError('Enter a valid 0x Ethereum address.')
      return
    }

    try {
      setIsSubmitting(true)
      await onSave(normalized)
      onOpenChange(false)
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save address.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemove = async () => {
    try {
      setIsSubmitting(true)
      await onRemove()
      onOpenChange(false)
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : 'Unable to remove address.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Aave Address</DialogTitle>
          <DialogDescription>
            Save the wallet address you want to inspect on Ethereum Aave V3.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="lnb-address"
              className="mb-1.5 block text-sm font-medium"
            >
              Wallet Address
            </label>
            <Input
              id="lnb-address"
              value={value}
              onChange={(event) => {
                setValue(event.target.value)
                if (error) setError(null)
              }}
              placeholder="0x..."
              className="h-10 rounded-lg font-mono text-sm"
              disabled={isSubmitting}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              The address is stored in your account and used for dashboard and
              history calculations.
            </p>
          )}
        </div>

        <DialogFooter className="items-center sm:justify-between">
          {address ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemove}
              className="gap-2 text-destructive hover:text-destructive"
              disabled={isSubmitting}
            >
              <Trash weight="duotone" className="size-4" />
              Remove
            </Button>
          ) : (
            <span />
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Address'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
