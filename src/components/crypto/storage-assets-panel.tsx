import { Buildings, Cube, Wallet as WalletIcon } from '@phosphor-icons/react'
import type { CryptoStorageWithValue } from '@/lib/crypto/types'
import { formatCompact, formatCurrency } from '@/lib/currency'
import { Skeleton } from '@/components/ui/skeleton'

interface StorageAsset {
  id: string
  name: string
  symbol: string
  iconUrl: string | null
  balance: number
  valueVnd: number
  percentage: number
  color: string
}

interface StorageAssetsPanelProps {
  storage: CryptoStorageWithValue | null
  assets: Array<StorageAsset>
  isLoading?: boolean
}

export function StorageAssetsPanel({
  storage,
  assets,
  isLoading = false,
}: StorageAssetsPanelProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="border-b border-border p-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex flex-col gap-3 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="mb-1 h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // No storage selected state
  if (!storage) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
          <Cube className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Select a Storage</h3>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Click on a storage from the list to view its assets and balances
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border p-4">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${storage.color}20` }}
        >
          {storage.type === 'cex' ? (
            <Buildings className="size-5" style={{ color: storage.color }} />
          ) : (
            <WalletIcon className="size-5" style={{ color: storage.color }} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{storage.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="uppercase">{storage.type}</span>
            {storage.address && (
              <>
                <span>•</span>
                <span className="font-mono text-xs">
                  {storage.address.slice(0, 6)}...{storage.address.slice(-4)}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div
            className="tooltip-fast text-lg font-semibold"
            data-tooltip={formatCurrency(storage.totalValueVnd)}
          >
            {formatCompact(storage.totalValueVnd)}
          </div>
          <div className="text-sm text-muted-foreground">
            {storage.percentage.toFixed(1)}% of portfolio
          </div>
        </div>
      </div>

      {/* Assets List */}
      <div className="flex-1 overflow-y-auto">
        {assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
              <Cube className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No assets in this storage
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add transactions to track your holdings
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4">
            {assets
              .sort((a, b) => b.valueVnd - a.valueVnd)
              .map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  {/* Asset Icon */}
                  {asset.iconUrl ? (
                    <img
                      src={asset.iconUrl}
                      alt={asset.name}
                      className="size-8 shrink-0 rounded-full"
                    />
                  ) : (
                    <div
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: asset.color }}
                    >
                      {asset.symbol.slice(0, 2)}
                    </div>
                  )}

                  {/* Asset Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{asset.symbol}</span>
                      <span className="truncate text-sm text-muted-foreground">
                        {asset.name}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {asset.balance.toLocaleString('en-US', {
                        maximumFractionDigits: 8,
                      })}{' '}
                      {asset.symbol}
                    </p>
                  </div>

                  {/* Asset Value */}
                  <div className="shrink-0 text-right">
                    <div
                      className="tooltip-fast font-semibold"
                      data-tooltip={formatCurrency(asset.valueVnd)}
                    >
                      {formatCompact(asset.valueVnd)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {asset.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
