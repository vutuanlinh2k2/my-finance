import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
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
} from '@/lib/hooks/use-crypto-transactions'
import { useCryptoAssets } from '@/lib/hooks/use-crypto-assets'
import { useCryptoStorages } from '@/lib/hooks/use-crypto-storages'
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

  // Mutations
  const createMutation = useCreateCryptoTransaction()
  const deleteMutation = useDeleteCryptoTransaction()

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deletingTransaction, setDeletingTransaction] =
    useState<CryptoTransactionWithDetails | null>(null)

  // Check if any mutation is pending
  const isMutating = createMutation.isPending || deleteMutation.isPending

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
      await createMutation.mutateAsync(input)
      toast.success('Transaction added successfully')
    } catch (error) {
      console.error('Failed to add transaction:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to add transaction',
      )
      throw error
    }
  }

  const handleDeleteTransaction = async () => {
    if (!deletingTransaction) return

    try {
      await deleteMutation.mutateAsync(deletingTransaction.id)
      toast.success('Transaction deleted successfully')
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete transaction',
      )
    } finally {
      setDeletingTransaction(null)
    }
  }

  const handleEdit = (_transaction: CryptoTransactionWithDetails) => {
    // TODO: Implement edit modal in Phase 5
    toast.info('Edit functionality coming soon')
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
              Are you sure you want to delete this transaction? This action
              cannot be undone.
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
