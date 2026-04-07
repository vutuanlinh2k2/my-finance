import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type {AaveLnbBorrowRow, AaveLnbPositionSnapshot, AaveLnbSupplyRow} from '@/lib/aave/fetch-lnb';
import {
  getKnownAaveEthereumCoinGeckoIds,
  withResolvedLnbAssetIcons,
} from '@/lib/aave/asset-icons'
import {
  
  
  
  fetchAaveLnbSnapshot
} from '@/lib/aave/fetch-lnb'
import { useCryptoAssets } from '@/lib/hooks/use-crypto-assets'
import { useCryptoMarkets } from '@/lib/hooks/use-coingecko'
import { queryKeys } from '@/lib/query-keys'
import { isValidEvmAddress, normalizeAddress } from '@/lib/aave/lnb'

export type LnbSupplyRow = AaveLnbSupplyRow
export type LnbBorrowRow = AaveLnbBorrowRow
export type LnbPositionSnapshot = AaveLnbPositionSnapshot

export const EMPTY_POSITION: LnbPositionSnapshot = {
  healthFactor: null,
  totalCollateralUsd: 0,
  totalBorrowedUsd: 0,
  availableToBorrowUsd: 0,
  borrowLimitUsd: 0,
  liquidationThresholdUsd: null,
}

export function useAaveLnb(address: string | null) {
  const normalizedAddress = address ? normalizeAddress(address) : null
  const hasValidAddress =
    !!normalizedAddress && isValidEvmAddress(normalizedAddress)
  const cryptoAssets = useCryptoAssets()

  const query = useQuery({
    queryKey: queryKeys.crypto.aave.lnb(normalizedAddress),
    queryFn: async () => fetchAaveLnbSnapshot(normalizedAddress!),
    enabled: hasValidAddress,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
  })

  const knownCoinGeckoIds = useMemo(() => {
    const rows = [
      ...(query.data?.suppliedAssets ?? []),
      ...(query.data?.borrowedAssets ?? []),
    ]

    return getKnownAaveEthereumCoinGeckoIds(rows)
  }, [query.data])

  const marketIcons = useCryptoMarkets(
    knownCoinGeckoIds,
    hasValidAddress && knownCoinGeckoIds.length > 0,
  )

  const suppliedAssets = useMemo(() => {
    return withResolvedLnbAssetIcons(
      query.data?.suppliedAssets ?? [],
      cryptoAssets.data ?? [],
      marketIcons.data ?? [],
    )
  }, [cryptoAssets.data, marketIcons.data, query.data?.suppliedAssets])

  const borrowedAssets = useMemo(() => {
    return withResolvedLnbAssetIcons(
      query.data?.borrowedAssets ?? [],
      cryptoAssets.data ?? [],
      marketIcons.data ?? [],
    )
  }, [cryptoAssets.data, marketIcons.data, query.data?.borrowedAssets])

  return {
    hasValidAddress,
    position: query.data?.position ?? EMPTY_POSITION,
    suppliedAssets,
    borrowedAssets,
    isLoading: hasValidAddress && query.isPending,
    error: query.error ?? cryptoAssets.error ?? marketIcons.error ?? null,
  }
}
