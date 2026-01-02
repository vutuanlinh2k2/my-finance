import { useState } from 'react'
import { Check, SpinnerGap } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type {
  CryptoAsset,
  CryptoStorage,
  TransferInTransactionInput,
} from '@/lib/crypto/types'
import { formatDateToISO } from '@/lib/api/transactions'
import { sanitizeUrl } from '@/lib/subscriptions/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface TransferInFormProps {
  assets: Array<CryptoAsset>
  storages: Array<CryptoStorage>
  onSubmit: (input: TransferInTransactionInput) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function TransferInForm({
  assets,
  storages,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TransferInFormProps) {
  const [assetId, setAssetId] = useState('')
  const [amount, setAmount] = useState('')
  const [storageId, setStorageId] = useState('')
  const [date, setDate] = useState(formatDateToISO(new Date()))
  const [txId, setTxId] = useState('')
  const [txExplorerUrl, setTxExplorerUrl] = useState('')

  const handleSubmit = async () => {
    // Validation
    if (!assetId) {
      toast.error('Please select an asset')
      return
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!storageId) {
      toast.error('Please select a storage')
      return
    }

    if (!date) {
      toast.error('Please select a date')
      return
    }

    const input: TransferInTransactionInput = {
      type: 'transfer_in',
      assetId,
      amount: parsedAmount,
      storageId,
      date,
      txId: txId.trim() || undefined,
      txExplorerUrl: txExplorerUrl.trim()
        ? sanitizeUrl(txExplorerUrl.trim())
        : undefined,
    }

    await onSubmit(input)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Info Banner */}
      <div className="rounded-lg bg-teal-100 px-3 py-2 text-sm text-teal-800 dark:bg-teal-950 dark:text-teal-200">
        Use this for airdrops, gifts received, mining/staking rewards, or other
        incoming crypto.
      </div>

      {/* Asset Selection */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Asset *</label>
        <select
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          disabled={isSubmitting}
          className={cn(
            'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <option value="">Select asset</option>
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.name} ({asset.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Amount *</label>
        <Input
          type="number"
          step="any"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="h-10"
          disabled={isSubmitting}
        />
      </div>

      {/* Storage Selection */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Storage *</label>
        <select
          value={storageId}
          onChange={(e) => setStorageId(e.target.value)}
          disabled={isSubmitting}
          className={cn(
            'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <option value="">Select storage</option>
          {storages.map((storage) => (
            <option key={storage.id} value={storage.id}>
              {storage.name} ({storage.type.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Date *</label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-10"
          disabled={isSubmitting}
        />
      </div>

      {/* TX ID (Optional) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">TX ID</label>
        <Input
          value={txId}
          onChange={(e) => setTxId(e.target.value)}
          placeholder="Transaction hash (optional)"
          className="h-10"
          disabled={isSubmitting}
        />
      </div>

      {/* TX Explorer URL (Optional) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          TX Explorer URL
        </label>
        <Input
          value={txExplorerUrl}
          onChange={(e) => setTxExplorerUrl(e.target.value)}
          placeholder="https://... (optional)"
          className="h-10"
          disabled={isSubmitting}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <SpinnerGap className="size-4 animate-spin" />
          ) : (
            <Check weight="bold" className="size-4" />
          )}
          Add Transaction
        </Button>
      </div>
    </div>
  )
}
