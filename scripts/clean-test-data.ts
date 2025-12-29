/**
 * Clean test data for Playwright testing
 *
 * This script removes the test user and all associated data.
 *
 * Usage: pnpm db:clean-test
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:64321'
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

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
  await supabase
    .from('transactions')
    .delete()
    .eq('user_id', testUser.id)

  console.log(`Deleted transactions`)

  // Delete tags
  await supabase
    .from('tags')
    .delete()
    .eq('user_id', testUser.id)

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
