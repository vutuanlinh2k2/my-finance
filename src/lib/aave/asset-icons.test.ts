import { describe, expect, it } from 'vitest'
import type { CoinGeckoMarketCoin } from '@/lib/api/coingecko'
import type { CryptoAsset } from '@/lib/crypto/types'
import type { AaveLnbSupplyRow } from '@/lib/aave/fetch-lnb'
import {
  getKnownAaveEthereumCoinGeckoIds,
  withResolvedLnbAssetIcons,
} from '@/lib/aave/asset-icons'

function createRow(overrides: Partial<AaveLnbSupplyRow> = {}): AaveLnbSupplyRow {
  return {
    id: 'supply-usdc',
    underlyingAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    name: 'USD Coin',
    symbol: 'USDC',
    iconUrl: null,
    suppliedAmount: 100,
    valueUsd: 100,
    supplyApy: 0.03,
    ...overrides,
  }
}

function createStoredAsset(
  overrides: Partial<CryptoAsset> = {},
): CryptoAsset {
  return {
    id: 'asset-1',
    userId: 'user-1',
    coingeckoId: 'usd-coin',
    name: 'USD Coin',
    symbol: 'USDC',
    iconUrl: 'https://assets.example/usdc-from-storage.png',
    createdAt: '2026-04-06T00:00:00.000Z',
    updatedAt: '2026-04-06T00:00:00.000Z',
    ...overrides,
  }
}

function createMarket(
  overrides: Partial<CoinGeckoMarketCoin> = {},
): CoinGeckoMarketCoin {
  return {
    id: 'usd-coin',
    symbol: 'usdc',
    name: 'USD Coin',
    image: 'https://assets.example/usdc-from-market.png',
    current_price: 1,
    market_cap: 1,
    market_cap_rank: 1,
    price_change_percentage_24h: 0,
    price_change_percentage_7d_in_currency: 0,
    price_change_percentage_30d_in_currency: 0,
    price_change_percentage_60d_in_currency: 0,
    price_change_percentage_1y_in_currency: 0,
    ...overrides,
  }
}

describe('getKnownAaveEthereumCoinGeckoIds', () => {
  it('returns known ids once for repeated Aave assets', () => {
    const ids = getKnownAaveEthereumCoinGeckoIds([
      createRow(),
      createRow({ id: 'supply-usdc-2' }),
      createRow({
        id: 'supply-cbbtc',
        underlyingAsset: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
        name: 'Coinbase Wrapped BTC',
        symbol: 'cbBTC',
      }),
    ])

    expect(ids).toEqual(['usd-coin', 'coinbase-wrapped-btc'])
  })
})

describe('withResolvedLnbAssetIcons', () => {
  it('prefers a stored asset icon when the asset already exists in the app', () => {
    const rows = withResolvedLnbAssetIcons(
      [createRow()],
      [createStoredAsset()],
      [createMarket()],
    )

    expect(rows[0]?.iconUrl).toBe('https://assets.example/usdc-from-storage.png')
  })

  it('falls back to CoinGecko market icons for known Aave assets', () => {
    const rows = withResolvedLnbAssetIcons([createRow()], [], [createMarket()])

    expect(rows[0]?.iconUrl).toBe('https://assets.example/usdc-from-market.png')
  })

  it('keeps null when no stored or known market icon exists', () => {
    const rows = withResolvedLnbAssetIcons(
      [
        createRow({
          underlyingAsset: '0x0000000000000000000000000000000000000001',
          symbol: 'MYST',
          name: 'Mystery Asset',
        }),
      ],
      [],
      [],
    )

    expect(rows[0]?.iconUrl).toBeNull()
  })
})
