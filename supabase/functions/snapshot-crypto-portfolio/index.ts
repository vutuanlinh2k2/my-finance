// Edge Function: Snapshot Crypto Portfolio
// Creates daily snapshots of each user's crypto portfolio value and allocation
// Scheduled to run daily at 00:10 UTC via Supabase cron

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import { fetchAavePositionSnapshot } from '../_shared/aave.ts'

// CoinGecko API configuration
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'
const COINGECKO_RATE_LIMIT_DELAY = 1500 // 1.5 seconds between requests (free tier limit)

// Types
interface CryptoAsset {
  id: string
  user_id: string
  coingecko_id: string
  name: string
  symbol: string
}

interface CryptoTransaction {
  id: string
  user_id: string
  type:
    | 'buy'
    | 'sell'
    | 'transfer_between'
    | 'swap'
    | 'transfer_in'
    | 'transfer_out'
  asset_id: string | null
  amount: number | null
  storage_id: string | null
  from_storage_id: string | null
  to_storage_id: string | null
  from_asset_id: string | null
  from_amount: number | null
  to_asset_id: string | null
  to_amount: number | null
}

interface TrackedProtocolAccount {
  user_id: string
  address: string
}

interface CoinGeckoPriceResponse {
  [coinId: string]: {
    usd: number
  }
}

interface SnapshotAllocation {
  percentage: number
  valueUsd: number
}

interface SnapshotAllocations {
  [coingeckoId: string]: SnapshotAllocation
}

interface SnapshotResult {
  userId: string
  totalValueUsd: number
  spotValueUsd: number
  aaveSuppliedUsd: number
  aaveBorrowedUsd: number
  assetCount: number
  success: boolean
  error?: string
}

/**
 * Check if running in local development environment
 */
