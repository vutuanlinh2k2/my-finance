import { UiPoolDataProvider, ChainId } from 'npm:@aave/contract-helpers@1.37.1'
import { formatReserves, formatUserSummary } from 'npm:@aave/math-utils@1.37.1'
import { AaveV3Ethereum } from 'npm:@bgd-labs/aave-address-book@4.44.22'
import { ethers } from 'npm:ethers@5.8.0'

const ETHEREUM_RPC_URLS = [
  'https://ethereum-rpc.publicnode.com',
  'https://1rpc.io/eth',
  'https://rpc.ankr.com/eth',
  'https://eth.llamarpc.com',
] as const

const AAVE_ETHEREUM_ATOKEN_TO_COINGECKO_ID: Record<string, string> = {
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'aave-v3-weth',
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'aave-v3-wbtc',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'aave-v3-usdc',
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 'aave-v3-usdt',
  '0x6b175474e89094c44da98b954eedeac495271d0f': 'aave-v3-dai',
  '0x514910771af9ca656af840dff83e8264ecf986ca': 'aave-v3-link',
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'aave-v3-aave',
}

function normalizeAddress(value: string): string {
  return value.trim().toLowerCase()
}

function toNumber(value: bigint | number | string | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'bigint') return Number(value)

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function createEthereumProvider(): ethers.providers.FallbackProvider {
  const network = {
    chainId: 1,
    name: 'Ethereum Mainnet',
  }

  return new ethers.providers.FallbackProvider(
    ETHEREUM_RPC_URLS.map((url, index) => ({
      provider: new ethers.providers.StaticJsonRpcProvider(url, network),
      priority: index + 1,
      stallTimeout: 1_000,
      weight: 1,
    })),
    1,
  )
}

const poolDataProvider = new UiPoolDataProvider({
  uiPoolDataProviderAddress: AaveV3Ethereum.UI_POOL_DATA_PROVIDER,
  provider: createEthereumProvider(),
  chainId: ChainId.mainnet,
})

export interface AaveSnapshotSupply {
  coingeckoId: string
  valueUsd: number
}

export interface AaveSnapshotPosition {
  totalCollateralUsd: number
  totalBorrowedUsd: number
  suppliedAssets: Array<AaveSnapshotSupply>
}

export async function fetchAavePositionSnapshot(
  address: string,
): Promise<AaveSnapshotPosition> {
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

  const currentTimestamp = Math.floor(Date.now() / 1000)
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
    .filter((item) => toNumber(item.underlyingBalanceUSD) > 0)
    .map<AaveSnapshotSupply>((item) => ({
      coingeckoId:
        AAVE_ETHEREUM_ATOKEN_TO_COINGECKO_ID[
          normalizeAddress(item.underlyingAsset)
        ] ?? normalizeAddress(item.underlyingAsset),
      valueUsd: toNumber(item.underlyingBalanceUSD),
    }))

  return {
    totalCollateralUsd: toNumber(userSummary.totalLiquidityUSD),
    totalBorrowedUsd: toNumber(userSummary.totalBorrowsUSD),
    suppliedAssets,
  }
}
