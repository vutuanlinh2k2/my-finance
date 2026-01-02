import type { Tables, TablesInsert, TablesUpdate } from '@/types/database'
import { supabase } from '@/lib/supabase'

export type CryptoStorageRow = Tables<'crypto_storages'>

export type CreateCryptoStorageInput = Pick<
  TablesInsert<'crypto_storages'>,
  'type' | 'name' | 'address' | 'explorer_url'
>

export type UpdateCryptoStorageInput = Pick<
  TablesUpdate<'crypto_storages'>,
  'name' | 'address' | 'explorer_url'
>

/**
 * Fetch all crypto storages for the current user
 */
export async function fetchCryptoStorages(): Promise<Array<CryptoStorageRow>> {
  const { data, error } = await supabase
    .from('crypto_storages')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch crypto storages: ${error.message}`)
  }

  return data
}

/**
 * Create a new crypto storage
 */
export async function createCryptoStorage(
  input: CreateCryptoStorageInput,
): Promise<CryptoStorageRow> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('crypto_storages')
    .insert({
      user_id: userData.user.id,
      type: input.type,
      name: input.name,
      address: input.address ?? null,
      explorer_url: input.explorer_url ?? null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create crypto storage: ${error.message}`)
  }

  return data
}

/**
 * Update an existing crypto storage
 */
export async function updateCryptoStorage(
  id: string,
  input: UpdateCryptoStorageInput,
): Promise<CryptoStorageRow> {
  const { data, error } = await supabase
    .from('crypto_storages')
    .update({
      name: input.name,
      address: input.address,
      explorer_url: input.explorer_url,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update crypto storage: ${error.message}`)
  }

  return data
}

/**
 * Delete a crypto storage
 */
export async function deleteCryptoStorage(id: string): Promise<void> {
  const { error } = await supabase.from('crypto_storages').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete crypto storage: ${error.message}`)
  }
}
