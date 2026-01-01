// Edge Function: Process Subscription Payments
// Fetches fresh exchange rate and processes due subscription payments
// Scheduled to run daily at 00:05 UTC via Supabase cron

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'

const EXCHANGE_RATE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD'
const DEFAULT_EXCHANGE_RATE = 25000

interface ExchangeRateApiResponse {
  rates: {
    VND: number
  }
}

interface ProcessedPayment {
  subscription_id: string
  transaction_id: string
  title: string
  amount_vnd: number
}

interface ExchangeRateResult {
  rate: number
  source: 'api' | 'database' | 'default'
}

/**
 * Fetch the latest exchange rate from the database
 */
async function fetchRateFromDatabase(
  supabase: SupabaseClient
): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('rate')
      .eq('from_currency', 'USD')
      .eq('to_currency', 'VND')
      .single()

    if (error || !data) {
      console.warn('Failed to fetch rate from database:', error?.message)
      return null
    }

    const rate = Number(data.rate)
    if (isNaN(rate) || rate <= 0) {
      console.warn('Invalid rate in database:', data.rate)
      return null
    }

    return rate
  } catch (error) {
    console.warn('Error fetching rate from database:', error)
    return null
  }
}

/**
 * Fetch fresh USD to VND exchange rate
 * Fallback chain: API → Database → Default (25000)
 */
async function fetchExchangeRate(
  supabase: SupabaseClient
): Promise<ExchangeRateResult> {
  // Try fetching from external API first
  try {
    console.log('Attempting to fetch rate from API...')
    const response = await fetch(EXCHANGE_RATE_API_URL)

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`)
    }

    const data: ExchangeRateApiResponse = await response.json()
    const rate = data.rates.VND

    if (typeof rate !== 'number' || rate <= 0) {
      throw new Error('Invalid rate received from API')
    }

    console.log(`Got fresh rate from API: ${rate}`)
    return { rate, source: 'api' }
  } catch (error) {
    console.warn('Failed to fetch exchange rate from API:', error)
  }

  // Fallback to database (last known rate)
  console.log('Falling back to database rate...')
  const dbRate = await fetchRateFromDatabase(supabase)
  if (dbRate !== null) {
    console.log(`Using database rate: ${dbRate}`)
    return { rate: dbRate, source: 'database' }
  }

  // Last resort: use default hardcoded rate
  console.warn(`Using default fallback rate: ${DEFAULT_EXCHANGE_RATE}`)
  return { rate: DEFAULT_EXCHANGE_RATE, source: 'default' }
}

Deno.serve(async (req) => {
  // Only allow POST requests (for cron jobs and manual triggers)
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Verify authorization - accept service_role key for cron jobs
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Create Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Step 1: Fetch exchange rate (API → DB fallback → default)
    console.log('Fetching exchange rate...')
    const { rate, source } = await fetchExchangeRate(supabase)
    console.log(`Exchange rate: ${rate} VND/USD (source: ${source})`)

    // Step 2: Update exchange rate in database (if from API or default)
    // Skip update if we're already using the database rate
    if (source !== 'database') {
      console.log('Updating exchange rate in database...')
      const { error: updateError } = await supabase.rpc('update_exchange_rate', {
        p_from_currency: 'USD',
        p_to_currency: 'VND',
        p_rate: rate,
        p_source: source,
      })

      if (updateError) {
        console.warn('Failed to update exchange rate:', updateError.message)
      } else {
        console.log('Exchange rate updated successfully')
      }
    } else {
      console.log('Skipping DB update (already using database rate)')
    }

    // Step 3: Process subscription payments
    console.log('Processing subscription payments...')
    const { data: payments, error: processError } = await supabase.rpc(
      'process_subscription_payments'
    )

    if (processError) {
      throw new Error(
        `Failed to process subscription payments: ${processError.message}`
      )
    }

    const processedPayments = (payments || []) as Array<ProcessedPayment>
    console.log(`Processed ${processedPayments.length} subscription payments`)

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        exchangeRate: {
          rate,
          source,
        },
        paymentsProcessed: processedPayments.length,
        payments: processedPayments,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error processing subscription payments:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
