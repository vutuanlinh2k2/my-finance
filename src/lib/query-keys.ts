import type { TagType } from '@/lib/api/tags'

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
}
