export type SubscriptionCurrency = 'VND' | 'USD'
export type SubscriptionType = 'monthly' | 'yearly'

export interface Subscription {
  id: string
  title: string
  tag_id: string | null
  currency: SubscriptionCurrency
  amount: number
  type: SubscriptionType
  day_of_month: number
  month_of_year: number | null // Only for yearly subscriptions
  management_url: string | null
  created_at: string
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

export interface UpdateSubscriptionInput extends Partial<CreateSubscriptionInput> {}

export interface SubscriptionSummary {
  avgMonthly: number
  totalMonthly: number
  totalYearly: number
}
