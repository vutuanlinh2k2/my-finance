// Edge Function: Snapshot Net Worth
// Creates daily snapshots of each user's total net worth (bank balance + crypto)
// Scheduled to run daily at 00:15 UTC via Supabase cron

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'

// Types
interface UserTotals {
  userId: string
  bankBalance: number
}

interface CryptoSnapshot {
  user_id: string
  total_value_usd: number
}

interface SnapshotResult {
  userId: string
  bankBalance: number
  cryptoValueVnd: number
  totalNetWorth: number
  success: boolean
  error?: string
}

/**
 * Fetch bank balance for all users (income - expenses)
 * Uses database RPC function for efficient aggregation
 */
async function fetchAllUserBankBalances(
  supabase: SupabaseClient,
): Promise<Map<string, number>> {
  const balances = new Map<string, number>()

  // Use RPC function for efficient database-level aggregation
  const { data, error } = await supabase.rpc('get_all_users_bank_balances')

  if (error) {
    throw new Error(`Failed to fetch bank balances: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return balances
  }

  for (const row of data) {
    balances.set(row.user_id, row.bank_balance)
  }

  return balances
}

/**
 * Fetch latest crypto portfolio snapshots for all users
 * Uses today's crypto snapshot if available, otherwise the most recent one
 */
async function fetchLatestCryptoSnapshots(
  supabase: SupabaseClient,
  snapshotDate: string,
): Promise<Map<string, number>> {
  const cryptoValues = new Map<string, number>()

  // First try to get today's snapshots
  const { data: todaySnapshots, error: todayError } = await supabase
    .from('crypto_portfolio_snapshots')
    .select('user_id, total_value_usd')
    .eq('snapshot_date', snapshotDate)

  if (todayError) {
    console.warn(
      `Failed to fetch today's crypto snapshots: ${todayError.message}`,
    )
  }

  if (todaySnapshots && todaySnapshots.length > 0) {
    for (const snapshot of todaySnapshots) {
      cryptoValues.set(snapshot.user_id, snapshot.total_value_usd)
    }
    console.log(`Found ${todaySnapshots.length} crypto snapshots for today`)
    return cryptoValues
  }

  // If no today snapshots, get the most recent snapshot per user using RPC
  // Uses DISTINCT ON for efficient database-level deduplication
  const { data: latestSnapshots, error: latestError } = await supabase.rpc(
    'get_latest_crypto_snapshots',
  )

  if (latestError) {
    throw new Error(
      `Failed to fetch latest crypto snapshots: ${latestError.message}`,
    )
  }

  if (!latestSnapshots || latestSnapshots.length === 0) {
    console.log('No crypto snapshots found')
    return cryptoValues
  }

  // RPC already returns one row per user (most recent snapshot)
  for (const snapshot of latestSnapshots) {
    cryptoValues.set(snapshot.user_id, snapshot.total_value_usd)
  }

  console.log(`Found ${cryptoValues.size} users with crypto snapshots`)
  return cryptoValues
}

/**
 * Fetch current USD to VND exchange rate
 */
async function fetchExchangeRate(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase
    .from('exchange_rates')
    .select('rate')
    .eq('from_currency', 'USD')
    .eq('to_currency', 'VND')
    .single()

  if (error || !data) {
    console.warn('Failed to fetch exchange rate, using default 25500')
    return 25500
  }

  return data.rate
}

/**
 * Create a net worth snapshot for a single user
 */
