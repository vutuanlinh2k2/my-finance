import type { Tables } from '@/types/database'
import { supabase } from '@/lib/supabase'

export type TrackedProtocolAccountRow = Tables<'tracked_protocol_accounts'>

export interface TrackedProtocolAccountInput {
  protocol: 'aave-v3'
  network: 'ethereum'
  address: string
}

export async function fetchTrackedProtocolAccount(
  protocol: TrackedProtocolAccountInput['protocol'],
  network: TrackedProtocolAccountInput['network'],
): Promise<TrackedProtocolAccountRow | null> {
  const { data, error } = await supabase
    .from('tracked_protocol_accounts')
    .select('*')
    .eq('protocol', protocol)
    .eq('network', network)
    .maybeSingle()

  if (error) {
    throw new Error(
      `Failed to fetch tracked protocol account: ${error.message}`,
    )
  }

  return data
}

export async function upsertTrackedProtocolAccount(
  input: TrackedProtocolAccountInput,
): Promise<TrackedProtocolAccountRow> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('tracked_protocol_accounts')
    .upsert(
      {
        user_id: userData.user.id,
        protocol: input.protocol,
        network: input.network,
        address: input.address,
      },
      {
        onConflict: 'user_id,protocol,network',
      },
    )
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save tracked protocol account: ${error.message}`)
  }

  return data
}

export async function deleteTrackedProtocolAccount(
  protocol: TrackedProtocolAccountInput['protocol'],
  network: TrackedProtocolAccountInput['network'],
): Promise<void> {
  const { error } = await supabase
    .from('tracked_protocol_accounts')
    .delete()
    .eq('protocol', protocol)
    .eq('network', network)

  if (error) {
    throw new Error(
      `Failed to remove tracked protocol account: ${error.message}`,
    )
  }
}
