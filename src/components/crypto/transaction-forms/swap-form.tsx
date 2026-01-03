import { useMemo, useState } from 'react'
import { ArrowRight, Check, SpinnerGap, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type {
  CryptoAsset,
  CryptoStorage,
  CryptoTransaction,
  SwapTransactionInput,
} from '@/lib/crypto/types'
import { formatCryptoAmount, getAvailableBalance } from '@/lib/crypto/utils'
import { formatDateToISO } from '@/lib/api/transactions'
import { sanitizeUrl } from '@/lib/subscriptions/utils'
import { Button } from '@/components/ui/button'
import { DateInput } from '@/components/ui/date-input'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SwapFormProps {
  assets: Array<CryptoAsset>
  storages: Array<CryptoStorage>
  transactions: Array<CryptoTransaction>
  onSubmit: (input: SwapTransactionInput) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function SwapForm({
  assets,
  storages,
  transactions,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SwapFormProps) {
  const [fromAssetId, setFromAssetId] = useState('')
  const [fromAmount, setFromAmount] = useState('')
  const [toAssetId, setToAssetId] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [storageId, setStorageId] = useState('')
  const [date, setDate] = useState(formatDateToISO(new Date()))
  const [txId, setTxId] = useState('')
  const [txExplorerUrl, setTxExplorerUrl] = useState('')

  // Calculate available balance for from asset in storage
  const availableBalance = useMemo(() => {
    if (!fromAssetId || !storageId) return null
    return getAvailableBalance(fromAssetId, storageId, transactions)
  }, [fromAssetId, storageId, transactions])

  // Get selected assets for display
  const fromAsset = useMemo(
    () => assets.find((a) => a.id === fromAssetId),
    [assets, fromAssetId],
  )

  const handleSubmit = async () => {
    // Validation
    if (!fromAssetId) {
      toast.error('Please select the asset to swap from')
      return
    }

    if (!toAssetId) {
      toast.error('Please select the asset to swap to')
      return
    }

    if (fromAssetId === toAssetId) {
      toast.error('Cannot swap same asset')
      return
    }

    const parsedFromAmount = parseFloat(fromAmount)
    if (isNaN(parsedFromAmount) || parsedFromAmount <= 0) {
      toast.error('Please enter a valid from amount')
      return
    }

    const parsedToAmount = parseFloat(toAmount)
    if (isNaN(parsedToAmount) || parsedToAmount <= 0) {
      toast.error('Please enter a valid to amount')
      return
    }

    if (!storageId) {
      toast.error('Please select a storage')
      return
    }

    // Balance validation
    if (availableBalance !== null && parsedFromAmount > availableBalance) {
      toast.error(
        `Insufficient balance. Available: ${formatCryptoAmount(availableBalance, fromAsset?.symbol)}`,
      )
      return
    }

    if (!date) {
      toast.error('Please select a date')
      return
    }

    const input: SwapTransactionInput = {
      type: 'swap',
      fromAssetId,
      fromAmount: parsedFromAmount,
      toAssetId,
      toAmount: parsedToAmount,
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
      {/* From Asset Selection */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">From Asset *</label>
        <select
          value={fromAssetId}
          onChange={(e) => setFromAssetId(e.target.value)}
          disabled={isSubmitting}
          className={cn(
            'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <option value="">Select asset to swap</option>
          {assets.map((asset) => (
            <option
              key={asset.id}
              value={asset.id}
              disabled={asset.id === toAssetId}
            >
              {asset.name} ({asset.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* From Amount */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          From Amount *
        </label>
        <Input
          type="number"
          step="any"
          min="0"
          value={fromAmount}
          onChange={(e) => setFromAmount(e.target.value)}
          placeholder="0.00"
          className="h-10"
          disabled={isSubmitting}
        />
        {availableBalance !== null &&
          parseFloat(fromAmount) > availableBalance && (
            <div className="mt-1 flex items-center gap-1 text-sm text-destructive">
              <Warning className="size-4" />
              Insufficient balance
            </div>
          )}
      </div>

      {/* Swap Arrow */}
      <div className="flex justify-center">
        <ArrowRight className="size-6 text-muted-foreground" />
      </div>

      {/* To Asset Selection */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">To Asset *</label>
        <select
          value={toAssetId}
          onChange={(e) => setToAssetId(e.target.value)}
          disabled={isSubmitting}
          className={cn(
            'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <option value="">Select asset to receive</option>
          {assets.map((asset) => (
            <option
              key={asset.id}
              value={asset.id}
              disabled={asset.id === fromAssetId}
            >
              {asset.name} ({asset.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* To Amount */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">To Amount *</label>
        <Input
          type="number"
          step="any"
          min="0"
          value={toAmount}
          onChange={(e) => setToAmount(e.target.value)}
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

      {/* Available Balance Display */}
      {availableBalance !== null && (
        <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Available: </span>
          <span className="font-medium">
            {formatCryptoAmount(availableBalance, fromAsset?.symbol)}
          </span>
        </div>
      )}

      {/* Date */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Date *</label>
        <DateInput
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="[&>div]:h-10"
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
