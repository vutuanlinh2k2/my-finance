import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { CryptoStorage } from '@/lib/crypto/types'
import type { CreateCryptoStorageInput } from '@/lib/api/crypto-storages'
import { calculateAssetBalance, getAllBalances } from '@/lib/crypto/utils'
import { formatCompact, formatCurrency } from '@/lib/currency'
import { useCryptoAssets } from '@/lib/hooks/use-crypto-assets'
import {
  useCreateCryptoStorage,
  useCryptoStorages,
  useDeleteCryptoStorage,
} from '@/lib/hooks/use-crypto-storages'
import { useAllCryptoTransactions } from '@/lib/hooks/use-crypto-transactions'
import { useCryptoMarkets } from '@/lib/hooks/use-coingecko'
import { useExchangeRateValue } from '@/lib/hooks/use-exchange-rate'
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
  const { data: storages = [], isLoading: isLoadingStorages } =
    useCryptoStorages()

  // Crypto assets from database
  const { data: assets = [], isLoading: isLoadingAssets } = useCryptoAssets()

  // All crypto transactions for balance calculation
  const { data: transactions = [], isLoading: isLoadingTransactions } =
    useAllCryptoTransactions()

  // Exchange rate for USD to VND conversion
  const exchangeRate = useExchangeRateValue()

  // Fetch market data for all assets
  const coingeckoIds = useMemo(() => assets.map((a) => a.coingeckoId), [assets])
  const { data: marketData = [], isLoading: isLoadingPrices } =
    useCryptoMarkets(coingeckoIds, coingeckoIds.length > 0)

  // Create a map for quick lookup of price by asset ID
  const pricesByAssetId = useMemo(() => {
    const map = new Map<string, number>()
    for (const asset of assets) {
      const coin = marketData.find((m) => m.id === asset.coingeckoId)
      if (coin) {
        map.set(asset.id, coin.current_price * exchangeRate.rate)
      }
    }
    return map
  }, [assets, marketData, exchangeRate.rate])

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

  // Get all balances by storage and asset
  const allBalances = useMemo(
    () => getAllBalances(transactions),
    [transactions],
  )

  // Transform storages with value data
  const storagesWithValues = useMemo(() => {
    return storages.map((storage, index) => {
      // Calculate total value in this storage
      // allBalances is Map<assetId, Map<storageId, balance>>
      let totalValueVnd = 0

      for (const [assetId, storageBalances] of allBalances) {
        const balance = storageBalances.get(storage.id)
        if (balance && balance > 0) {
          const priceVnd = pricesByAssetId.get(assetId) ?? 0
          totalValueVnd += balance * priceVnd
        }
      }

      return {
        ...storage,
        totalValueVnd,
        percentage: 0, // Will be calculated below
        color: getStorageColor(index),
      }
    })
  }, [storages, allBalances, pricesByAssetId])

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

  // Get value of storage being deleted
  const deletingStorageValue =
    storagesWithPercentages.find((s) => s.id === deletingStorage?.id)
      ?.totalValueVnd ?? 0
  const canDeleteStorage = deletingStorageValue === 0

  // Get selected storage
  const selectedId = search.selected ?? null
  const selectedStorage = useMemo(
    () => storagesWithPercentages.find((s) => s.id === selectedId) ?? null,
    [storagesWithPercentages, selectedId],
  )

  // Assets in selected storage
  const assetsInStorage = useMemo(() => {
    if (!selectedId) return []

    const assetsList: Array<{
      id: string
      name: string
      symbol: string
      iconUrl: string | null
      balance: number
      valueVnd: number
      percentage: number
      color: string
    }> = []

    // allBalances is Map<assetId, Map<storageId, balance>>
    let index = 0
    for (const [assetId, storageBalances] of allBalances) {
      const balance = storageBalances.get(selectedId)
      if (!balance || balance <= 0) continue

      const asset = assets.find((a) => a.id === assetId)
      if (!asset) continue

      const priceVnd = pricesByAssetId.get(assetId) ?? 0
      const valueVnd = balance * priceVnd

      assetsList.push({
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        iconUrl: asset.iconUrl,
        balance,
        valueVnd,
        percentage:
          selectedStorage && selectedStorage.totalValueVnd > 0
            ? (valueVnd / selectedStorage.totalValueVnd) * 100
            : 0,
        color: getStorageColor(index),
      })
      index++
    }

    // Sort by value descending
    return assetsList.sort((a, b) => b.valueVnd - a.valueVnd)
  }, [selectedId, allBalances, assets, pricesByAssetId, selectedStorage])

  // Combined loading state
  const isLoading =
    isLoadingStorages ||
    isLoadingAssets ||
    isLoadingTransactions ||
    isLoadingPrices

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
              {canDeleteStorage ? (
                <>
                  Are you sure you want to delete "{deletingStorage?.name}"?
                  This action cannot be undone.
                </>
              ) : (
                <>
                  Cannot delete "{deletingStorage?.name}" because it has assets
                  worth {formatCompact(deletingStorageValue)}. Please transfer
                  out all assets before deleting this storage.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {canDeleteStorage ? 'Cancel' : 'Close'}
            </AlertDialogCancel>
            {canDeleteStorage && (
              <AlertDialogAction
                onClick={handleDeleteStorage}
                disabled={deleteMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
