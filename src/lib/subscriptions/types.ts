// Re-export the database-derived Subscription type with stricter field types
import type { Subscription as DbSubscription } from '@/lib/api/subscriptions'

export type SubscriptionCurrency = 'VND' | 'USD'
export type SubscriptionType = 'monthly' | 'yearly'

// Subscription type with narrowed currency and type fields for type safety
export type Subscription = Omit<DbSubscription, 'currency' | 'type'> & {
  currency: SubscriptionCurrency
  type: SubscriptionType
}

export interface CreateSubscriptionInput {
  title: string
  tag_id: string | null
  currency: SubscriptionCurrency
  amount: number
  type: SubscriptionType
  day_of_month: number
  month_of_year: number | null
  management_url: string | null
}

export interface UpdateSubscriptionInput
  extends Partial<CreateSubscriptionInput> {}

export interface SubscriptionSummary {
  avgMonthly: number
  totalMonthly: number
  totalYearly: number
}
