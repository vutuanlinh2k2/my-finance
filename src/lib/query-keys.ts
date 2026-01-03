import type { TagType } from '@/lib/api/tags'
import type { TransactionType } from '@/lib/reports/types'

export const queryKeys = {
  tags: {
    all: ['tags'] as const,
    byType: (type: TagType) => ['tags', type] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    byDate: (date: string) => ['transactions', 'date', date] as const,
    byMonth: (year: number, month: number) =>
      ['transactions', 'month', year, month] as const,
  },
  totals: {
    monthly: (year: number, month: number) =>
      ['totals', 'monthly', year, month] as const,
    daily: (year: number, month: number) =>
      ['totals', 'daily', year, month] as const,
  },
  subscriptions: {
    all: ['subscriptions'] as const,
  },
  exchangeRate: {
    usdVnd: ['exchangeRate', 'USD', 'VND'] as const,
  },
  reports: {
    byYear: (year: number, type: TransactionType) =>
      ['reports', 'yearly', year, type] as const,
  },
  // Crypto-related query keys
  crypto: {
    assets: {
      all: ['crypto', 'assets'] as const,
    },
    storages: {
      all: ['crypto', 'storages'] as const,
    },
    transactions: {
      all: ['crypto', 'transactions'] as const,
      filtered: (filters: Record<string, unknown>) =>
        ['crypto', 'transactions', filters] as const,
    },
    portfolioHistory: {
      byRange: (range: string) =>
        ['crypto', 'portfolio-history', range] as const,
    },
  },
  // CoinGecko API query keys
  coingecko: {
    asset: (id: string) => ['coingecko', 'asset', id] as const,
    prices: (ids: Array<string>) =>
      ['coingecko', 'prices', ids.sort().join(',')] as const,
    markets: (ids: Array<string>) =>
      ['coingecko', 'markets', ids.sort().join(',')] as const,
    marketData: (id: string, days: number | 'max') =>
      ['coingecko', 'market-data', id, days] as const,
    search: (query: string) => ['coingecko', 'search', query] as const,
  },
}
