import type { Tables, TablesInsert, TablesUpdate } from '@/types/database'
import { supabase } from '@/lib/supabase'

export type Subscription = Tables<'subscriptions'>
export type SubscriptionType = 'monthly' | 'yearly'
export type Currency = 'VND' | 'USD'

export type CreateSubscriptionInput = Pick<
  TablesInsert<'subscriptions'>,
  | 'title'
  | 'tag_id'
  | 'currency'
  | 'amount'
  | 'type'
  | 'day_of_month'
  | 'month_of_year'
  | 'management_url'
>

export type UpdateSubscriptionInput = Pick<
  TablesUpdate<'subscriptions'>,
  | 'title'
  | 'tag_id'
  | 'currency'
  | 'amount'
  | 'type'
  | 'day_of_month'
  | 'month_of_year'
  | 'management_url'
>

/**
 * Fetch all subscriptions for the current user
 */
export async function fetchSubscriptions(): Promise<Array<Subscription>> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch subscriptions: ${error.message}`)
  }

  return data
}

/**
 * Create a new subscription
 */
export async function createSubscription(
  input: CreateSubscriptionInput,
): Promise<Subscription> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userData.user.id,
      title: input.title,
      tag_id: input.tag_id,
      currency: input.currency,
      amount: input.amount,
      type: input.type,
      day_of_month: input.day_of_month,
      month_of_year: input.month_of_year,
      management_url: input.management_url,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create subscription: ${error.message}`)
  }

  return data
}

/**
 * Update an existing subscription
 */
export async function updateSubscription(
  id: string,
  updates: UpdateSubscriptionInput,
): Promise<Subscription> {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`)
  }

  return data
}

/**
 * Delete a subscription
 */
export async function deleteSubscription(id: string): Promise<void> {
  const { error } = await supabase.from('subscriptions').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete subscription: ${error.message}`)
  }
}