async function createUserSnapshot(
  supabase: SupabaseClient,
  userId: string,
  bankBalance: number,
  cryptoValueUsd: number,
  exchangeRate: number,
  snapshotDate: string,
): Promise<SnapshotResult> {
  try {
    // Convert crypto USD value to VND
    const cryptoValueVnd = cryptoValueUsd * exchangeRate
    // Total net worth is bank balance (already in VND) + crypto value in VND
    const totalNetWorth = bankBalance + cryptoValueVnd

    // Insert snapshot (upsert to handle re-runs on same day)
    const { error } = await supabase.from('net_worth_snapshots').upsert(
      {
        user_id: userId,
        snapshot_date: snapshotDate,
        bank_balance: bankBalance,
        crypto_value_vnd: cryptoValueVnd,
        total_net_worth: totalNetWorth,
        exchange_rate: exchangeRate,
      },
      {
        onConflict: 'user_id,snapshot_date',
      },
    )

    if (error) {
      throw new Error(`Failed to insert snapshot: ${error.message}`)
    }

    console.log(
      `User ${userId}: Snapshot created - Net worth: ${totalNetWorth.toLocaleString()} VND ` +
        `(Bank: ${bankBalance.toLocaleString()}, Crypto: ${cryptoValueVnd.toLocaleString()})`,
    )

    return {
      userId,
      bankBalance,
      cryptoValueVnd,
      totalNetWorth,
      success: true,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error(`User ${userId}: Failed to create snapshot - ${errorMessage}`)
    return {
      userId,
      bankBalance: 0,
      cryptoValueVnd: 0,
      totalNetWorth: 0,
      success: false,
      error: errorMessage,
    }
  }
}

Deno.serve(async (req) => {
  // Only allow POST requests (for cron jobs and manual triggers)
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Verify authorization using custom CRON_SECRET
  // JWT verification is disabled for this function (--no-verify-jwt)
  // so we validate against our own secret for cron job security
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const token = authHeader.replace('Bearer ', '').trim()
  const cronSecret = Deno.env.get('CRON_SECRET')?.trim()

  if (!cronSecret) {
    console.error('CRON_SECRET environment variable is not set')
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  if (token !== cronSecret) {
    return new Response(
      JSON.stringify({ error: 'Invalid authorization token' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  try {
    // Create Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get today's date for the snapshot
    const snapshotDate = new Date().toISOString().split('T')[0]
    console.log(`Creating net worth snapshots for ${snapshotDate}...`)

    // Step 1: Fetch bank balances for all users
    const bankBalances = await fetchAllUserBankBalances(supabase)
    console.log(`Found ${bankBalances.size} users with transactions`)

    // Step 2: Fetch latest crypto snapshots for all users
    const cryptoValues = await fetchLatestCryptoSnapshots(supabase, snapshotDate)

    // Step 3: Fetch current exchange rate
    const exchangeRate = await fetchExchangeRate(supabase)
    console.log(`Exchange rate: 1 USD = ${exchangeRate} VND`)

    // Step 4: Get all unique users (from both bank and crypto)
    const allUserIds = new Set<string>([
      ...bankBalances.keys(),
      ...cryptoValues.keys(),
    ])

    if (allUserIds.size === 0) {
      console.log('No users found with transactions or crypto, nothing to snapshot')
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No users found',
          snapshotsCreated: 0,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    console.log(`Processing ${allUserIds.size} users...`)

    // Step 5: Create snapshots for each user
    const results: Array<SnapshotResult> = []

    for (const userId of allUserIds) {
      const bankBalance = bankBalances.get(userId) || 0
      const cryptoValueUsd = cryptoValues.get(userId) || 0

      const result = await createUserSnapshot(
        supabase,
        userId,
        bankBalance,
        cryptoValueUsd,
        exchangeRate,
        snapshotDate,
      )
      results.push(result)
    }

    // Summary
    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length
    const totalNetWorth = results.reduce((sum, r) => sum + r.totalNetWorth, 0)

    console.log(
      `Snapshot complete: ${successCount} succeeded, ${failureCount} failed`,
    )
    console.log(`Total net worth: ${totalNetWorth.toLocaleString()} VND`)

    return new Response(
      JSON.stringify({
        success: true,
        snapshotDate,
        usersProcessed: allUserIds.size,
        snapshotsCreated: successCount,
        snapshotsFailed: failureCount,
        totalNetWorthVnd: totalNetWorth,
        exchangeRate,
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error creating net worth snapshots:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
})
