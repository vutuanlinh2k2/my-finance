/**
 * Clean test data for Playwright testing
 *
 * This script removes the test user and all associated data.
 *
 * Usage: pnpm db:clean-test
 */

import { execSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'

/**
 * Get Supabase service role key from environment or running instance
 */
function getServiceRoleKey(): string {
  // First check environment variable
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return process.env.SUPABASE_SERVICE_ROLE_KEY
  }

  // Try to get from running Supabase instance
  try {
    const output = execSync('npx supabase status -o json', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    const status = JSON.parse(output)
    if (status.SERVICE_ROLE_KEY) {
      return status.SERVICE_ROLE_KEY
    }
  } catch {
    // Supabase CLI not available or not running
  }

  console.error('Error: Could not get SUPABASE_SERVICE_ROLE_KEY.')
  console.error('Either set the environment variable or run `pnpm db:start`.')
  process.exit(1)
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:64321'
const supabaseServiceKey = getServiceRoleKey()

// Test user credentials - keep in sync with seed script
const TEST_USER_EMAIL = 'test@example.com'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function cleanTestData() {
  console.log('Cleaning test data...')

  // Find test user
  const { data } = await supabase.auth.admin.listUsers()
  const testUser = data.users.find((u) => u.email === TEST_USER_EMAIL)
  if (!testUser) {
    console.log('No test user found. Nothing to clean.')
    return
  }

  console.log(`Found test user: ${testUser.id}`)

  // Delete transactions first (due to foreign key constraint)
  await supabase.from('transactions').delete().eq('user_id', testUser.id)
  console.log('Deleted transactions')

  // Delete subscriptions
  await supabase.from('subscriptions').delete().eq('user_id', testUser.id)
  console.log('Deleted subscriptions')

  // Delete tags
  await supabase.from('tags').delete().eq('user_id', testUser.id)
  console.log('Deleted tags')

  // Delete the user
  const { error } = await supabase.auth.admin.deleteUser(testUser.id)

  if (error) {
    console.error('Error deleting test user:', error)
    process.exit(1)
  }

  console.log('Deleted test user')
  console.log('')
  console.log('Test data cleanup complete!')
}

cleanTestData().catch(console.error)
