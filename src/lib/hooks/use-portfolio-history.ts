import { useQuery } from '@tanstack/react-query'
import type {
  AllocationHistoryPoint,
  PortfolioSnapshot,
  PortfolioTimeRange,
  ValueHistoryPoint,
} from '@/lib/crypto/types'
import { fetchPortfolioSnapshots } from '@/lib/api/crypto-portfolio-snapshots'
import { queryKeys } from '@/lib/query-keys'

/**
 * Transform database row to PortfolioSnapshot type
 */
function transformToSnapshot(
  row: Awaited<ReturnType<typeof fetchPortfolioSnapshots>>[number],
): PortfolioSnapshot {
  return {
    id: row.id,
    userId: row.user_id,
    snapshotDate: row.snapshot_date,
    totalValueUsd: Number(row.total_value_usd),
    allocations: row.allocations as PortfolioSnapshot['allocations'],
    createdAt: row.created_at,
  }
}

/**
 * Hook to fetch portfolio snapshots for a given time range
 */
export function usePortfolioSnapshots(range: PortfolioTimeRange) {
  return useQuery({
    queryKey: queryKeys.crypto.portfolioHistory.byRange(range),
    queryFn: async (): Promise<Array<PortfolioSnapshot>> => {
      const data = await fetchPortfolioSnapshots(range)
      return data.map(transformToSnapshot)
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - snapshots don't change frequently
  })
}

/**
 * Hook to get transformed data for value history chart
 */
export function useValueHistory(
  range: PortfolioTimeRange,
  exchangeRate: number,
) {
  const { data: snapshots, isLoading, error } = usePortfolioSnapshots(range)

  const valueHistory: Array<ValueHistoryPoint> =
    snapshots?.map((snapshot) => ({
      date: snapshot.snapshotDate,
      valueVnd: snapshot.totalValueUsd * exchangeRate,
    })) ?? []

  return {
    data: valueHistory,
    isLoading,
    error,
    hasData: valueHistory.length > 0,
  }
}

/**
 * Hook to get transformed data for allocation history chart
 */
export function useAllocationHistory(range: PortfolioTimeRange) {
  const { data: snapshots, isLoading, error } = usePortfolioSnapshots(range)

  // Get unique asset IDs across all snapshots
  const assetIds = new Set<string>()
  snapshots?.forEach((snapshot) => {
    Object.keys(snapshot.allocations).forEach((id) => assetIds.add(id))
  })

  const allocationHistory: Array<AllocationHistoryPoint> =
    snapshots?.map((snapshot) => {
      const point: AllocationHistoryPoint = {
        date: snapshot.snapshotDate,
      }
      // Include all known assets, with 0 for missing ones
      assetIds.forEach((id) => {
        const allocation = snapshot.allocations[id] as
          | { percentage: number; valueUsd: number }
          | undefined
        point[id] = allocation?.percentage ?? 0
      })
      return point
    }) ?? []

  return {
    data: allocationHistory,
    assetIds: Array.from(assetIds),
    isLoading,
    error,
    hasData: allocationHistory.length > 0,
  }
}
