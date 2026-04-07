import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Wallet } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { LnbAddressDialog } from '@/components/crypto/lnb-address-dialog'
import { LnbSummaryCards } from '@/components/crypto/lnb-summary-cards'
import { LnbHealthBar } from '@/components/crypto/lnb-health-bar'
import { LnbPositionsTable } from '@/components/crypto/lnb-positions-table'
import { formatStoredAddress } from '@/lib/aave/lnb'
import { useExchangeRateValue } from '@/lib/hooks/use-exchange-rate'
import {
  useAaveLnb,
  usePersistedLnbAddress,
} from '@/lib/hooks/use-aave-lnb'

export const Route = createFileRoute('/_authenticated/crypto/lnb')({
  component: CryptoLnbPage,
})

function CryptoLnbPage() {
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const { address, hasHydrated, saveAddress, clearAddress } =
    usePersistedLnbAddress()
  const { rate: exchangeRate } = useExchangeRateValue()
  const { hasValidAddress, position, suppliedAssets, borrowedAssets, isLoading, error } =
    useAaveLnb(address)

  const showAddressSkeleton = !hasHydrated
  const hasPositions = suppliedAssets.length > 0 || borrowedAssets.length > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">LnB</h1>
          <p className="text-muted-foreground">
            Track your Aave V3 lending and borrowing positions on Ethereum.
          </p>
        </div>

        <Button
          variant="outline"
          className="gap-2 font-mono"
          onClick={() => setIsAddressDialogOpen(true)}
          disabled={showAddressSkeleton}
        >
          <Wallet weight="duotone" className="size-4" />
          {showAddressSkeleton ? 'Loading...' : formatStoredAddress(address)}
        </Button>
      </div>

      {!hasHydrated ? (
        <>
          <LnbSummaryCards
            healthFactor={null}
            totalCollateralUsd={0}
            totalBorrowedUsd={0}
            availableToBorrowUsd={0}
            exchangeRate={exchangeRate}
            isLoading
          />
          <LnbHealthBar
            borrowedUsd={0}
            borrowLimitUsd={0}
            liquidationThresholdUsd={null}
            exchangeRate={exchangeRate}
            isLoading
          />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <LnbPositionsTable
              title="Supplied Assets"
              rows={[]}
              type="supplied"
              exchangeRate={exchangeRate}
              isLoading
              emptyMessage=""
            />
            <LnbPositionsTable
              title="Borrowed Assets"
              rows={[]}
              type="borrowed"
              exchangeRate={exchangeRate}
              isLoading
              emptyMessage=""
            />
          </div>
        </>
      ) : !address || !hasValidAddress ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-sidebar px-6 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <Wallet weight="duotone" className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">Add an Aave address</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Save an Ethereum wallet address to view its Aave V3 supplies,
            borrows, and health metrics.
          </p>
          <Button className="mt-5" onClick={() => setIsAddressDialogOpen(true)}>
            Add Address
          </Button>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-5 py-4">
          <h2 className="font-semibold text-destructive">Unable to load Aave data</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {error.message}
          </p>
        </div>
      ) : (
        <>
          <LnbSummaryCards
            healthFactor={position.healthFactor}
            totalCollateralUsd={position.totalCollateralUsd}
            totalBorrowedUsd={position.totalBorrowedUsd}
            availableToBorrowUsd={position.availableToBorrowUsd}
            exchangeRate={exchangeRate}
            isLoading={isLoading}
          />

          <LnbHealthBar
            borrowedUsd={position.totalBorrowedUsd}
            borrowLimitUsd={position.borrowLimitUsd}
            liquidationThresholdUsd={position.liquidationThresholdUsd}
            exchangeRate={exchangeRate}
            isLoading={isLoading}
          />

          {!isLoading && !hasPositions ? (
            <div className="rounded-lg border border-dashed border-border bg-sidebar px-6 py-10 text-center">
              <h2 className="text-lg font-semibold">No Ethereum Aave V3 positions</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This address does not currently have supplied or borrowed assets on
                Aave V3 Ethereum.
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <LnbPositionsTable
              title="Supplied Assets"
              rows={suppliedAssets}
              type="supplied"
              exchangeRate={exchangeRate}
              isLoading={isLoading}
              emptyMessage="No supplied assets found for this address."
            />
            <LnbPositionsTable
              title="Borrowed Assets"
              rows={borrowedAssets}
              type="borrowed"
              exchangeRate={exchangeRate}
              isLoading={isLoading}
              emptyMessage="No borrowed assets found for this address."
            />
          </div>
        </>
      )}

      <LnbAddressDialog
        open={isAddressDialogOpen}
        onOpenChange={setIsAddressDialogOpen}
        address={address}
        onSave={saveAddress}
        onRemove={clearAddress}
      />
    </div>
  )
}
