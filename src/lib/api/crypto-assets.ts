import type { Tables, TablesInsert } from '@/types/database'
import { supabase } from '@/lib/supabase'

export type CryptoAssetRow = Tables<'crypto_assets'>

export type CreateCryptoAssetInput = Pick<
  TablesInsert<'crypto_assets'>,
  'coingecko_id' | 'name' | 'symbol' | 'icon_url'
>

/**
 * Fetch all crypto assets for the current user
 */
export async function fetchCryptoAssets(): Promise<Array<CryptoAssetRow>> {
  const { data, error } = await supabase
    .from('crypto_assets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch crypto assets: ${error.message}`)
  }

  return data
}

/**
 * Create a new crypto asset
 */
export async function createCryptoAsset(
  input: CreateCryptoAssetInput,
): Promise<CryptoAssetRow> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('crypto_assets')
    .insert({
      user_id: userData.user.id,
      coingecko_id: input.coingecko_id,
      name: input.name,
      symbol: input.symbol,
      icon_url: input.icon_url,
    })
    .select()
    .single()

  if (error) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      throw new Error('This asset has already been added to your portfolio')
    }
    throw new Error(`Failed to create crypto asset: ${error.message}`)
  }

  return data
}

/**
 * Delete a crypto asset
 */
export async function deleteCryptoAsset(id: string): Promise<void> {
  const { error } = await supabase.from('crypto_assets').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete crypto asset: ${error.message}`)
  }
}
