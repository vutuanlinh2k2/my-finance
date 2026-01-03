import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { CryptoAsset } from '@/lib/crypto/types'
import type { CreateCryptoAssetInput } from '@/lib/api/crypto-assets'
import { calculateAssetBalance } from '@/lib/crypto/utils'
import {
  useCreateCryptoAsset,
  useCryptoAssets,
  useDeleteCryptoAsset,
} from '@/lib/hooks/use-crypto-assets'
import { useAllCryptoTransactions } from '@/lib/hooks/use-crypto-transactions'
import { useCryptoMarkets } from '@/lib/hooks/use-coingecko'
import { useExchangeRateValue } from '@/lib/hooks/use-exchange-rate'
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
  AddAssetModal,
  AllocationPieChart,
  AssetsTable,
  PortfolioHistoryChart,
  getAssetColor,
} from '@/components/crypto'

export const Route = createFileRoute('/_authenticated/crypto/assets')({
  component: CryptoAssetsPage,
})

function CryptoAssetsPage() {
  // Crypto assets from database
  const { data: assets = [], isLoading: isLoadingAssets } = useCryptoAssets()

  // All crypto transactions for balance calculation
  const { data: transactions = [], isLoading: isLoadingTransactions } =
    useAllCryptoTransactions()

  // Exchange rate for USD to VND conversion
  const exchangeRate = useExchangeRateValue()

  // Fetch market data for all assets (includes extended price changes)
  const coingeckoIds = useMemo(() => assets.map((a) => a.coingeckoId), [assets])
  const { data: marketData = [], isLoading: isLoadingPrices } =
    useCryptoMarkets(coingeckoIds, coingeckoIds.length > 0)

  // Create a map for quick lookup of market data by coingecko ID
  const marketDataMap = useMemo(() => {
    const map = new Map<string, (typeof marketData)[number]>()
    for (const coin of marketData) {
      map.set(coin.id, coin)
    }
    return map
  }, [marketData])

  // Mutations
  const createMutation = useCreateCryptoAsset()
  const deleteMutation = useDeleteCryptoAsset()

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deletingAsset, setDeletingAsset] = useState<CryptoAsset | null>(null)

  // Check if any mutation is pending
  const isMutating = createMutation.isPending || deleteMutation.isPending

  // Transform assets with price data
  const assetsWithPrices = useMemo(() => {
    return assets.map((asset, index) => {
      const coinData = marketDataMap.get(asset.coingeckoId)
      const currentPriceUsd = coinData?.current_price ?? 0
      const currentPriceVnd = currentPriceUsd * exchangeRate.rate
      const marketCapUsd = coinData?.market_cap ?? 0

      // Calculate balance from transactions (across all storages)
      const balance = calculateAssetBalance(asset.id, null, transactions)
      const valueVnd = balance * currentPriceVnd

      return {
        ...asset,
        currentPriceVnd,
        currentPriceUsd,
        marketCapUsd,
        priceChange24h: coinData?.price_change_percentage_24h ?? 0,
        priceChange7d: coinData?.price_change_percentage_7d_in_currency ?? 0,
        priceChange30d: coinData?.price_change_percentage_30d_in_currency ?? 0,
        priceChange60d: coinData?.price_change_percentage_60d_in_currency ?? 0,
        priceChange1y: coinData?.price_change_percentage_1y_in_currency ?? 0,
        balance,
        valueVnd,
        color: getAssetColor(index),
      }
    })
  }, [assets, marketDataMap, exchangeRate.rate, transactions])

  // Calculate portfolio totals
  const totalValueVnd = useMemo(
    () => assetsWithPrices.reduce((sum, asset) => sum + asset.valueVnd, 0),
    [assetsWithPrices],
  )

  // Add portfolio percentage to each asset
  const assetsWithPortfolio = useMemo(() => {
    return assetsWithPrices.map((asset) => ({
      ...asset,
      portfolioPercentage:
        totalValueVnd > 0 ? (asset.valueVnd / totalValueVnd) * 100 : 0,
    }))
  }, [assetsWithPrices, totalValueVnd])

  // Get balance of asset being deleted
  const deletingAssetBalance =
    assetsWithPortfolio.find((a) => a.id === deletingAsset?.id)?.balance ?? 0
  const canDeleteAsset = deletingAssetBalance === 0

  // Prepare allocation data for pie chart
  const allocations = assetsWithPrices
    .filter((a) => a.valueVnd > 0)
    .map((asset) => ({
      id: asset.id,
      name: asset.name,
      symbol: asset.symbol,
      valueVnd: asset.valueVnd,
      percentage:
        totalValueVnd > 0 ? (asset.valueVnd / totalValueVnd) * 100 : 0,
      color: asset.color,
      iconUrl: asset.iconUrl,
    }))

  // Handlers
  const handleAddAsset = async (input: CreateCryptoAssetInput) => {
    try {
      await createMutation.mutateAsync(input)
      toast.success('Asset added to portfolio')
    } catch (error) {
      console.error('Failed to add asset:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to add asset',
      )
      throw error
    }
  }

  const handleDeleteAsset = async () => {
    if (!deletingAsset) return

    try {
      await deleteMutation.mutateAsync(deletingAsset.id)
      toast.success('Asset removed from portfolio')
    } catch (error) {
      console.error('Failed to delete asset:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete asset',
      )
    } finally {
      setDeletingAsset(null)
    }
  }

  const isLoading = isLoadingAssets || isLoadingTransactions || isLoadingPrices

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Crypto Assets</h1>
          <p className="text-muted-foreground">
            Track your cryptocurrency portfolio
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2"
          disabled={isMutating}
        >
          <Plus weight="bold" className="size-4" />
          Add Asset
        </Button>
      </div>

      {/* Charts Row */}
      <div className="flex gap-6">
        {/* Allocation Pie Chart */}
        <div className="w-[320px] shrink-0 rounded-lg border border-border bg-sidebar p-4">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Allocation
          </h2>
          <AllocationPieChart
            allocations={allocations}
            totalValueVnd={totalValueVnd}
            isLoading={isLoading}
          />
        </div>

        {/* History Charts */}
        <PortfolioHistoryChart />
      </div>

      {/* Assets Table */}
      <AssetsTable
        assets={assetsWithPortfolio}
        onDelete={setDeletingAsset}
        isLoading={isLoading}
      />

      {/* Add Asset Modal */}
      <AddAssetModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddAsset}
        isSubmitting={createMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletingAsset !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingAsset(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              {canDeleteAsset ? (
                <>
                  Are you sure you want to remove "{deletingAsset?.name}" from
                  your portfolio? This action cannot be undone.
                </>
              ) : (
                <>
                  Cannot delete "{deletingAsset?.name}" because it has a balance
                  of {deletingAssetBalance} {deletingAsset?.symbol}. Please
                  transfer out or sell all holdings before deleting this asset.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {canDeleteAsset ? 'Cancel' : 'Close'}
            </AlertDialogCancel>
            {canDeleteAsset && (
              <AlertDialogAction
                onClick={handleDeleteAsset}
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
