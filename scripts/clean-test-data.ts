/**
 * Clean test data for Playwright testing
 *
 * This script removes the test user and all associated data.
 *
 * Usage: pnpm db:clean-test
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:64321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error(
    'Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required.',
  )
  console.error(
    'Run `pnpm db:start` and copy the service_role key from the output.',
  )
  process.exit(1)
}

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

  console.log(`Deleted transactions`)

  // Delete tags
  await supabase.from('tags').delete().eq('user_id', testUser.id)

  console.log(`Deleted tags`)

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
