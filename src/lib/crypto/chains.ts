export interface BlockchainExplorer {
  id: string
  name: string
  urlPattern: string
}

export const BLOCKCHAIN_EXPLORERS: Array<BlockchainExplorer> = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    urlPattern: 'https://etherscan.io/tx/{hash}',
  },
  {
    id: 'solana',
    name: 'Solana',
    urlPattern: 'https://solscan.io/tx/{hash}',
  },
  {
    id: 'sui',
    name: 'Sui',
    urlPattern: 'https://suiscan.xyz/mainnet/tx/{hash}',
  },
  {
    id: 'base',
    name: 'Base',
    urlPattern: 'https://basescan.org/tx/{hash}',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    urlPattern: 'https://arbiscan.io/tx/{hash}',
  },
  {
    id: 'osmosis',
    name: 'Osmosis (IBC)',
    urlPattern: 'https://www.mintscan.io/osmosis/tx/{hash}',
  },
]

export function buildExplorerUrl(
  chainId: string,
  txHash: string,
): string | null {
  const chain = BLOCKCHAIN_EXPLORERS.find((c) => c.id === chainId)
  if (!chain || !txHash.trim()) return null
  return chain.urlPattern.replace('{hash}', txHash.trim())
}

export function detectChainFromUrl(
  url: string,
): { chainId: string; txHash: string } | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  for (const chain of BLOCKCHAIN_EXPLORERS) {
    const escaped = chain.urlPattern
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace('\\{hash\\}', '(.+)')
    const regex = new RegExp(`^${escaped}$`)
    const match = trimmed.match(regex)
    if (match) {
      return { chainId: chain.id, txHash: match[1] }
    }
  }
  return null
}
