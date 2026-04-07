import type { NetWorthSegment } from '@/lib/dashboard/types'

export interface NetWorthBreakdownInput {
  bankBalance: number
  spotCryptoValue: number
  aaveSuppliedValue: number
  aaveBorrowedValue: number
}

export interface NetWorthBreakdown extends NetWorthBreakdownInput {
  cryptoValue: number
  netWorth: number
}

export function calculateNetWorthBreakdown(
  input: NetWorthBreakdownInput,
): NetWorthBreakdown {
  const cryptoValue =
    input.spotCryptoValue + input.aaveSuppliedValue - input.aaveBorrowedValue
  const netWorth = input.bankBalance + cryptoValue

  return {
    ...input,
    cryptoValue,
    netWorth,
  }
}

export function buildNetWorthAssetSegments(input: {
  bankBalance: number
  spotCryptoValue: number
  aaveSuppliedValue: number
}): Array<NetWorthSegment> {
  const items = [
    {
      id: 'bank',
      name: 'Bank Balance',
      value: input.bankBalance,
      color: '#10b981',
    },
    {
      id: 'spot-crypto',
      name: 'Spot Crypto',
      value: input.spotCryptoValue,
      color: '#3b82f6',
    },
    {
      id: 'aave-supplied',
      name: 'Aave Supplied',
      value: input.aaveSuppliedValue,
      color: '#f59e0b',
    },
  ].filter((item) => item.value > 0)

  const totalAssets = items.reduce((sum, item) => sum + item.value, 0)
  if (totalAssets <= 0) return []

  return items.map((item) => ({
    ...item,
    percentage: (item.value / totalAssets) * 100,
  }))
}

export function getChartDomain(values: Array<number>): [number, number] {
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const base = Math.max(Math.abs(minValue), Math.abs(maxValue), 1)
  const padding = (maxValue - minValue) * 0.1 || base * 0.1

  return [minValue - padding, maxValue + padding]
}
