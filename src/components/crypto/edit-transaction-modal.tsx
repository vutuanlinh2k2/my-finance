import { useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowsClockwise,
  ArrowsLeftRight,
  CurrencyDollar,
  ShoppingCart,
  SpinnerGap,
  Trash,
  Warning,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type {
  CryptoAsset,
  CryptoStorage,
  CryptoTransaction,
  CryptoTransactionInput,
  CryptoTransactionType,
  CryptoTransactionWithDetails,
} from '@/lib/crypto/types'
import { sanitizeUrl } from '@/lib/subscriptions/utils'
import { formatCryptoAmount, getAvailableBalance } from '@/lib/crypto/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DateInput } from '@/components/ui/date-input'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface EditTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: CryptoTransactionWithDetails
  onSubmit: (updates: Partial<CryptoTransactionInput>) => Promise<void>
  onDelete: () => void
  assets: Array<CryptoAsset>
  storages: Array<CryptoStorage>
  transactions: Array<CryptoTransaction>
  isSubmitting?: boolean
}

const typeConfig: Record<
  CryptoTransactionType,
  {
    label: string
    icon: typeof ShoppingCart
    color: string
  }
> = {
  buy: {
    label: 'Buy',
    icon: ShoppingCart,
    color:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  },
  sell: {
    label: 'Sell',
    icon: CurrencyDollar,
    color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  },
  transfer_between: {
    label: 'Transfer',
    icon: ArrowsLeftRight,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  },
  swap: {
    label: 'Swap',
    icon: ArrowsClockwise,
    color:
      'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  },
  transfer_in: {
    label: 'Transfer In',
    icon: ArrowDownLeft,
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
  },
  transfer_out: {
    label: 'Transfer Out',
    icon: ArrowUpRight,
    color:
      'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  },
}

export function EditTransactionModal({
  open,
  onOpenChange,
  transaction,
  onSubmit,
  onDelete,
  assets,
  storages,
  transactions,
  isSubmitting = false,
}: EditTransactionModalProps) {
  const config = typeConfig[transaction.type]
  const Icon = config.icon

  // Common fields
  const [date, setDate] = useState(transaction.date)
  const [txId, setTxId] = useState(transaction.txId ?? '')
  const [txExplorerUrl, setTxExplorerUrl] = useState(
    transaction.txExplorerUrl ?? '',
  )

  // Type-specific fields
  const [assetId, setAssetId] = useState(transaction.assetId ?? '')
  const [amount, setAmount] = useState(transaction.amount?.toString() ?? '')
  const [storageId, setStorageId] = useState(transaction.storageId ?? '')
  const [fiatAmount, setFiatAmount] = useState(
    transaction.fiatAmount?.toString() ?? '',
  )
  const [fromStorageId, setFromStorageId] = useState(
    transaction.fromStorageId ?? '',
  )
  const [toStorageId, setToStorageId] = useState(transaction.toStorageId ?? '')
  const [fromAssetId, setFromAssetId] = useState(transaction.fromAssetId ?? '')
  const [fromAmount, setFromAmount] = useState(
    transaction.fromAmount?.toString() ?? '',
  )
  const [toAssetId, setToAssetId] = useState(transaction.toAssetId ?? '')
  const [toAmount, setToAmount] = useState(
    transaction.toAmount?.toString() ?? '',
  )

  // Filter out current transaction for balance calculation
  const otherTransactions = transactions.filter((t) => t.id !== transaction.id)

  // Calculate available balance for validation
  const getAvailableBalanceForEdit = (
    targetAssetId: string,
    targetStorageId: string,
  ) => {
    // The available balance is what's in the storage excluding this transaction's effect
    return getAvailableBalance(targetAssetId, targetStorageId, otherTransactions)
  }

  // Validate balance for types that decrease balance
  const validateBalance = (): boolean => {
    let requiredAmount: number
    let availableAmount: number
    let assetName: string

    switch (transaction.type) {
      case 'sell':
      case 'transfer_out':
        if (!assetId || !storageId) return true
        requiredAmount = parseFloat(amount) || 0
        availableAmount = getAvailableBalanceForEdit(assetId, storageId)
        assetName =
          assets.find((a) => a.id === assetId)?.symbol ?? 'the asset'
        if (requiredAmount > availableAmount) {
          toast.error(
            `Insufficient balance. Available: ${formatCryptoAmount(availableAmount, assetName)}`,
          )
          return false
        }
        break

      case 'transfer_between':
        if (!assetId || !fromStorageId) return true
        requiredAmount = parseFloat(amount) || 0
        availableAmount = getAvailableBalanceForEdit(assetId, fromStorageId)
        assetName =
          assets.find((a) => a.id === assetId)?.symbol ?? 'the asset'
        if (requiredAmount > availableAmount) {
          toast.error(
            `Insufficient balance in source storage. Available: ${formatCryptoAmount(availableAmount, assetName)}`,
          )
          return false
        }
        break

      case 'swap':
        if (!fromAssetId || !storageId) return true
        requiredAmount = parseFloat(fromAmount) || 0
        availableAmount = getAvailableBalanceForEdit(fromAssetId, storageId)
        assetName =
          assets.find((a) => a.id === fromAssetId)?.symbol ?? 'the asset'
        if (requiredAmount > availableAmount) {
          toast.error(
            `Insufficient balance. Available: ${formatCryptoAmount(availableAmount, assetName)}`,
          )
          return false
        }
        break
    }

    return true
  }

  const handleSubmit = async () => {
    // Validate balance
    if (!validateBalance()) {
      return
    }

    // Build updates object based on transaction type
    const updates: Partial<CryptoTransactionInput> = {
      date,
      txId: txId.trim() || undefined,
      txExplorerUrl: txExplorerUrl.trim()
        ? sanitizeUrl(txExplorerUrl.trim())
        : undefined,
    }

    switch (transaction.type) {
      case 'buy':
      case 'sell':
        Object.assign(updates, {
          assetId,
          amount: parseFloat(amount),
          storageId,
          fiatAmount: parseInt(fiatAmount, 10),
        })
        break

      case 'transfer_between':
        Object.assign(updates, {
          assetId,
          amount: parseFloat(amount),
          fromStorageId,
          toStorageId,
        })
        break

      case 'swap':
        Object.assign(updates, {
          fromAssetId,
          fromAmount: parseFloat(fromAmount),
          toAssetId,
          toAmount: parseFloat(toAmount),
          storageId,
        })
        break

      case 'transfer_in':
      case 'transfer_out':
        Object.assign(updates, {
          assetId,
          amount: parseFloat(amount),
          storageId,
          fiatAmount: parseInt(fiatAmount, 10),
        })
        break
    }

    await onSubmit(updates)
  }

  // Show available balance for types that need validation
  const showAvailableBalance = () => {
    let targetAssetId: string | null = null
    let targetStorageId: string | null = null

    switch (transaction.type) {
      case 'sell':
      case 'transfer_out':
        targetAssetId = assetId
        targetStorageId = storageId
        break
      case 'transfer_between':
        targetAssetId = assetId
        targetStorageId = fromStorageId
        break
      case 'swap':
        targetAssetId = fromAssetId
        targetStorageId = storageId
        break
    }

    if (!targetAssetId || !targetStorageId) return null

    const available = getAvailableBalanceForEdit(targetAssetId, targetStorageId)
    const asset = assets.find((a) => a.id === targetAssetId)

    return (
      <p className="text-xs text-muted-foreground">
        Available: {formatCryptoAmount(available, asset?.symbol)}
      </p>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={cn('rounded-md p-1.5', config.color)}>
              <Icon className="size-4" weight="bold" />
            </span>
            Edit {config.label} Transaction
          </DialogTitle>
        </DialogHeader>

        {/* Linked transaction notice */}
        {(transaction.type === 'buy' ||
          transaction.type === 'sell' ||
          transaction.type === 'transfer_in' ||
          transaction.type === 'transfer_out') &&
          transaction.linkedTransactionId && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
              <Warning className="mt-0.5 size-4 shrink-0" weight="bold" />
              <p>
                This transaction is linked to a calendar{' '}
                {transaction.type === 'buy' || transaction.type === 'transfer_out'
                  ? 'expense'
                  : 'income'}
                . Changes to date and fiat amount will be synced.
              </p>
            </div>
          )}

        <div className="flex flex-col gap-4">
          {/* Transaction Type (Read-only) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Transaction Type
            </label>
            <div className="flex h-10 items-center rounded-lg border border-border bg-muted px-3 text-sm">
              <span className={cn('mr-2 rounded p-1', config.color)}>
                <Icon className="size-3" weight="bold" />
              </span>
              {config.label}
            </div>
          </div>

          {/* Type-specific fields */}
          {(transaction.type === 'buy' ||
            transaction.type === 'sell' ||
            transaction.type === 'transfer_in' ||
            transaction.type === 'transfer_out') && (
            <>
              {/* Asset Selection */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Asset *
                </label>
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
                <label className="mb-1.5 block text-sm font-medium">
                  Amount *
                </label>
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
                {(transaction.type === 'sell' ||
                  transaction.type === 'transfer_out') &&
                  showAvailableBalance()}
              </div>

              {/* Storage Selection */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Storage *
                </label>
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

              {/* Fiat Amount (Buy/Sell/Transfer In/Out) */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {transaction.type === 'transfer_in' ||
                  transaction.type === 'transfer_out'
                    ? 'Estimated Value (VND) *'
                    : 'Fiat Amount (VND) *'}
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={fiatAmount}
                  onChange={(e) => setFiatAmount(e.target.value)}
                  placeholder="0"
                  className="h-10"
                  disabled={isSubmitting}
                />
                {(transaction.type === 'transfer_in' ||
                  transaction.type === 'transfer_out') && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Estimated VND value at time of{' '}
                    {transaction.type === 'transfer_in' ? 'receiving' : 'sending'}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Transfer Between */}
          {transaction.type === 'transfer_between' && (
            <>
              {/* Asset Selection */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Asset *
                </label>
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
                <label className="mb-1.5 block text-sm font-medium">
                  Amount *
                </label>
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
                {showAvailableBalance()}
              </div>

              {/* From Storage */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  From Storage *
                </label>
                <select
                  value={fromStorageId}
                  onChange={(e) => setFromStorageId(e.target.value)}
                  disabled={isSubmitting}
                  className={cn(
                    'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                >
                  <option value="">Select source storage</option>
                  {storages.map((storage) => (
                    <option
                      key={storage.id}
                      value={storage.id}
                      disabled={storage.id === toStorageId}
                    >
                      {storage.name} ({storage.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* To Storage */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  To Storage *
                </label>
                <select
                  value={toStorageId}
                  onChange={(e) => setToStorageId(e.target.value)}
                  disabled={isSubmitting}
                  className={cn(
                    'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                >
                  <option value="">Select destination storage</option>
                  {storages.map((storage) => (
                    <option
                      key={storage.id}
                      value={storage.id}
                      disabled={storage.id === fromStorageId}
                    >
                      {storage.name} ({storage.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Swap */}
          {transaction.type === 'swap' && (
            <>
              {/* From Asset */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  From Asset *
                </label>
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
                {showAvailableBalance()}
              </div>

              {/* To Asset */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  To Asset *
                </label>
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
                <label className="mb-1.5 block text-sm font-medium">
                  To Amount *
                </label>
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

              {/* Storage */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Storage *
                </label>
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
            </>
          )}

          {/* Common fields */}
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
          <div className="flex justify-between gap-2 pt-2">
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={isSubmitting}
              className="gap-2"
            >
              <Trash className="size-4" weight="bold" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <SpinnerGap className="size-4 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
