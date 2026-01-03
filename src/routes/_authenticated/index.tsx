import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { TimeRange } from '@/lib/api/dashboard'
import type { NetWorthSegment } from '@/lib/dashboard/types'
import {
  useDashboardData,
  useNetWorthHistory,
} from '@/lib/hooks/use-dashboard'
import { useCryptoAssets } from '@/lib/hooks/use-crypto-assets'
import { useAllCryptoTransactions } from '@/lib/hooks/use-crypto-transactions'
import { useCryptoMarkets } from '@/lib/hooks/use-coingecko'
import { useExchangeRateValue } from '@/lib/hooks/use-exchange-rate'
import { calculateAssetBalance } from '@/lib/crypto/utils'
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
  const { allTimeTotals, monthlyTotals, isLoading: isLoadingTotals } = useDashboardData()

  // Fetch net worth history for the chart
  const { data: historyData = [], isLoading: isLoadingHistory } = useNetWorthHistory(timeRange)

  // Fetch crypto data for live portfolio value calculation
  const { data: cryptoAssets = [], isLoading: isLoadingAssets } = useCryptoAssets()
  const { data: cryptoTransactions = [], isLoading: isLoadingTransactions } = useAllCryptoTransactions()
  const exchangeRate = useExchangeRateValue()

  // Fetch market prices for crypto assets
  const coingeckoIds = useMemo(() => cryptoAssets.map((a) => a.coingeckoId), [cryptoAssets])
  const { data: marketData = [], isLoading: isLoadingPrices } = useCryptoMarkets(
    coingeckoIds,
    coingeckoIds.length > 0,
  )

  // Create a map for quick lookup of prices by coingecko ID
  const priceMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const coin of marketData) {
      map.set(coin.id, coin.current_price)
    }
    return map
  }, [marketData])

  // Calculate current crypto portfolio value in VND
  const cryptoValueVnd = useMemo(() => {
    let total = 0
    for (const asset of cryptoAssets) {
      const balance = calculateAssetBalance(asset.id, null, cryptoTransactions)
      const priceUsd = priceMap.get(asset.coingeckoId) ?? 0
      const priceVnd = priceUsd * exchangeRate.rate
      total += balance * priceVnd
    }
    return total
  }, [cryptoAssets, cryptoTransactions, priceMap, exchangeRate.rate])

  // Calculate totals for summary cards
  const bankBalance = allTimeTotals?.bankBalance ?? 0
  const netWorth = bankBalance + cryptoValueVnd

  const dashboardTotals = {
    netWorth,
    bankBalance,
    cryptoValue: cryptoValueVnd,
    monthlyIncome: monthlyTotals?.totalIncome ?? 0,
    monthlyExpenses: monthlyTotals?.totalExpenses ?? 0,
  }

  // Calculate pie chart segments
  const segments: Array<NetWorthSegment> = useMemo(() => {
    const total = bankBalance + cryptoValueVnd
    if (total === 0) return []

    const result: Array<NetWorthSegment> = []

    if (bankBalance > 0) {
      result.push({
        id: 'bank',
        name: 'Bank Balance',
        value: bankBalance,
        percentage: (bankBalance / total) * 100,
        color: '#10b981', // emerald
      })
    }

    if (cryptoValueVnd > 0) {
      result.push({
        id: 'crypto',
        name: 'Crypto Investment',
        value: cryptoValueVnd,
        percentage: (cryptoValueVnd / total) * 100,
        color: '#3b82f6', // blue
      })
    }

    return result
  }, [bankBalance, cryptoValueVnd])

  // Transform history data to match chart format
  const chartData = useMemo(() => {
    return historyData.map((snapshot) => ({
      date: snapshot.snapshotDate,
      bankBalance: snapshot.bankBalance,
      cryptoValue: snapshot.cryptoValueVnd,
      totalNetWorth: snapshot.totalNetWorth,
    }))
  }, [historyData])

  const isLoading =
    isLoadingTotals ||
    isLoadingAssets ||
    isLoadingTransactions ||
    isLoadingPrices

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Summary Cards */}
      <DashboardSummaryCards totals={dashboardTotals} isLoading={isLoading} />

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
              totalNetWorth={netWorth}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* History Chart - 2/3 width on large screens */}
        <div className="h-[400px] lg:col-span-2">
          <NetWorthHistoryChart
            data={chartData}
            isLoading={isLoadingHistory}
            onTimeRangeChange={setTimeRange}
          />
        </div>
      </div>
    </div>
  )
}
