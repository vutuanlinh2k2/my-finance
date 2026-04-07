import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowBendDownLeft } from '@phosphor-icons/react'
import type { TimeRange } from '@/lib/api/dashboard'
import {
  buildNetWorthAssetSegments,
  calculateNetWorthBreakdown,
} from '@/lib/dashboard/net-worth'
import { useDashboardData, useNetWorthHistory } from '@/lib/hooks/use-dashboard'
import { useCryptoAssets } from '@/lib/hooks/use-crypto-assets'
import { useAllCryptoTransactions } from '@/lib/hooks/use-crypto-transactions'
import { useCryptoMarkets } from '@/lib/hooks/use-coingecko'
import { useExchangeRateValue } from '@/lib/hooks/use-exchange-rate'
import { useTrackedAaveAddress } from '@/lib/hooks/use-tracked-aave-address'
import { useAaveLnb } from '@/lib/hooks/use-aave-lnb'
import { calculateAssetBalance } from '@/lib/crypto/utils'
import { formatCompact, formatCurrency } from '@/lib/currency'
import {
  DashboardSummaryCards,
  NetWorthHistoryChart,
  NetWorthPieChart,
} from '@/components/dashboard'

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardPage,
})

function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1m')

  // Fetch dashboard data (bank balance and monthly totals)
  const {
    allTimeTotals,
    monthlyTotals,
    isLoading: isLoadingTotals,
  } = useDashboardData()

  // Fetch net worth history for the chart
  const { data: historyData = [], isLoading: isLoadingHistory } =
    useNetWorthHistory(timeRange)

  // Fetch crypto data for live portfolio value calculation
  const { data: cryptoAssets = [], isLoading: isLoadingAssets } =
    useCryptoAssets()
  const { data: cryptoTransactions = [], isLoading: isLoadingTransactions } =
    useAllCryptoTransactions()
  const exchangeRate = useExchangeRateValue()
  const { address: trackedAaveAddress, isLoading: isLoadingAaveAddress } =
    useTrackedAaveAddress()
  const {
    position: aavePosition,
    isLoading: isLoadingAavePosition,
    error: aaveError,
  } = useAaveLnb(trackedAaveAddress)

  // Fetch market prices for crypto assets
  const coingeckoIds = useMemo(
    () => cryptoAssets.map((a) => a.coingeckoId),
    [cryptoAssets],
  )
  const { data: marketData = [], isLoading: isLoadingPrices } =
    useCryptoMarkets(coingeckoIds, coingeckoIds.length > 0)

  // Create a map for quick lookup of prices by coingecko ID
  const priceMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const coin of marketData) {
      map.set(coin.id, coin.current_price)
    }
    return map
  }, [marketData])

  // Calculate current manual spot crypto value in VND
  const spotCryptoValueVnd = useMemo(() => {
    let total = 0
    for (const asset of cryptoAssets) {
      const balance = calculateAssetBalance(asset.id, null, cryptoTransactions)
      const priceUsd = priceMap.get(asset.coingeckoId) ?? 0
      const priceVnd = priceUsd * exchangeRate.rate
      total += balance * priceVnd
    }
    return total
  }, [cryptoAssets, cryptoTransactions, priceMap, exchangeRate.rate])

  const bankBalance = allTimeTotals?.bankBalance ?? 0
  const aaveSuppliedValueVnd =
    aavePosition.totalCollateralUsd * exchangeRate.rate
  const aaveBorrowedValueVnd = aavePosition.totalBorrowedUsd * exchangeRate.rate
  const breakdown = calculateNetWorthBreakdown({
    bankBalance,
    spotCryptoValue: spotCryptoValueVnd,
    aaveSuppliedValue: aaveSuppliedValueVnd,
    aaveBorrowedValue: aaveBorrowedValueVnd,
  })

  const dashboardTotals = {
    netWorth: breakdown.netWorth,
    bankBalance: breakdown.bankBalance,
    cryptoValue: breakdown.cryptoValue,
    spotCryptoValue: breakdown.spotCryptoValue,
    aaveSuppliedValue: breakdown.aaveSuppliedValue,
    aaveBorrowedValue: breakdown.aaveBorrowedValue,
    monthlyIncome: monthlyTotals?.totalIncome ?? 0,
    monthlyExpenses: monthlyTotals?.totalExpenses ?? 0,
  }

  const segments = useMemo(
    () =>
      buildNetWorthAssetSegments({
        bankBalance: breakdown.bankBalance,
        spotCryptoValue: breakdown.spotCryptoValue,
        aaveSuppliedValue: breakdown.aaveSuppliedValue,
      }),
    [
      breakdown.aaveSuppliedValue,
      breakdown.bankBalance,
      breakdown.spotCryptoValue,
    ],
  )

  const isLoading =
    isLoadingTotals ||
    isLoadingAssets ||
    isLoadingTransactions ||
    isLoadingPrices ||
    isLoadingAaveAddress ||
    isLoadingAavePosition

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Summary Cards */}
      <DashboardSummaryCards totals={dashboardTotals} isLoading={isLoading} />

      {!isLoadingAaveAddress && !!trackedAaveAddress && aaveError ? (
        <div className="rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Aave positions could not be loaded, so the dashboard is currently
          using only your bank balance and spot crypto.
        </div>
      ) : null}

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pie Chart - 1/3 width on large screens */}
        <div className="flex h-[400px] flex-col rounded-lg border border-border bg-sidebar p-4">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">
            Net Worth Breakdown
          </h3>
          <div className="flex flex-1 items-center justify-center">
            <NetWorthPieChart
              segments={segments}
              totalNetWorth={breakdown.netWorth}
              isLoading={isLoading}
            />
          </div>
          {!isLoading && breakdown.aaveBorrowedValue > 0 ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
              <div className="flex items-center gap-2 font-medium">
                <ArrowBendDownLeft weight="bold" className="size-4" />
                Aave Borrowed
              </div>
              <div
                className="tooltip-fast mt-1 font-semibold"
                data-tooltip={formatCurrency(breakdown.aaveBorrowedValue)}
              >
                -{formatCompact(breakdown.aaveBorrowedValue)}
              </div>
            </div>
          ) : null}
        </div>

        {/* History Chart - 2/3 width on large screens */}
        <div className="h-[400px] lg:col-span-2">
          <NetWorthHistoryChart
            data={historyData}
            isLoading={isLoadingHistory}
            onTimeRangeChange={setTimeRange}
          />
        </div>
      </div>
    </div>
  )
}
