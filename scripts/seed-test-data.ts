/**
 * Seed test data for Playwright testing
 *
 * This script creates a test user and populates sample transactions
 * for comprehensive E2E testing of the calendar page.
 *
 * Usage: pnpm db:seed-test
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:64321'
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Test user credentials - keep in sync with Playwright tests
export const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function seedTestData() {
  console.log('Starting test data seeding...')

  // 1. Clean up existing test user data first
  console.log('Cleaning up existing test data...')
  const { data: existingData } = await supabase.auth.admin.listUsers()
  const testUser = existingData.users.find((u) => u.email === TEST_USER.email)

  if (testUser) {
    // Delete transactions and tags (they cascade with user deletion)
    await supabase.from('transactions').delete().eq('user_id', testUser.id)
    await supabase.from('tags').delete().eq('user_id', testUser.id)
    await supabase.auth.admin.deleteUser(testUser.id)
    console.log('Deleted existing test user and data')
  }

  // 2. Create test user
  console.log('Creating test user...')
  const { data: newUser, error: createError } =
    await supabase.auth.admin.createUser({
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: true,
    })

  if (createError) {
    console.error('Error creating test user:', createError)
    process.exit(1)
  }

  const userId = newUser.user.id
  console.log(`Created test user with ID: ${userId}`)

  // 3. Wait for default tags to be created by trigger
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 4. Get the tags created by the trigger
  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId)

  if (!tags || tags.length === 0) {
    console.error('No tags found - trigger may not have run')
    process.exit(1)
  }

  console.log(`Found ${tags.length} tags`)

  // Get specific tag IDs for seeding
  const groceriesTag = tags.find((t) => t.name === 'Groceries')
  const salaryTag = tags.find((t) => t.name === 'Salary')
  const utilitiesTag = tags.find((t) => t.name === 'Utilities')
  const entertainmentTag = tags.find((t) => t.name === 'Entertainment')
  const freelanceTag = tags.find((t) => t.name === 'Freelance Work')
  const transportTag = tags.find((t) => t.name === 'Transportation')

  // 5. Create sample transactions
  console.log('Creating sample transactions...')

  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // Helper to format date
  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const transactions = [
    // Current month transactions
    {
      user_id: userId,
      title: 'Monthly Salary',
      amount: 25000000,
      date: formatDate(currentYear, currentMonth, 1),
      type: 'income',
      tag_id: salaryTag?.id,
    },
    {
      user_id: userId,
      title: 'Grocery Shopping',
      amount: 850000,
      date: formatDate(currentYear, currentMonth, 3),
      type: 'expense',
      tag_id: groceriesTag?.id,
    },
    {
      user_id: userId,
      title: 'Electric Bill',
      amount: 450000,
      date: formatDate(currentYear, currentMonth, 5),
      type: 'expense',
      tag_id: utilitiesTag?.id,
    },
    {
      user_id: userId,
      title: 'Freelance Project',
      amount: 5000000,
      date: formatDate(currentYear, currentMonth, 8),
      type: 'income',
      tag_id: freelanceTag?.id,
    },
    {
      user_id: userId,
      title: 'Movie Night',
      amount: 250000,
      date: formatDate(currentYear, currentMonth, 10),
      type: 'expense',
      tag_id: entertainmentTag?.id,
    },
    {
      user_id: userId,
      title: 'Gas Station',
      amount: 500000,
      date: formatDate(currentYear, currentMonth, 12),
      type: 'expense',
      tag_id: transportTag?.id,
    },
    {
      user_id: userId,
      title: 'Weekly Groceries',
      amount: 720000,
      date: formatDate(currentYear, currentMonth, 15),
      type: 'expense',
      tag_id: groceriesTag?.id,
    },
    {
      user_id: userId,
      title: 'Water Bill',
      amount: 150000,
      date: formatDate(currentYear, currentMonth, 18),
      type: 'expense',
      tag_id: utilitiesTag?.id,
    },
    // Same day transactions to test multiple entries
    {
      user_id: userId,
      title: 'Coffee Shop',
      amount: 85000,
      date: formatDate(currentYear, currentMonth, 20),
      type: 'expense',
      tag_id: entertainmentTag?.id,
    },
    {
      user_id: userId,
      title: 'Lunch',
      amount: 120000,
      date: formatDate(currentYear, currentMonth, 20),
      type: 'expense',
      tag_id: null, // No tag
    },
    // Previous month transactions
    {
      user_id: userId,
      title: 'Last Month Salary',
      amount: 25000000,
      date: formatDate(
        currentMonth === 0 ? currentYear - 1 : currentYear,
        currentMonth === 0 ? 11 : currentMonth - 1,
        1,
      ),
      type: 'income',
      tag_id: salaryTag?.id,
    },
    {
      user_id: userId,
      title: 'Last Month Groceries',
      amount: 1200000,
      date: formatDate(
        currentMonth === 0 ? currentYear - 1 : currentYear,
        currentMonth === 0 ? 11 : currentMonth - 1,
        10,
      ),
      type: 'expense',
      tag_id: groceriesTag?.id,
    },
  ]

  const { error: insertError } = await supabase
    .from('transactions')
    .insert(transactions)

  if (insertError) {
    console.error('Error inserting transactions:', insertError)
    process.exit(1)
  }

  console.log(`Created ${transactions.length} sample transactions`)

  console.log('')
  console.log('Test data seeding complete!')
  console.log('')
  console.log('Test user credentials:')
  console.log(`  Email: ${TEST_USER.email}`)
  console.log(`  Password: ${TEST_USER.password}`)
  console.log('')
}

seedTestData().catch(console.error)
