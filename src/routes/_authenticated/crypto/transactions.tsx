import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useMemo, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type {
  CryptoTransactionFilters,
  CryptoTransactionInput,
  CryptoTransactionWithDetails,
} from '@/lib/crypto/types'
import {
  useAllCryptoTransactions,
  useCreateCryptoTransaction,
  useCryptoTransactions,
  useDeleteCryptoTransaction,
  useUpdateCryptoTransaction,
} from '@/lib/hooks/use-crypto-transactions'
import { useCryptoAssets } from '@/lib/hooks/use-crypto-assets'
import { useCryptoStorages } from '@/lib/hooks/use-crypto-storages'
import { useTags } from '@/lib/hooks/use-tags'
import { findInvestingTag } from '@/lib/crypto/utils'
import { Button } from '@/components/ui/button'
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
  AddTransactionModal,
  EditTransactionModal,
  TransactionFilters,
  TransactionList,
} from '@/components/crypto'

// Define search params type
type TransactionsSearch = {
  page?: number
  types?: string
  startDate?: string
  endDate?: string
}

export const Route = createFileRoute('/_authenticated/crypto/transactions')({
  component: CryptoTransactionsPage,
  validateSearch: (search: Record<string, unknown>): TransactionsSearch => ({
    page: search.page ? Number(search.page) : undefined,
    types: search.types as string | undefined,
    startDate: search.startDate as string | undefined,
    endDate: search.endDate as string | undefined,
  }),
})

function CryptoTransactionsPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_authenticated/crypto/transactions' })

  // Parse filters from URL
  const filters: CryptoTransactionFilters = {
    types: search.types
      ? (search.types.split(',') as CryptoTransactionFilters['types'])
      : undefined,
    startDate: search.startDate,
    endDate: search.endDate,
  }

  const page = search.page ?? 1

  // Fetch data
  const { data: transactionsData, isLoading: isLoadingTransactions } =
    useCryptoTransactions(filters, { page, pageSize: 20 })
  const { data: allTransactions = [] } = useAllCryptoTransactions()
  const { data: assets = [] } = useCryptoAssets()
  const { data: storages = [] } = useCryptoStorages()
  const { data: tags = [] } = useTags()

  // Find investing tags for linking buy/sell to expense/income
  const investingExpenseTag = useMemo(
    () => findInvestingTag(tags, 'expense'),
    [tags],
  )
  const investingIncomeTag = useMemo(
    () => findInvestingTag(tags, 'income'),
    [tags],
  )

  // Mutations
  const createMutation = useCreateCryptoTransaction()
  const updateMutation = useUpdateCryptoTransaction()
  const deleteMutation = useDeleteCryptoTransaction()

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<CryptoTransactionWithDetails | null>(null)
  const [deletingTransaction, setDeletingTransaction] =
    useState<CryptoTransactionWithDetails | null>(null)

  // Check if any mutation is pending
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  // Update URL with new filters
  const updateFilters = useCallback(
    (newFilters: CryptoTransactionFilters) => {
      navigate({
        search: {
          page: 1, // Reset to page 1 when filters change
          types: newFilters.types?.join(',') || undefined,
          startDate: newFilters.startDate,
          endDate: newFilters.endDate,
        },
      })
    },
    [navigate],
  )

  // Update page
  const updatePage = useCallback(
    (newPage: number) => {
      navigate({
        search: {
          ...search,
          page: newPage,
        },
      })
    },
    [navigate, search],
  )

  // Handlers
  const handleAddTransaction = async (input: CryptoTransactionInput) => {
    try {
      // For buy/sell, we need to link to expense/income
      const needsLinkedTransaction = input.type === 'buy' || input.type === 'sell'

      if (needsLinkedTransaction) {
        // Determine tag type: buy = expense, sell = income
        const tagType = input.type === 'buy' ? 'expense' : 'income'
        const investingTag =
          tagType === 'expense' ? investingExpenseTag : investingIncomeTag

        if (!investingTag) {
          toast.error(
            `Please create an "Investing" tag for ${tagType}s first. ` +
              `Go to Calendar and create a tag named "Investing" with type "${tagType}".`,
          )
          throw new Error(`Missing "Investing" tag for ${tagType}`)
        }

        // Get asset symbol for the linked transaction title
        const asset = assets.find((a) => a.id === input.assetId)
        if (!asset) {
          throw new Error('Asset not found')
        }

        await createMutation.mutateAsync({
          transaction: input,
          linkedOptions: {
            tagId: investingTag.id,
            assetSymbol: asset.symbol,
          },
        })
      } else {
        // For other transaction types (transfer_between, swap, transfer_in, transfer_out), no linked transaction needed
        await createMutation.mutateAsync({
          transaction: input,
        })
      }

      toast.success('Transaction added successfully')
    } catch (error) {
      console.error('Failed to add transaction:', error)
      if (
        error instanceof Error &&
        !error.message.includes('Missing "Investing"')
      ) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to add transaction',
        )
      }
      throw error
    }
  }

  const handleEditTransaction = async (
    transaction: CryptoTransactionWithDetails,
    updates: Partial<CryptoTransactionInput>,
  ) => {
    try {
      // For buy/sell, also update the linked transaction
      const shouldUpdateLinked =
        transaction.type === 'buy' || transaction.type === 'sell'

      // Get asset symbol if we're updating it
      let assetSymbol: string | undefined
      if (updates.assetId && shouldUpdateLinked) {
        const asset = assets.find((a) => a.id === updates.assetId)
        assetSymbol = asset?.symbol
      }

      await updateMutation.mutateAsync({
        id: transaction.id,
        updates: {
          ...(updates.date && { date: updates.date }),
          ...(updates.txId !== undefined && { tx_id: updates.txId || null }),
          ...(updates.txExplorerUrl !== undefined && {
            tx_explorer_url: updates.txExplorerUrl || null,
          }),
          // Type-specific fields
          ...('amount' in updates &&
            updates.amount !== undefined && { amount: updates.amount }),
          ...('fiatAmount' in updates &&
            updates.fiatAmount !== undefined && {
              fiat_amount: updates.fiatAmount,
            }),
          ...('assetId' in updates &&
            updates.assetId && { asset_id: updates.assetId }),
          ...('storageId' in updates &&
            updates.storageId && { storage_id: updates.storageId }),
          ...('fromStorageId' in updates &&
            updates.fromStorageId && {
              from_storage_id: updates.fromStorageId,
            }),
          ...('toStorageId' in updates &&
            updates.toStorageId && { to_storage_id: updates.toStorageId }),
          ...('fromAssetId' in updates &&
            updates.fromAssetId && { from_asset_id: updates.fromAssetId }),
          ...('fromAmount' in updates &&
            updates.fromAmount !== undefined && {
              from_amount: updates.fromAmount,
            }),
          ...('toAssetId' in updates &&
            updates.toAssetId && { to_asset_id: updates.toAssetId }),
          ...('toAmount' in updates &&
            updates.toAmount !== undefined && { to_amount: updates.toAmount }),
        },
        linkedOptions: shouldUpdateLinked
          ? { updateLinked: true, assetSymbol }
          : undefined,
      })

      toast.success('Transaction updated successfully')
      setEditingTransaction(null)
    } catch (error) {
      console.error('Failed to update transaction:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to update transaction',
      )
      throw error
    }
  }

  const handleDeleteTransaction = async () => {
    if (!deletingTransaction) return

    try {
      await deleteMutation.mutateAsync(deletingTransaction.id)
      const hasLinkedTx = deletingTransaction.linkedTransactionId !== null
      toast.success(
        hasLinkedTx
          ? 'Transaction and linked expense/income deleted successfully'
          : 'Transaction deleted successfully',
      )
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete transaction',
      )
    } finally {
      setDeletingTransaction(null)
    }
  }

  const handleEdit = (transaction: CryptoTransactionWithDetails) => {
    setEditingTransaction(transaction)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Crypto Transactions</h1>
          <p className="text-muted-foreground">
            Track your cryptocurrency transactions
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2"
          disabled={isMutating || assets.length === 0 || storages.length === 0}
        >
          <Plus weight="bold" className="size-4" />
          Add Transaction
        </Button>
      </div>

      {/* Prerequisites Warning */}
      {(assets.length === 0 || storages.length === 0) && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <p className="font-medium">Prerequisites needed</p>
          <p className="text-sm">
            {assets.length === 0 && storages.length === 0
              ? 'Please add at least one asset and one storage before creating transactions.'
              : assets.length === 0
                ? 'Please add at least one asset before creating transactions.'
                : 'Please add at least one storage before creating transactions.'}
          </p>
        </div>
      )}

      {/* Filters */}
      <TransactionFilters filters={filters} onFiltersChange={updateFilters} />

      {/* Transaction List */}
      <TransactionList
        data={transactionsData}
        isLoading={isLoadingTransactions}
        onEdit={handleEdit}
        onDelete={setDeletingTransaction}
        onPageChange={updatePage}
      />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddTransaction}
        assets={assets}
        storages={storages}
        transactions={allTransactions}
        isSubmitting={createMutation.isPending}
      />

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransactionModal
          open
          onOpenChange={(open) => {
            if (!open) setEditingTransaction(null)
          }}
          transaction={editingTransaction}
          onSubmit={(updates) =>
            handleEditTransaction(editingTransaction, updates)
          }
          onDelete={() => {
            setEditingTransaction(null)
            setDeletingTransaction(editingTransaction)
          }}
          assets={assets}
          storages={storages}
          transactions={allTransactions}
          isSubmitting={updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletingTransaction !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingTransaction(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingTransaction?.linkedTransactionId &&
              (deletingTransaction.type === 'buy' ||
                deletingTransaction.type === 'sell') ? (
                <>
                  Are you sure you want to delete this{' '}
                  {deletingTransaction.type} transaction?{' '}
                  <strong>
                    The linked{' '}
                    {deletingTransaction.type === 'buy' ? 'expense' : 'income'}{' '}
                    transaction will also be deleted.
                  </strong>{' '}
                  This action cannot be undone.
                </>
              ) : (
                'Are you sure you want to delete this transaction? This action cannot be undone.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
