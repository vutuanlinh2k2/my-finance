import { truncateAddress } from '@/lib/crypto/utils'

export const AAVE_LNB_ADDRESS_STORAGE_KEY = 'crypto:lnb:aave-address:ethereum-v3'

const EVM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/

export interface LnbHealthBarMetrics {
  borrowedUsd: number
  borrowLimitUsd: number
  liquidationUsd: number | null
}

export function normalizeAddress(value: string): string {
  return value.trim()
}

export function isValidEvmAddress(value: string): boolean {
  return EVM_ADDRESS_PATTERN.test(normalizeAddress(value))
}

export function loadStoredLnbAddress(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = window.localStorage.getItem(AAVE_LNB_ADDRESS_STORAGE_KEY)
    if (!stored) return null

    const normalized = normalizeAddress(stored)
    return isValidEvmAddress(normalized) ? normalized : null
  } catch {
    return null
  }
}

export function saveStoredLnbAddress(address: string): string {
  const normalized = normalizeAddress(address)

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AAVE_LNB_ADDRESS_STORAGE_KEY, normalized)
  }

  return normalized
}

export function removeStoredLnbAddress(): void {
  if (typeof window === 'undefined') return

  window.localStorage.removeItem(AAVE_LNB_ADDRESS_STORAGE_KEY)
}

export function toNumber(
  value: bigint | number | string | null | undefined,
): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'bigint') return Number(value)

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatUsdDetailed(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value >= 100 ? 0 : 2,
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value)
}

export function formatTokenAmount(value: number): string {
  if (value === 0) return '0'

  if (Math.abs(value) >= 1) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    })
  }

  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  })
}

export function formatApy(value: number): string {
  return `${(value * 100).toFixed(2)}%`
}

export function getHealthStatus(healthFactor: number | null): {
  label: string
  toneClass: string
  badgeClass: string
} {
  if (healthFactor === null || healthFactor === 0) {
    return {
      label: 'No debt',
      toneClass: 'text-muted-foreground',
      badgeClass: 'bg-muted text-muted-foreground',
    }
  }

  if (healthFactor < 1.1) {
    return {
      label: 'At risk',
      toneClass: 'text-rose-600',
      badgeClass: 'bg-rose-100 text-rose-700',
    }
  }

  if (healthFactor < 1.5) {
    return {
      label: 'Caution',
      toneClass: 'text-amber-600',
      badgeClass: 'bg-amber-100 text-amber-700',
    }
  }

  return {
    label: 'Healthy',
    toneClass: 'text-emerald-600',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  }
}

export function getHealthBarMetrics(params: {
  borrowedUsd: number
  borrowLimitUsd: number
  liquidationUsd: number | null
}): LnbHealthBarMetrics {
  const borrowedUsd = Math.max(0, params.borrowedUsd)
  const borrowLimitUsd = Math.max(0, params.borrowLimitUsd)
  const liquidationUsd =
    params.liquidationUsd === null ? null : Math.max(0, params.liquidationUsd)

  return {
    borrowedUsd,
    borrowLimitUsd,
    liquidationUsd,
  }
}

export function getRelativePosition(
  value: number | null,
  maxValue: number,
): number | null {
  if (value === null) return null
  if (maxValue <= 0) return 0

  return Math.min(100, Math.max(0, (value / maxValue) * 100))
}

export function formatStoredAddress(address: string | null): string {
  return address ? truncateAddress(address) : 'Add Address'
}
