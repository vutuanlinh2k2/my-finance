import { describe, expect, it } from 'vitest'
import {
  formatApy,
  getHealthBarMetrics,
  getHealthStatus,
  isValidEvmAddress,
} from '@/lib/aave/lnb'

describe('isValidEvmAddress', () => {
  it('accepts hex ethereum addresses', () => {
    expect(isValidEvmAddress('0x50fc9731dAcE42CaA45D166bfF404bBB7464bF21')).toBe(
      true,
    )
  })

  it('rejects malformed addresses', () => {
    expect(isValidEvmAddress('0x1234')).toBe(false)
    expect(isValidEvmAddress('not-an-address')).toBe(false)
  })
})

describe('getHealthBarMetrics', () => {
  it('preserves provided liquidation and borrow values', () => {
    expect(
      getHealthBarMetrics({
        borrowedUsd: 95,
        borrowLimitUsd: 160,
        liquidationUsd: 171,
      }),
    ).toEqual({
      borrowedUsd: 95,
      borrowLimitUsd: 160,
      liquidationUsd: 171,
    })
  })

  it('clamps negative values', () => {
    expect(
      getHealthBarMetrics({
        borrowedUsd: -10,
        borrowLimitUsd: -4,
        liquidationUsd: -1,
      }),
    ).toEqual({
      borrowedUsd: 0,
      borrowLimitUsd: 0,
      liquidationUsd: 0,
    })
  })
})

describe('formatApy', () => {
  it('formats ratio values as percentages', () => {
    expect(formatApy(0.035256)).toBe('3.53%')
    expect(formatApy(0.000015)).toBe('0.00%')
  })
})

describe('getHealthStatus', () => {
  it('returns healthy labels for strong positions', () => {
    expect(getHealthStatus(1.79).label).toBe('Healthy')
  })

  it('returns no debt when there is no health factor', () => {
    expect(getHealthStatus(null).label).toBe('No debt')
  })
})