function isLocalDevelopment(): boolean {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  return supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost')
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Fetch prices from CoinGecko for a list of coin IDs
 * Returns a map of coingecko_id -> USD price
 */
async function fetchPrices(
  coinIds: Array<string>,
): Promise<Map<string, number>> {
  const prices = new Map<string, number>()

  if (coinIds.length === 0) {
    return prices
  }

  // In local dev, DNS resolution fails for external APIs
  // Return mock prices for testing
  if (isLocalDevelopment()) {
    console.log('Local dev detected: using mock prices for CoinGecko')
    const mockPrices: Record<string, number> = {
      bitcoin: 97000,
      ethereum: 3400,
      solana: 190,
      ripple: 2.2,
      cardano: 0.95,
      dogecoin: 0.32,
      polkadot: 6.8,
      avalanche: 38,
      chainlink: 22,
      uniswap: 13,
    }
    for (const id of coinIds) {
      // Use mock price if available, otherwise generate random price
      prices.set(id, mockPrices[id] ?? Math.random() * 100 + 1)
    }
    return prices
  }

  try {
    // CoinGecko simple/price endpoint (batch request)
    const idsParam = coinIds.join(',')
    const url = `${COINGECKO_API_URL}/simple/price?ids=${idsParam}&vs_currencies=usd`

    console.log(`Fetching prices for ${coinIds.length} coins...`)
    const response = await fetch(url)

    if (response.status === 429) {
      console.warn('CoinGecko rate limit hit, using empty prices')
      return prices
    }

    if (!response.ok) {
      throw new Error(`CoinGecko API responded with status ${response.status}`)
    }

    const data: CoinGeckoPriceResponse = await response.json()

    for (const [coinId, priceData] of Object.entries(data)) {
      if (typeof priceData.usd === 'number') {
        prices.set(coinId, priceData.usd)
      }
    }

    console.log(`Got prices for ${prices.size} coins`)
  } catch (error) {
    console.error('Failed to fetch prices from CoinGecko:', error)
  }

  return prices
}

/**
 * Calculate the balance of a specific asset across all storages.
 *
 * IMPORTANT: This logic is duplicated from src/lib/crypto/utils.ts because
 * edge functions run in Deno and cannot import from the frontend codebase.
 * If you modify balance calculation logic, update BOTH locations:
 * - src/lib/crypto/utils.ts (calculateAssetBalance, getAllBalances)
 * - supabase/functions/snapshot-crypto-portfolio/index.ts (this function)
 *
 * The canonical implementation is in utils.ts. This function calculates
 * total balance across all storages (no storageId filter).
 */
function calculateAssetBalance(
  assetId: string,
  transactions: Array<CryptoTransaction>,
): number {
  let balance = 0

  for (const tx of transactions) {
    switch (tx.type) {
      case 'buy':
        if (tx.asset_id === assetId && tx.amount != null) {
          balance += tx.amount
        }
        break

      case 'sell':
        if (tx.asset_id === assetId && tx.amount != null) {
          balance -= tx.amount
        }
        break

      case 'transfer_between':
        // Net zero for total balance (across all storages)
        break

      case 'swap':
        if (tx.from_asset_id === assetId && tx.from_amount != null) {
          balance -= tx.from_amount
        }
        if (tx.to_asset_id === assetId && tx.to_amount != null) {
          balance += tx.to_amount
        }
        break

      case 'transfer_in':
        if (tx.asset_id === assetId && tx.amount != null) {
          balance += tx.amount
        }
        break

      case 'transfer_out':
        if (tx.asset_id === assetId && tx.amount != null) {
          balance -= tx.amount
        }
        break
    }
  }

  return balance
}

/**
 * Create a portfolio snapshot for a single user
 */
async function createUserSnapshot(
  supabase: SupabaseClient,
  userId: string,
  assets: Array<CryptoAsset>,
  transactions: Array<CryptoTransaction>,
  prices: Map<string, number>,
  trackedAaveAddress: string | null,
  snapshotDate: string,
): Promise<SnapshotResult> {
  try {
    const assetValues: Array<{ coingeckoId: string; valueUsd: number }> = []
    let spotValueUsd = 0

    for (const asset of assets) {
      const balance = calculateAssetBalance(asset.id, transactions)
      const priceUsd = prices.get(asset.coingecko_id) ?? 0
      const valueUsd = balance * priceUsd

      spotValueUsd += valueUsd

      if (valueUsd > 0) {
        assetValues.push({
          coingeckoId: asset.coingecko_id,
          valueUsd,
        })
      }
    }

    let aaveSuppliedUsd = 0
    let aaveBorrowedUsd = 0

    if (trackedAaveAddress) {
      try {
        const aavePosition = await fetchAavePositionSnapshot(trackedAaveAddress)
        aaveSuppliedUsd = aavePosition.totalCollateralUsd
        aaveBorrowedUsd = aavePosition.totalBorrowedUsd

        for (const asset of aavePosition.suppliedAssets) {
          if (asset.valueUsd > 0) {
            assetValues.push(asset)
          }
        }
      } catch (error) {
        console.error(
          `User ${userId}: Failed to fetch Aave position - ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        )
      }
    }

    const totalValueUsd = spotValueUsd + aaveSuppliedUsd

    if (assetValues.length === 0 && aaveBorrowedUsd === 0) {
      console.log(`User ${userId}: No portfolio value, skipping snapshot`)
      return {
        userId,
        totalValueUsd: 0,
        spotValueUsd: 0,
        aaveSuppliedUsd: 0,
        aaveBorrowedUsd: 0,
        assetCount: 0,
        success: true,
      }
    }

    const allocations: SnapshotAllocations = {}
    for (const { coingeckoId, valueUsd } of assetValues) {
      const existingValue = allocations[coingeckoId]?.valueUsd ?? 0
      const nextValue = existingValue + valueUsd
      allocations[coingeckoId] = {
        percentage: totalValueUsd > 0 ? (nextValue / totalValueUsd) * 100 : 0,
        valueUsd: nextValue,
      }
    }

    const { error } = await supabase.from('crypto_portfolio_snapshots').upsert(
      {
        user_id: userId,
        snapshot_date: snapshotDate,
        total_value_usd: totalValueUsd,
        spot_value_usd: spotValueUsd,
        aave_supplied_usd: aaveSuppliedUsd,
        aave_borrowed_usd: aaveBorrowedUsd,
        allocations,
      },
      {
        onConflict: 'user_id,snapshot_date',
      },
    )

    if (error) {
      throw new Error(`Failed to insert snapshot: ${error.message}`)
    }

    console.log(
      `User ${userId}: Snapshot created - $${totalValueUsd.toFixed(2)} ` +
        `(Spot: $${spotValueUsd.toFixed(2)}, Aave supplied: $${aaveSuppliedUsd.toFixed(2)}, ` +
        `Aave borrowed: $${aaveBorrowedUsd.toFixed(2)})`,
    )

    return {
      userId,
      totalValueUsd,
      spotValueUsd,
      aaveSuppliedUsd,
      aaveBorrowedUsd,
      assetCount: assetValues.length,
      success: true,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error(`User ${userId}: Failed to create snapshot - ${errorMessage}`)
    return {
      userId,
      totalValueUsd: 0,
      spotValueUsd: 0,
      aaveSuppliedUsd: 0,
      aaveBorrowedUsd: 0,
      assetCount: 0,
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
    console.log(`Creating portfolio snapshots for ${snapshotDate}...`)

    // Step 1: Get all manual crypto assets
    const { data: allAssets, error: assetsError } = await supabase
      .from('crypto_assets')
      .select('id, user_id, coingecko_id, name, symbol')

    if (assetsError) {
      throw new Error(`Failed to fetch crypto assets: ${assetsError.message}`)
    }

    const { data: trackedAccounts, error: trackedAccountsError } =
      await supabase
        .from('tracked_protocol_accounts')
        .select('user_id, address')
        .eq('protocol', 'aave-v3')
        .eq('network', 'ethereum')

    if (trackedAccountsError) {
      throw new Error(
        `Failed to fetch tracked protocol accounts: ${trackedAccountsError.message}`,
      )
    }

    const assetsByUser = new Map<string, Array<CryptoAsset>>()
    const allCoingeckoIds = new Set<string>()

    for (const asset of allAssets || []) {
      const userId = asset.user_id
      if (!assetsByUser.has(userId)) {
        assetsByUser.set(userId, [])
      }
      assetsByUser.get(userId)!.push(asset as CryptoAsset)
      allCoingeckoIds.add(asset.coingecko_id)
    }

    const trackedAaveAccountsByUser = new Map<string, string>()
    for (const account of (trackedAccounts ||
      []) as Array<TrackedProtocolAccount>) {
      trackedAaveAccountsByUser.set(account.user_id, account.address)
    }

    const userIds = Array.from(
      new Set<string>([
        ...assetsByUser.keys(),
        ...trackedAaveAccountsByUser.keys(),
      ]),
    )

    if (userIds.length === 0) {
      console.log(
        'No crypto assets or tracked Aave accounts found, nothing to snapshot',
      )
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No crypto assets or tracked Aave accounts found',
          snapshotsCreated: 0,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    console.log(
      `Found ${userIds.length} users with manual crypto or tracked Aave`,
    )

    // Step 2: Fetch all transactions for these users
    const { data: allTransactions, error: txError } = await supabase
      .from('crypto_transactions')
      .select('*')
      .in('user_id', userIds)

    if (txError) {
      throw new Error(`Failed to fetch transactions: ${txError.message}`)
    }

    // Group transactions by user
    const transactionsByUser = new Map<string, Array<CryptoTransaction>>()
    for (const userId of userIds) {
      transactionsByUser.set(userId, [])
    }
    for (const tx of allTransactions || []) {
      const userTxs = transactionsByUser.get(tx.user_id)
      if (userTxs) {
        userTxs.push(tx as CryptoTransaction)
      }
    }

    // Step 3: Fetch prices from CoinGecko
    // Add delay to respect rate limits
    await sleep(COINGECKO_RATE_LIMIT_DELAY)
    const prices = await fetchPrices(Array.from(allCoingeckoIds))

    // Step 4: Create snapshots for each user
    const results: Array<SnapshotResult> = []

    for (const userId of userIds) {
      const userAssets = assetsByUser.get(userId) || []
      const userTransactions = transactionsByUser.get(userId) || []
      const trackedAaveAddress = trackedAaveAccountsByUser.get(userId) ?? null

      const result = await createUserSnapshot(
        supabase,
        userId,
        userAssets,
        userTransactions,
        prices,
        trackedAaveAddress,
        snapshotDate,
      )
      results.push(result)
    }

    // Summary
    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length
    const totalValue = results.reduce((sum, r) => sum + r.totalValueUsd, 0)

    console.log(
      `Snapshot complete: ${successCount} succeeded, ${failureCount} failed`,
    )
    console.log(`Total portfolio value: $${totalValue.toFixed(2)}`)

    return new Response(
      JSON.stringify({
        success: true,
        snapshotDate,
        usersProcessed: userIds.length,
        snapshotsCreated: successCount,
        snapshotsFailed: failureCount,
        totalPortfolioValueUsd: totalValue,
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error creating portfolio snapshots:', error)

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
