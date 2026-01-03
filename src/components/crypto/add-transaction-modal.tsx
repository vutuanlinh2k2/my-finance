import { useEffect, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  ArrowsClockwise,
  ArrowsLeftRight,
  CurrencyDollar,
  ShoppingCart,
} from '@phosphor-icons/react'
import {
  BuyForm,
  SellForm,
  SwapForm,
  TransferBetweenForm,
  TransferInForm,
  TransferOutForm,
} from './transaction-forms'
import type {
  CryptoAsset,
  CryptoStorage,
  CryptoTransaction,
  CryptoTransactionInput,
  CryptoTransactionType,
} from '@/lib/crypto/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AddTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CryptoTransactionInput) => Promise<void>
  assets: Array<CryptoAsset>
  storages: Array<CryptoStorage>
  transactions: Array<CryptoTransaction>
  isSubmitting?: boolean
}

type TransactionTypeConfig = {
  type: CryptoTransactionType
  label: string
  description: string
  icon: typeof ShoppingCart
  color: string
}

const transactionTypes: Array<TransactionTypeConfig> = [
  {
    type: 'buy',
    label: 'Buy',
    description: 'Purchase crypto with fiat',
    icon: ShoppingCart,
    color:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  },
  {
    type: 'sell',
    label: 'Sell',
    description: 'Sell crypto for fiat',
    icon: CurrencyDollar,
    color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  },
  {
    type: 'transfer_between',
    label: 'Transfer',
    description: 'Move between storages',
    icon: ArrowsLeftRight,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  },
  {
    type: 'swap',
    label: 'Swap',
    description: 'Exchange one crypto for another',
    icon: ArrowsClockwise,
    color:
      'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  },
  {
    type: 'transfer_in',
    label: 'Transfer In',
    description: 'Receive crypto (airdrop, gift, etc.)',
    icon: ArrowDownLeft,
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
  },
  {
    type: 'transfer_out',
    label: 'Transfer Out',
    description: 'Send crypto out (gift, donation, etc.)',
    icon: ArrowUpRight,
    color:
      'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  },
]

export function AddTransactionModal({
  open,
  onOpenChange,
  onSubmit,
  assets,
  storages,
  transactions,
  isSubmitting = false,
}: AddTransactionModalProps) {
  const [selectedType, setSelectedType] =
    useState<CryptoTransactionType | null>(null)

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedType(null)
    }
  }, [open])

  const handleBack = () => {
    setSelectedType(null)
  }

  const handleSubmit = async (input: CryptoTransactionInput) => {
    await onSubmit(input)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const selectedTypeConfig = selectedType
    ? transactionTypes.find((t) => t.type === selectedType)
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedType && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ArrowLeft className="size-4" />
                <span className="sr-only">Back</span>
              </Button>
            )}
            {selectedType ? (
              <span className="flex items-center gap-2">
                {selectedTypeConfig && (
                  <span
                    className={cn('rounded-md p-1.5', selectedTypeConfig.color)}
                  >
                    <selectedTypeConfig.icon className="size-4" weight="bold" />
                  </span>
                )}
                {selectedTypeConfig?.label} Transaction
              </span>
            ) : (
              'Add Transaction'
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {selectedType
              ? `Fill in the details for your ${selectedTypeConfig?.label.toLowerCase()} transaction`
              : 'Select a transaction type to add'}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Type Selection */}
        {!selectedType && (
          <div className="grid grid-cols-2 gap-3">
            {transactionTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.type}
                  onClick={() => setSelectedType(type.type)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-center transition-colors',
                    'hover:border-primary hover:bg-muted/50',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  )}
                >
                  <span className={cn('rounded-lg p-2', type.color)}>
                    <Icon className="size-6" weight="bold" />
                  </span>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {type.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Step 2: Type-specific Form */}
        {selectedType === 'buy' && (
          <BuyForm
            assets={assets}
            storages={storages}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}

        {selectedType === 'sell' && (
          <SellForm
            assets={assets}
            storages={storages}
            transactions={transactions}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}

        {selectedType === 'transfer_between' && (
          <TransferBetweenForm
            assets={assets}
            storages={storages}
            transactions={transactions}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}

        {selectedType === 'swap' && (
          <SwapForm
            assets={assets}
            storages={storages}
            transactions={transactions}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}

        {selectedType === 'transfer_in' && (
          <TransferInForm
            assets={assets}
            storages={storages}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}

        {selectedType === 'transfer_out' && (
          <TransferOutForm
            assets={assets}
            storages={storages}
            transactions={transactions}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
