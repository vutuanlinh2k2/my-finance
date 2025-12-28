export type TagType = 'expense' | 'income'

export interface Tag {
  id: string
  name: string
  emoji: string
  type: TagType
}

const TAGS_STORAGE_KEY = 'my-finance-tags'

// Default tags to start with
const DEFAULT_TAGS: Tag[] = [
  // Expense tags
  { id: '1', name: 'Rent & Mortgage', emoji: '🏠', type: 'expense' },
  { id: '2', name: 'Groceries', emoji: '🛒', type: 'expense' },
  { id: '3', name: 'Utilities', emoji: '⚡', type: 'expense' },
  { id: '4', name: 'Transportation', emoji: '🚗', type: 'expense' },
  { id: '5', name: 'Entertainment', emoji: '🎬', type: 'expense' },
  // Income tags
  { id: '6', name: 'Salary', emoji: '💰', type: 'income' },
  { id: '7', name: 'Freelance Work', emoji: '💼', type: 'income' },
  { id: '8', name: 'Investments', emoji: '📈', type: 'income' },
]

// Common emojis for quick selection
export const EXPENSE_EMOJIS = [
  '🏠', '🛒', '⚡', '🚗', '🎬', '🍔', '☕', '👕', '💊', '✈️',
  '📱', '🎮', '🏥', '📚', '🎁', '💇', '🐕', '🏋️', '🎵', '🔧',
]

export const INCOME_EMOJIS = [
  '💰', '💼', '📈', '🎁', '💵', '🏦', '💎', '🎯', '📊', '🏆',
]

export function getTags(): Tag[] {
  if (typeof window === 'undefined') return DEFAULT_TAGS

  const stored = localStorage.getItem(TAGS_STORAGE_KEY)
  if (!stored) {
    // Initialize with default tags
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(DEFAULT_TAGS))
    return DEFAULT_TAGS
  }

  try {
    return JSON.parse(stored)
  } catch {
    return DEFAULT_TAGS
  }
}

export function saveTags(tags: Tag[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags))
}

export function getTagsByType(type: TagType): Tag[] {
  return getTags().filter((tag) => tag.type === type)
}

export function generateTagId(): string {
  return `tag-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
