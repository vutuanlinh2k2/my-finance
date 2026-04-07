import { describe, expect, it } from 'vitest'
import {
  buildNetWorthAssetSegments,
  calculateNetWorthBreakdown,
  getChartDomain,
} from '@/lib/dashboard/net-worth'

describe('calculateNetWorthBreakdown', () => {
  it('subtracts Aave borrowed value from crypto net worth', () => {
    expect(
      calculateNetWorthBreakdown({
        bankBalance: 50,
        spotCryptoValue: 30,
        aaveSuppliedValue: 20,
        aaveBorrowedValue: 15,
      }),
    ).toEqual({
      bankBalance: 50,
      spotCryptoValue: 30,
      aaveSuppliedValue: 20,
      aaveBorrowedValue: 15,
      cryptoValue: 35,
      netWorth: 85,
    })
  })
})

describe('buildNetWorthAssetSegments', () => {
  it('builds percentages from positive asset buckets only', () => {
    expect(
      buildNetWorthAssetSegments({
        bankBalance: 50,
        spotCryptoValue: 30,
        aaveSuppliedValue: 20,
      }),
    ).toEqual([
      expect.objectContaining({ id: 'bank', percentage: 50 }),
      expect.objectContaining({ id: 'spot-crypto', percentage: 30 }),
      expect.objectContaining({ id: 'aave-supplied', percentage: 20 }),
    ])
  })

  it('ignores non-positive asset buckets', () => {
    expect(
      buildNetWorthAssetSegments({
        bankBalance: 0,
        spotCryptoValue: -5,
        aaveSuppliedValue: 10,
      }),
    ).toEqual([
      expect.objectContaining({ id: 'aave-supplied', percentage: 100 }),
    ])
  })
})

describe('getChartDomain', () => {
  it('preserves negative values in the chart domain', () => {
    const [min, max] = getChartDomain([-10, 30])

    expect(min).toBeLessThan(0)
    expect(max).toBeGreaterThan(30)
  })
})
