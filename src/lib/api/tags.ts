import type { Tables, TablesInsert, TablesUpdate } from '@/types/database'
import { supabase } from '@/lib/supabase'

export type Tag = Tables<'tags'>
export type TagType = 'expense' | 'income'
export type CreateTagInput = Pick<
  TablesInsert<'tags'>,
  'name' | 'emoji' | 'type'
>
export type UpdateTagInput = Pick<TablesUpdate<'tags'>, 'name' | 'emoji'>

// Default tags to create for existing users who don't have any
const DEFAULT_TAGS: Array<Omit<CreateTagInput, 'user_id'>> = [
  { name: 'Rent & Mortgage', emoji: '🏠', type: 'expense' },
  { name: 'Groceries', emoji: '🛒', type: 'expense' },
  { name: 'Utilities', emoji: '⚡', type: 'expense' },
  { name: 'Transportation', emoji: '🚗', type: 'expense' },
  { name: 'Entertainment', emoji: '🎬', type: 'expense' },
  { name: 'Salary', emoji: '💰', type: 'income' },
  { name: 'Freelance Work', emoji: '💼', type: 'income' },
  { name: 'Investments', emoji: '📈', type: 'income' },
]

/**
 * Fetch all tags for the current user
 */
export async function fetchTags(): Promise<Array<Tag>> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`)
  }

  return data
}

/**
 * Fetch tags filtered by type (expense or income)
 */
export async function fetchTagsByType(type: TagType): Promise<Array<Tag>> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('type', type)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch tags by type: ${error.message}`)
  }

  return data
}

/**
 * Create a new tag
 */
export async function createTag(input: CreateTagInput): Promise<Tag> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('tags')
    .insert({
      user_id: userData.user.id,
      name: input.name,
      emoji: input.emoji,
      type: input.type,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create tag: ${error.message}`)
  }

  return data
}

/**
 * Update an existing tag
 */
export async function updateTag(
  id: string,
  updates: UpdateTagInput,
): Promise<Tag> {
  const { data, error } = await supabase
    .from('tags')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update tag: ${error.message}`)
  }

  return data
}

/**
 * Delete a tag
 */
export async function deleteTag(id: string): Promise<void> {
  const { error } = await supabase.from('tags').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete tag: ${error.message}`)
  }
}

// Cache key for tracking if default tags have been checked for this user
const DEFAULT_TAGS_CHECKED_KEY = 'my-finance:default-tags-checked'

/**
 * Ensure default tags exist for the current user.
 * This is a fallback for users created before the trigger was added.
 * Uses localStorage to cache the check and avoid repeated DB queries.
 */
export async function ensureDefaultTags(): Promise<void> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return
  }

  // Check if we've already verified tags for this user in this session
  const cacheKey = `${DEFAULT_TAGS_CHECKED_KEY}:${userData.user.id}`
  if (typeof window !== 'undefined' && localStorage.getItem(cacheKey)) {
    return
  }

  // Check if user has any tags
  const { data: existingTags } = await supabase
    .from('tags')
    .select('id')
    .limit(1)

  // If no tags exist, create defaults
  if (!existingTags || existingTags.length === 0) {
    const tagsToInsert = DEFAULT_TAGS.map((tag) => ({
      ...tag,
      user_id: userData.user.id,
    }))

    await supabase.from('tags').insert(tagsToInsert)
  }

  // Mark as checked for this user
  if (typeof window !== 'undefined') {
    localStorage.setItem(cacheKey, 'true')
  }
}
