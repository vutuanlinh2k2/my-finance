import type { CoinGeckoMarketCoin } from '@/lib/api/coingecko'
import type { CryptoAsset } from '@/lib/crypto/types'
import type { AaveLnbBorrowRow, AaveLnbSupplyRow } from '@/lib/aave/fetch-lnb'

const AAVE_ETHEREUM_TOKEN_TO_COINGECKO_ID: Record<string, string> = {
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'ethereum',
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'wrapped-bitcoin',
  '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf': 'coinbase-wrapped-btc',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'usd-coin',
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 'tether',
  '0x6b175474e89094c44da98b954eedeac495271d0f': 'dai',
  '0xe343167631d89b6ffc58b88d6b7fb0228795491d': 'global-dollar',
  '0x40d16fc0246a04c65b1d5b47eaa107f300e9b2b': 'gho-token',
  '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': 'wrapped-steth',
  '0xae78736cd615f374d3085123a210448e74fc6393': 'rocket-pool-eth',
  '0xbe9895146f7af43049ca1c1ae358b0541ea49704': 'coinbase-wrapped-staked-eth',
  '0x514910771af9ca656af840dff83e8264ecf986ca': 'chainlink',
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'aave',
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'uniswap',
  '0xd533a949740bb3306d119cc777fa900ba034cd52': 'curve-dao-token',
  '0xba100000625a3754423978a60c9317c58a424e3d': 'balancer',
  '0x5a98fcbea516cf06857215779fd812ca3bef1b32': 'lido-dao',
  '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': 'maker',
  '0x853d955acef822db058eb8505911ed77f175b99e': 'frax',
  '0x5f98805a4e8be255a32880fdec7f6728c6568ba0': 'liquity-usd',
}

type LnbAssetRow = AaveLnbSupplyRow | AaveLnbBorrowRow

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function buildStoredAssetIconIndex(
  assets: Array<CryptoAsset>,
): Map<string, string> {
  const index = new Map<string, string>()

  for (const asset of assets) {
    if (!asset.iconUrl) continue

    index.set(`coingecko:${normalize(asset.coingeckoId)}`, asset.iconUrl)
    index.set(`symbol:${normalize(asset.symbol)}`, asset.iconUrl)
    index.set(`name:${normalize(asset.name)}`, asset.iconUrl)
    index.set(
      `symbol-name:${normalize(asset.symbol)}:${normalize(asset.name)}`,
      asset.iconUrl,
    )
  }

  return index
}

function buildMarketIconIndex(
  markets: Array<CoinGeckoMarketCoin>,
): Map<string, string> {
  return new Map(
    markets
      .filter((market) => !!market.image)
      .map((market) => [`coingecko:${normalize(market.id)}`, market.image]),
  )
}

function getKnownCoingeckoId(underlyingAsset: string): string | null {
  return AAVE_ETHEREUM_TOKEN_TO_COINGECKO_ID[normalize(underlyingAsset)] ?? null
}

function resolveAssetIconUrl(
  row: LnbAssetRow,
  storedAssetIcons: Map<string, string>,
  marketIcons: Map<string, string>,
): string | null {
  const coingeckoId = getKnownCoingeckoId(row.underlyingAsset)

  if (coingeckoId) {
    const storedByCoingecko = storedAssetIcons.get(
      `coingecko:${normalize(coingeckoId)}`,
    )
    if (storedByCoingecko) return storedByCoingecko
  }

  const storedByExactAsset = storedAssetIcons.get(
    `symbol-name:${normalize(row.symbol)}:${normalize(row.name)}`,
  )
  if (storedByExactAsset) return storedByExactAsset

  const storedBySymbol = storedAssetIcons.get(`symbol:${normalize(row.symbol)}`)
  if (storedBySymbol) return storedBySymbol

  const storedByName = storedAssetIcons.get(`name:${normalize(row.name)}`)
  if (storedByName) return storedByName

  if (!coingeckoId) return null

  return marketIcons.get(`coingecko:${normalize(coingeckoId)}`) ?? null
}

export function getKnownAaveEthereumCoinGeckoIds(
  rows: Array<LnbAssetRow>,
): Array<string> {
  return Array.from(
    new Set(
      rows
        .map((row) => getKnownCoingeckoId(row.underlyingAsset))
        .filter((value): value is string => !!value),
    ),
  )
}

export function withResolvedLnbAssetIcons<T extends LnbAssetRow>(
  rows: Array<T>,
  storedAssets: Array<CryptoAsset>,
  markets: Array<CoinGeckoMarketCoin>,
): Array<T> {
  const storedAssetIcons = buildStoredAssetIconIndex(storedAssets)
  const marketIcons = buildMarketIconIndex(markets)

  return rows.map((row) => ({
    ...row,
    iconUrl: resolveAssetIconUrl(row, storedAssetIcons, marketIcons),
  }))
}
