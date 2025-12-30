import type {
  CreateSubscriptionInput,
  Subscription,
  UpdateSubscriptionInput,
} from './types'

const STORAGE_KEY = 'my-finance:subscriptions'

// Mock exchange rate (USD to VND)
export const MOCK_EXCHANGE_RATE = 24500

function generateId(): string {
  return crypto.randomUUID()
}

export function getSubscriptions(): Array<Subscription> {
  if (typeof window === 'undefined') return []

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []

  try {
    return JSON.parse(stored) as Array<Subscription>
  } catch {
    return []
  }
}

function saveSubscriptions(subscriptions: Array<Subscription>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions))
}

export function addSubscription(input: CreateSubscriptionInput): Subscription {
  const subscriptions = getSubscriptions()

  const newSubscription: Subscription = {
    ...input,
    id: generateId(),
    created_at: new Date().toISOString(),
  }

  subscriptions.push(newSubscription)
  saveSubscriptions(subscriptions)

  return newSubscription
}

export function updateSubscription(
  id: string,
  updates: UpdateSubscriptionInput,
): Subscription | null {
  const subscriptions = getSubscriptions()
  const index = subscriptions.findIndex((s) => s.id === id)

  if (index === -1) return null

  const updated: Subscription = {
    ...subscriptions[index],
    ...updates,
  }

  subscriptions[index] = updated
  saveSubscriptions(subscriptions)

  return updated
}

export function deleteSubscription(id: string): boolean {
  const subscriptions = getSubscriptions()
  const filtered = subscriptions.filter((s) => s.id !== id)

  if (filtered.length === subscriptions.length) return false

  saveSubscriptions(filtered)
  return true
}

export function clearAllSubscriptions(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
