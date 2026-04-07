import { formatReserves, formatUserSummary } from '@aave/math-utils'
import { AaveV3Ethereum } from '@bgd-labs/aave-address-book'
import { ethers } from 'ethers'
import { toNumber } from '@/lib/aave/lnb'
import {
  getCurrentTimestamp,
  aaveEthereumPoolDataProvider as poolDataProvider,
} from '@/lib/aave/client'

export interface AaveLnbSupplyRow {
  id: string
  underlyingAsset: string
  name: string
  symbol: string
  iconUrl: string | null
  suppliedAmount: number
  valueUsd: number
  supplyApy: number
}

export interface AaveLnbBorrowRow {
  id: string
  underlyingAsset: string
  name: string
  symbol: string
  iconUrl: string | null
  borrowedAmount: number
  debtValueUsd: number
  borrowApy: number
}

export interface AaveLnbPositionSnapshot {
  healthFactor: number | null
  totalCollateralUsd: number
  totalBorrowedUsd: number
  availableToBorrowUsd: number
  borrowLimitUsd: number
  liquidationThresholdUsd: number | null
}

export interface AaveLnbSnapshot {
  position: AaveLnbPositionSnapshot
  suppliedAssets: Array<AaveLnbSupplyRow>
  borrowedAssets: Array<AaveLnbBorrowRow>
}

const EMPTY_SNAPSHOT: AaveLnbSnapshot = {
  position: {
    healthFactor: null,
    totalCollateralUsd: 0,
    totalBorrowedUsd: 0,
    availableToBorrowUsd: 0,
    borrowLimitUsd: 0,
    liquidationThresholdUsd: null,
  },
  suppliedAssets: [],
  borrowedAssets: [],
}

function buildPosition(summary: {
  totalLiquidityUSD: string
  totalBorrowsUSD: string
  availableBorrowsUSD: string
  currentLiquidationThreshold: string
  healthFactor: string
}): AaveLnbPositionSnapshot {
  const totalCollateralUsd = toNumber(summary.totalLiquidityUSD)
  const totalBorrowedUsd = toNumber(summary.totalBorrowsUSD)
  const availableToBorrowUsd = toNumber(summary.availableBorrowsUSD)
  const liquidationThreshold = toNumber(summary.currentLiquidationThreshold)
  const healthFactorValue = toNumber(summary.healthFactor)

  return {
    healthFactor: totalBorrowedUsd > 0 ? healthFactorValue : null,
    totalCollateralUsd,
    totalBorrowedUsd,
    availableToBorrowUsd,
    borrowLimitUsd: totalBorrowedUsd + availableToBorrowUsd,
    liquidationThresholdUsd:
      totalCollateralUsd > 0 ? totalCollateralUsd * liquidationThreshold : null,
  }
}

export async function fetchAaveLnbSnapshot(
  address: string,
): Promise<AaveLnbSnapshot> {
  const user = ethers.utils.getAddress(address)
  const [reserves, userReserves] = await Promise.all([
    poolDataProvider.getReservesHumanized({
      lendingPoolAddressProvider: AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
    }),
    poolDataProvider.getUserReservesHumanized({
      lendingPoolAddressProvider: AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
      user,
    }),
  ])

  const currentTimestamp = getCurrentTimestamp()
  const formattedReserves = formatReserves({
    reserves: reserves.reservesData,
    currentTimestamp,
    marketReferenceCurrencyDecimals:
      reserves.baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd:
      reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
  })

  const userSummary = formatUserSummary({
    currentTimestamp,
    marketReferencePriceInUsd:
      reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    marketReferenceCurrencyDecimals:
      reserves.baseCurrencyData.marketReferenceCurrencyDecimals,
    userReserves: userReserves.userReserves,
    formattedReserves,
    userEmodeCategoryId: userReserves.userEmodeCategoryId,
  })

  const suppliedAssets = userSummary.userReservesData
    .filter((item) => toNumber(item.underlyingBalance) > 0)
    .map<AaveLnbSupplyRow>((item) => ({
      id: `supply-${item.underlyingAsset}`,
      underlyingAsset: item.underlyingAsset.toLowerCase(),
      name: item.reserve.name,
      symbol: item.reserve.symbol,
      iconUrl: null,
      suppliedAmount: toNumber(item.underlyingBalance),
      valueUsd: toNumber(item.underlyingBalanceUSD),
      supplyApy: toNumber(item.reserve.supplyAPY),
    }))
    .sort((a, b) => b.valueUsd - a.valueUsd)

  const borrowedAssets = userSummary.userReservesData
    .filter((item) => toNumber(item.totalBorrows) > 0)
    .map<AaveLnbBorrowRow>((item) => ({
      id: `borrow-${item.underlyingAsset}`,
      underlyingAsset: item.underlyingAsset.toLowerCase(),
      name: item.reserve.name,
      symbol: item.reserve.symbol,
      iconUrl: null,
      borrowedAmount: toNumber(item.totalBorrows),
      debtValueUsd: toNumber(item.totalBorrowsUSD),
      borrowApy: toNumber(item.reserve.variableBorrowAPY),
    }))
    .sort((a, b) => b.debtValueUsd - a.debtValueUsd)

  if (!suppliedAssets.length && !borrowedAssets.length) {
    return EMPTY_SNAPSHOT
  }

  return {
    position: buildPosition(userSummary),
    suppliedAssets,
    borrowedAssets,
  }
}
