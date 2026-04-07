import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchAaveTransactionHistory } from '@/lib/aave/history'

describe('fetchAaveTransactionHistory', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('maps paginated Aave API history into unified transaction rows', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            value: {
              items: [
                {
                  __typename: 'UserSupplyTransaction',
                  amount: {
                    amount: {
                      value: '1.25',
                    },
                  },
                  blockExplorerUrl:
                    'https://etherscan.io/tx/0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                  reserve: {
                    market: {
                      name: 'AaveV3Ethereum',
                      chain: {
                        name: 'Ethereum',
                        chainId: 1,
                      },
                    },
                    underlyingToken: {
                      address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                      imageUrl: 'https://assets.example/usdc.png',
                      name: 'USD Coin',
                      symbol: 'USDC',
                    },
                  },
                  timestamp: '2026-04-07T01:02:03.000Z',
                  txHash:
                    '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                },
              ],
              pageInfo: {
                next: 'cursor-2',
              },
            },
          },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            value: {
              items: [
                {
                  __typename: 'UserRepayTransaction',
                  amount: {
                    amount: {
                      value: '0.75',
                    },
                  },
                  blockExplorerUrl:
                    'https://etherscan.io/tx/0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
                  reserve: {
                    market: {
                      name: 'AaveV3Ethereum',
                      chain: {
                        name: 'Ethereum',
                        chainId: 1,
                      },
                    },
                    underlyingToken: {
                      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
                      imageUrl: 'https://assets.example/dai.png',
                      name: 'Dai Stablecoin',
                      symbol: 'DAI',
                    },
                  },
                  timestamp: '2026-04-06T01:02:03.000Z',
                  txHash:
                    '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
                },
              ],
              pageInfo: {
                next: null,
              },
            },
          },
        }),
      } as Response)

    const rows = await fetchAaveTransactionHistory(
      ' 0x1234567890abcdef1234567890abcdef12345678 ',
    )

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://api.v3.aave.com/graphql',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"cursor":null'),
      }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.v3.aave.com/graphql',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"cursor":"cursor-2"'),
      }),
    )

    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({
      source: 'aave',
      type: 'deposit',
      date: '2026-04-07',
      txId:
        '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      txExplorerUrl:
        'https://etherscan.io/tx/0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      amount: 1.25,
      protocol: 'Aave V3',
      network: 'Ethereum',
      asset: {
        id: 'aave-v3-usdc',
        name: 'USD Coin',
        symbol: 'USDC',
        iconUrl: 'https://assets.example/usdc.png',
      },
    })
    expect(rows[1]).toMatchObject({
      source: 'aave',
      type: 'repay',
      date: '2026-04-06',
      amount: 0.75,
      asset: {
        id: 'aave-v3-dai',
        symbol: 'DAI',
      },
    })
  })
})
