import { AaveV3Ethereum } from '@bgd-labs/aave-address-book'
import {
  getKnownAaveEthereumATokenCoinGeckoId,
  getKnownAaveEthereumCoinGeckoId,
} from '@/lib/aave/asset-icons'
import { normalizeAddress } from '@/lib/aave/lnb'
import type { AaveTransaction } from '@/lib/crypto/types'

type AaveHistoryType = AaveTransaction['type']

interface AaveHistoryPageInfo {
  next: string | null
}

interface AaveHistoryTokenAmount {
  amount: {
    value: string
  }
}

interface AaveHistoryReserve {
  market: {
    name: string
    chain: {
      name: string
      chainId: number
    }
  }
  underlyingToken: {
    address: string
    imageUrl: string | null
    name: string
    symbol: string
  }
}

interface AaveHistoryGraphqlItem {
  __typename:
    | 'UserSupplyTransaction'
    | 'UserWithdrawTransaction'
    | 'UserBorrowTransaction'
    | 'UserRepayTransaction'
  amount: AaveHistoryTokenAmount
  blockExplorerUrl: string | null
  reserve: AaveHistoryReserve
  timestamp: string
  txHash: string
}

interface AaveHistoryResponse {
  data?: {
    value?: {
      items?: Array<AaveHistoryGraphqlItem>
      pageInfo?: AaveHistoryPageInfo
    }
  }
  errors?: Array<{
    message?: string
  }>
}

const AAVE_GRAPHQL_ENDPOINT = 'https://api.v3.aave.com/graphql'
const AAVE_HISTORY_PAGE_SIZE = 'FIFTY'
const AAVE_HISTORY_QUERY = `
  query UserTransactionHistory($request: UserTransactionHistoryRequest!) {
    value: userTransactionHistory(request: $request) {
      items {
        __typename
        ... on UserSupplyTransaction {
          amount {
            amount {
              value
            }
          }
          reserve {
            market {
              name
              chain {
                name
                chainId
              }
            }
            underlyingToken {
              address
              imageUrl
              name
              symbol
            }
          }
          blockExplorerUrl
          txHash
          timestamp
        }
        ... on UserWithdrawTransaction {
          amount {
            amount {
              value
            }
          }
          reserve {
            market {
              name
              chain {
                name
                chainId
              }
            }
            underlyingToken {
              address
              imageUrl
              name
              symbol
            }
          }
          blockExplorerUrl
          txHash
          timestamp
        }
        ... on UserBorrowTransaction {
          amount {
            amount {
              value
            }
          }
          reserve {
            market {
              name
              chain {
                name
                chainId
              }
            }
            underlyingToken {
              address
              imageUrl
              name
              symbol
            }
          }
          blockExplorerUrl
          txHash
          timestamp
        }
        ... on UserRepayTransaction {
          amount {
            amount {
              value
            }
          }
          reserve {
            market {
              name
              chain {
                name
                chainId
              }
            }
            underlyingToken {
              address
              imageUrl
              name
              symbol
            }
          }
          blockExplorerUrl
          txHash
          timestamp
        }
      }
      pageInfo {
        next
      }
    }
  }
`

function toDateString(timestamp: Date): string {
  return timestamp.toISOString().slice(0, 10)
}

function toHistoryType(
  item: AaveHistoryGraphqlItem,
): AaveHistoryType | null {
  switch (item.__typename) {
    case 'UserSupplyTransaction':
      return 'deposit'
    case 'UserWithdrawTransaction':
      return 'withdraw'
    case 'UserBorrowTransaction':
      return 'borrow'
    case 'UserRepayTransaction':
      return 'repay'
    default:
      return null
  }
}

function toSortTimestamp(timestamp: Date, txHash: string): number {
  const hashSuffix = Number.parseInt(txHash.slice(-6), 16)
  const tieBreaker = Number.isNaN(hashSuffix) ? 0 : hashSuffix / 1_000_000
  return timestamp.getTime() + tieBreaker
}

async function fetchHistoryPage(address: string, cursor: string | null) {
  const response = await fetch(AAVE_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      operationName: 'UserTransactionHistory',
      query: AAVE_HISTORY_QUERY,
      variables: {
        request: {
          chainId: 1,
          cursor,
          market: AaveV3Ethereum.POOL,
          orderBy: { date: 'DESC' },
          pageSize: AAVE_HISTORY_PAGE_SIZE,
          user: address,
        },
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Aave history request failed with ${response.status}`)
  }

  const payload = (await response.json()) as AaveHistoryResponse

  if (payload.errors?.length) {
    const message = payload.errors[0]?.message ?? 'Unknown Aave API error'
    throw new Error(message)
  }

  return {
    items: payload.data?.value?.items ?? [],
    nextCursor: payload.data?.value?.pageInfo?.next ?? null,
  }
}

function toAaveTransaction(item: AaveHistoryGraphqlItem): AaveTransaction | null {
  const type = toHistoryType(item)
  if (!type) {
    return null
  }

  const timestamp = new Date(item.timestamp)
  if (Number.isNaN(timestamp.getTime())) {
    return null
  }

  const underlyingAddress = item.reserve.underlyingToken.address.toLowerCase()
  const aTokenCoingeckoId =
    getKnownAaveEthereumATokenCoinGeckoId(underlyingAddress)
  const underlyingCoingeckoId =
    getKnownAaveEthereumCoinGeckoId(underlyingAddress)
  const amount = Number(item.amount.amount.value)

  return {
    id: `aave:${type}:${item.txHash}:${underlyingAddress}`,
    source: 'aave',
    type,
    date: toDateString(timestamp),
    sortTimestamp: toSortTimestamp(timestamp, item.txHash),
    txId: item.txHash,
    txExplorerUrl: item.blockExplorerUrl,
    amount: Number.isFinite(amount) ? amount : 0,
    protocol: 'Aave V3',
    network: 'Ethereum',
    asset: {
      id:
        aTokenCoingeckoId ??
        underlyingCoingeckoId ??
        `aave:${underlyingAddress}`,
      name: item.reserve.underlyingToken.name,
      symbol: item.reserve.underlyingToken.symbol,
      iconUrl: item.reserve.underlyingToken.imageUrl,
    },
  }
}

export async function fetchAaveTransactionHistory(
  address: string,
): Promise<Array<AaveTransaction>> {
  const normalizedAddress = normalizeAddress(address).toLowerCase()
  const allItems: Array<AaveHistoryGraphqlItem> = []
  let cursor: string | null = null

  do {
    const page = await fetchHistoryPage(normalizedAddress, cursor)
    allItems.push(...page.items)
    cursor = page.nextCursor
  } while (cursor)

  return allItems
    .map(toAaveTransaction)
    .filter((item): item is AaveTransaction => !!item)
    .sort((a, b) => b.sortTimestamp - a.sortTimestamp)
}
