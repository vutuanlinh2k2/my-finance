import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { CryptoStorage } from '@/lib/crypto/types'
import type { CreateCryptoStorageInput } from '@/lib/api/crypto-storages'
import { formatCompact, formatCurrency } from '@/lib/currency'
import {
  useCreateCryptoStorage,
  useCryptoStorages,
  useDeleteCryptoStorage,
} from '@/lib/hooks/use-crypto-storages'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
  AddStorageModal,
  StorageAssetsPanel,
  StorageList,
  StoragePieChart,
  getStorageColor,
} from '@/components/crypto'

// Search params type for URL persistence
type StorageSearch = {
  selected?: string // Selected storage ID
}

// Validate and parse search params
function validateSearch(search: Record<string, unknown>): StorageSearch {
  return {
    selected: typeof search.selected === 'string' ? search.selected : undefined,
  }
}

export const Route = createFileRoute('/_authenticated/crypto/storage')({
  validateSearch,
  component: CryptoStoragePage,
})

function CryptoStoragePage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const search = Route.useSearch()

  // Crypto storages from database
  const { data: storages = [], isLoading } = useCryptoStorages()

  // Mutations
  const createMutation = useCreateCryptoStorage()
  const deleteMutation = useDeleteCryptoStorage()

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deletingStorage, setDeletingStorage] = useState<CryptoStorage | null>(
    null,
  )

  // Check if any mutation is pending
  const isMutating = createMutation.isPending || deleteMutation.isPending

  // Transform storages with value data (values will be 0 until transactions are implemented)
  const storagesWithValues = useMemo(() => {
    return storages.map((storage, index) => {
      // Until transactions are implemented, all values are 0
      const totalValueVnd = 0

      return {
        ...storage,
        totalValueVnd,
        percentage: 0, // Will be calculated below
        color: getStorageColor(index),
      }
    })
  }, [storages])

  // Calculate total value and percentages
  const totalValueVnd = useMemo(
    () => storagesWithValues.reduce((sum, s) => sum + s.totalValueVnd, 0),
    [storagesWithValues],
  )

  // Add percentage to each storage
  const storagesWithPercentages = useMemo(() => {
    return storagesWithValues.map((storage) => ({
      ...storage,
      percentage:
        totalValueVnd > 0 ? (storage.totalValueVnd / totalValueVnd) * 100 : 0,
    }))
  }, [storagesWithValues, totalValueVnd])

  // Get selected storage
  const selectedId = search.selected ?? null
  const selectedStorage = useMemo(
    () => storagesWithPercentages.find((s) => s.id === selectedId) ?? null,
    [storagesWithPercentages, selectedId],
  )

  // Assets in selected storage (empty until transactions are implemented)
  const assetsInStorage: Array<{
    id: string
    name: string
    symbol: string
    iconUrl: string | null
    balance: number
    valueVnd: number
    percentage: number
    color: string
  }> = []

  // Handlers
  const handleSelect = (id: string | null) => {
    navigate({
      search: {
        ...search,
        selected: id ?? undefined,
      },
    })
  }

  const handleAddStorage = async (input: CreateCryptoStorageInput) => {
    try {
      await createMutation.mutateAsync(input)
      toast.success('Storage added successfully')
    } catch (error) {
      console.error('Failed to add storage:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to add storage',
      )
      throw error
    }
  }

  const handleDeleteStorage = async () => {
    if (!deletingStorage) return

    try {
      await deleteMutation.mutateAsync(deletingStorage.id)
      toast.success('Storage deleted successfully')

      // Clear selection if deleted storage was selected
      if (selectedId === deletingStorage.id) {
        handleSelect(null)
      }
    } catch (error) {
      console.error('Failed to delete storage:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete storage',
      )
    } finally {
      setDeletingStorage(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Crypto Storage</h1>
          <p className="text-muted-foreground">
            Manage your exchanges and wallets
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2"
          disabled={isMutating}
        >
          <Plus weight="bold" className="size-4" />
          Add Storage
        </Button>
      </div>

      {/* Main Content - Two Panel Layout */}
      <div className="flex gap-6">
        {/* Left Panel - Chart & Storage List */}
        <div className="flex flex-1 flex-col rounded-xl border border-border bg-card p-6">
          {/* Total Display */}
          <div className="mb-2">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              TOTAL VALUE
            </p>
            {isLoading ? (
              <Skeleton className="mt-1 h-9 w-24" />
            ) : (
              <p
                className="tooltip-fast text-3xl font-bold"
                data-tooltip={formatCurrency(totalValueVnd)}
              >
                {formatCompact(totalValueVnd)}
              </p>
            )}
          </div>

          {/* Pie Chart */}
          {isLoading ? (
            <div className="mb-2 flex flex-col items-center justify-center py-2">
              <Skeleton className="size-48 rounded-full" />
            </div>
          ) : (
            <div className="mb-2 flex flex-col items-center justify-center py-2">
              <StoragePieChart
                storages={storagesWithPercentages}
                totalValueVnd={totalValueVnd}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            </div>
          )}

          {/* Storage List */}
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : (
            <StorageList
              storages={storagesWithPercentages}
              selectedId={selectedId}
              onSelect={handleSelect}
              onDelete={setDeletingStorage}
            />
          )}
        </div>

        {/* Right Panel - Assets in Selected Storage */}
        <div className="flex w-100 flex-col rounded-xl border border-dashed border-border bg-card">
          <StorageAssetsPanel
            storage={selectedStorage}
            assets={assetsInStorage}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Add Storage Modal */}
      <AddStorageModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddStorage}
        isSubmitting={createMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletingStorage !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingStorage(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Storage</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingStorage?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStorage}
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
