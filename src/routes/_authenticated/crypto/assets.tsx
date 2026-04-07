import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { CryptoAsset } from '@/lib/crypto/types'
import type { CreateCryptoAssetInput } from '@/lib/api/crypto-assets'
import { calculateAssetBalance } from '@/lib/crypto/utils'
import { getKnownAaveEthereumATokenCoinGeckoId } from '@/lib/aave/asset-icons'
import {
  useAaveLnb,
  usePersistedLnbAddress,
} from '@/lib/hooks/use-aave-lnb'
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
  type PortfolioAssetRow,
  getAssetColor,
} from '@/components/crypto'

export const Route = createFileRoute('/_authenticated/crypto/assets')({
  component: CryptoAssetsPage,
})

function getAaveTokenName(name: string): string {
  return `Aave v3 ${name}`
}

function getAaveTokenSymbol(symbol: string): string {
  return `A${symbol.toUpperCase()}`
}

function CryptoAssetsPage() {
  // Crypto assets from database
  const { data: assets = [], isLoading: isLoadingAssets } = useCryptoAssets()

  // All crypto transactions for balance calculation
  const { data: transactions = [], isLoading: isLoadingTransactions } =
    useAllCryptoTransactions()

  // Exchange rate for USD to VND conversion
  const exchangeRate = useExchangeRateValue()

  // Persisted Aave address and live positions
  const { address, hasHydrated } = usePersistedLnbAddress()
  const {
    hasValidAddress,
    suppliedAssets,
    isLoading: isLoadingAave,
    error: aaveError,
  } = useAaveLnb(address)

  const generatedAaveCoinGeckoIds = useMemo(
    () =>
      new Set(
        suppliedAssets
          .map((asset) =>
            getKnownAaveEthereumATokenCoinGeckoId(asset.underlyingAsset),
          )
          .filter((value): value is string => !!value),
      ),
    [suppliedAssets],
  )

  const manualAssets = useMemo(
    () =>
      assets.filter(
        (asset) => !generatedAaveCoinGeckoIds.has(asset.coingeckoId),
      ),
    [assets, generatedAaveCoinGeckoIds],
  )

  const manualCoinGeckoIds = useMemo(
    () => manualAssets.map((asset) => asset.coingeckoId),
    [manualAssets],
  )
  const aaveCoinGeckoIds = useMemo(
    () =>
      suppliedAssets
        .map((asset) =>
          getKnownAaveEthereumATokenCoinGeckoId(asset.underlyingAsset),
        )
        .filter((value): value is string => !!value),
    [suppliedAssets],
  )

  const { data: manualMarketData = [], isLoading: isLoadingManualPrices } =
    useCryptoMarkets(manualCoinGeckoIds, manualCoinGeckoIds.length > 0)
  const { data: aaveMarketData = [], isLoading: isLoadingAavePrices } =
    useCryptoMarkets(aaveCoinGeckoIds, aaveCoinGeckoIds.length > 0)

  const manualMarketDataMap = useMemo(() => {
    const map = new Map<string, (typeof manualMarketData)[number]>()
    for (const coin of manualMarketData) {
      map.set(coin.id, coin)
    }
    return map
  }, [manualMarketData])

  const aaveMarketDataMap = useMemo(() => {
    const map = new Map<string, (typeof manualMarketData)[number]>()
    for (const coin of aaveMarketData) {
      map.set(coin.id, coin)
    }
    return map
  }, [aaveMarketData])

  // Mutations
  const createMutation = useCreateCryptoAsset()
  const deleteMutation = useDeleteCryptoAsset()

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deletingAsset, setDeletingAsset] = useState<CryptoAsset | null>(null)

  // Check if any mutation is pending
  const isMutating = createMutation.isPending || deleteMutation.isPending

  const manualAssetsWithPrices = useMemo<Array<PortfolioAssetRow>>(() => {
    return manualAssets.map((asset) => {
      const coinData = manualMarketDataMap.get(asset.coingeckoId)
      const currentPriceUsd = coinData?.current_price ?? 0
      const currentPriceVnd = currentPriceUsd * exchangeRate.rate
      const marketCapUsd = coinData?.market_cap ?? 0

      // Calculate balance from transactions (across all storages)
      const balance = calculateAssetBalance(asset.id, null, transactions)
      const valueVnd = balance * currentPriceVnd

      return {
        id: asset.id,
        source: 'manual',
        sourceLabel: null,
        name: asset.name,
        symbol: asset.symbol,
        iconUrl: asset.iconUrl,
        currentPriceVnd,
        currentPriceUsd,
        marketCapUsd,
        priceChange24h: coinData?.price_change_percentage_24h ?? null,
        priceChange7d: coinData?.price_change_percentage_7d_in_currency ?? null,
        priceChange30d: coinData?.price_change_percentage_30d_in_currency ?? null,
        priceChange60d: coinData?.price_change_percentage_60d_in_currency ?? null,
        priceChange1y: coinData?.price_change_percentage_1y_in_currency ?? null,
        balance,
        valueVnd,
        portfolioPercentage: 0,
        backingAsset: asset,
      }
    })
  }, [exchangeRate.rate, manualAssets, manualMarketDataMap, transactions])

  const aaveAssetRows = useMemo<Array<PortfolioAssetRow>>(() => {
    return suppliedAssets.map((asset) => {
      const aTokenId = getKnownAaveEthereumATokenCoinGeckoId(asset.underlyingAsset)
      const coinData = aTokenId ? aaveMarketDataMap.get(aTokenId) : undefined
      const currentPriceUsd =
        coinData?.current_price ??
        (asset.suppliedAmount > 0 ? asset.valueUsd / asset.suppliedAmount : 0)
      const currentPriceVnd = currentPriceUsd * exchangeRate.rate
      const marketCapUsd = coinData?.market_cap ?? 0
      const name = coinData?.name ?? getAaveTokenName(asset.name)
      const symbol = (coinData?.symbol ?? getAaveTokenSymbol(asset.symbol)).toUpperCase()

      return {
        id: `aave-supply:${asset.underlyingAsset}`,
        source: 'aave',
        sourceLabel: 'Aave',
        name,
        symbol,
        iconUrl: coinData?.image ?? asset.iconUrl,
        currentPriceVnd,
        currentPriceUsd,
        marketCapUsd,
        priceChange24h: coinData?.price_change_percentage_24h ?? null,
        priceChange7d: coinData?.price_change_percentage_7d_in_currency ?? null,
        priceChange30d: coinData?.price_change_percentage_30d_in_currency ?? null,
        priceChange60d: coinData?.price_change_percentage_60d_in_currency ?? null,
        priceChange1y: coinData?.price_change_percentage_1y_in_currency ?? null,
        balance: asset.suppliedAmount,
        valueVnd: asset.valueUsd * exchangeRate.rate,
        portfolioPercentage: 0,
        backingAsset: null,
      }
    })
  }, [aaveMarketDataMap, exchangeRate.rate, suppliedAssets])

  const portfolioRows = useMemo(
    () => [...manualAssetsWithPrices, ...aaveAssetRows],
    [manualAssetsWithPrices, aaveAssetRows],
  )

  // Calculate portfolio totals
  const totalValueVnd = useMemo(
    () => portfolioRows.reduce((sum, asset) => sum + asset.valueVnd, 0),
    [portfolioRows],
  )

  // Add portfolio percentage to each asset
  const assetsWithPortfolio = useMemo(() => {
    return portfolioRows.map((asset) => ({
      ...asset,
      portfolioPercentage:
        totalValueVnd > 0 ? (asset.valueVnd / totalValueVnd) * 100 : 0,
    }))
  }, [portfolioRows, totalValueVnd])

  // Get balance of asset being deleted
  const deletingAssetBalance =
    assetsWithPortfolio.find((a) => a.id === deletingAsset?.id)?.balance ?? 0
  const canDeleteAsset = deletingAssetBalance === 0

  // Prepare allocation data for pie chart
  const allocations = assetsWithPortfolio
    .filter((a) => a.valueVnd > 0)
    .map((asset, index) => ({
      id: asset.id,
      name: asset.name,
      symbol: asset.symbol,
      valueVnd: asset.valueVnd,
      percentage: asset.portfolioPercentage,
      color: getAssetColor(index),
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

  const isLoading =
    isLoadingAssets ||
    isLoadingTransactions ||
    isLoadingManualPrices ||
    isLoadingAavePrices ||
    (hasHydrated && hasValidAddress && isLoadingAave)

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Crypto Assets</h1>
          <p className="text-muted-foreground">
            Track your spot holdings and Aave supplied assets
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

      {hasHydrated && hasValidAddress && aaveError ? (
        <div className="rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Aave positions could not be loaded, so only your manual assets are
          shown right now.
        </div>
      ) : null}

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
        <PortfolioHistoryChart
          assets={manualAssets}
          exchangeRate={exchangeRate.rate}
        />
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
