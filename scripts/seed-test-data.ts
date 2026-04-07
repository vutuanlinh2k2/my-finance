/**
 * Seed test data for Playwright testing
 *
 * This script creates a test user and populates sample transactions
 * for comprehensive E2E testing of the calendar and reports pages.
 *
 * Usage: pnpm db:seed-test
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

// Types
interface Tag {
  id: string
  name: string
  emoji: string
  type: 'expense' | 'income'
}

interface TagMap {
  // Expense tags
  rent: Tag | undefined
  groceries: Tag | undefined
  utilities: Tag | undefined
  transportation: Tag | undefined
  entertainment: Tag | undefined
  // Income tags
  salary: Tag | undefined
  freelance: Tag | undefined
  investments: Tag | undefined
}

interface Transaction {
  user_id: string
  title: string
  amount: number
  date: string
  type: 'expense' | 'income'
  tag_id: string | null
}

type MonthSpecialCase = 'single-tag' | 'all-untagged' | 'skip' | 'low-amounts'

interface MonthConfig {
  monthOffset: number // 0 = current month, -1 = last month, etc.
  hasSalary: boolean
  hasFreelance: boolean
  hasInvestment: boolean
  expenseVariety: 'full' | 'minimal' | 'none'
  specialCase?: MonthSpecialCase
}

interface CryptoStorageSeed {
  user_id: string
  type: 'wallet'
  name: string
  address: string
  explorer_url: string
}

interface CryptoAssetSeed {
  user_id: string
  coingecko_id: string
  name: string
  symbol: string
  icon_url: string | null
}

// Helper functions
function getDateFromOffset(
  baseYear: number,
  baseMonth: number,
  monthOffset: number,
): { year: number; month: number } {
  let year = baseYear
  let month = baseMonth + monthOffset

  while (month < 0) {
    month += 12
    year -= 1
  }
  while (month > 11) {
    month -= 12
    year += 1
  }

  return { year, month }
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDay(max: number = 28): number {
  return randomInRange(1, max)
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

// Generate transactions for a single month
function generateMonthTransactions(
  userId: string,
  year: number,
  month: number,
  tags: TagMap,
  config: MonthConfig,
): Array<Transaction> {
  const transactions: Array<Transaction> = []

  // Handle special cases
  if (config.specialCase === 'skip') {
    return [] // Empty month for testing empty states
  }

  if (config.specialCase === 'single-tag') {
    // Only groceries transactions - tests 100% pie chart
    transactions.push(
      {
        user_id: userId,
        title: 'Weekly Groceries',
        amount: 850000,
        date: formatDate(year, month, 5),
        type: 'expense',
        tag_id: tags.groceries?.id ?? null,
      },
      {
        user_id: userId,
        title: 'Grocery Run',
        amount: 620000,
        date: formatDate(year, month, 12),
        type: 'expense',
        tag_id: tags.groceries?.id ?? null,
      },
      {
        user_id: userId,
        title: 'Supermarket Shopping',
        amount: 980000,
        date: formatDate(year, month, 20),
        type: 'expense',
        tag_id: tags.groceries?.id ?? null,
      },
    )
    return transactions
  }

  if (config.specialCase === 'all-untagged') {
    // All untagged transactions - tests "Untagged" category dominance
    transactions.push(
      {
        user_id: userId,
        title: 'Miscellaneous Purchase',
        amount: 450000,
        date: formatDate(year, month, 3),
        type: 'expense',
        tag_id: null,
      },
      {
        user_id: userId,
        title: 'Random Expense',
        amount: 280000,
        date: formatDate(year, month, 10),
        type: 'expense',
        tag_id: null,
      },
      {
        user_id: userId,
        title: 'Uncategorized Spending',
        amount: 520000,
        date: formatDate(year, month, 18),
        type: 'expense',
        tag_id: null,
      },
      {
        user_id: userId,
        title: 'Other Income',
        amount: 3000000,
        date: formatDate(year, month, 15),
        type: 'income',
        tag_id: null,
      },
    )
    return transactions
  }

  const isLowAmounts = config.specialCase === 'low-amounts'
  const amountMultiplier = isLowAmounts ? 0.01 : 1 // 1% of normal for low amounts

  // Income transactions
  if (config.hasSalary) {
    transactions.push({
      user_id: userId,
      title: 'Monthly Salary',
      amount: Math.round(randomInRange(20000000, 30000000) * amountMultiplier),
      date: formatDate(year, month, 1),
      type: 'income',
      tag_id: tags.salary?.id ?? null,
    })
  }

  if (config.hasFreelance) {
    transactions.push({
      user_id: userId,
      title: 'Freelance Project',
      amount: Math.round(randomInRange(2000000, 8000000) * amountMultiplier),
      date: formatDate(year, month, randomDay(20)),
      type: 'income',
      tag_id: tags.freelance?.id ?? null,
    })
  }

  if (config.hasInvestment) {
    transactions.push({
      user_id: userId,
      title: 'Investment Dividend',
      amount: Math.round(randomInRange(300000, 1000000) * amountMultiplier),
      date: formatDate(year, month, 15),
      type: 'income',
      tag_id: tags.investments?.id ?? null,
    })
  }

  // Expense transactions
  if (config.expenseVariety === 'none') {
    return transactions
  }

  // Rent (always present in full variety)
  if (config.expenseVariety === 'full') {
    transactions.push({
      user_id: userId,
      title: 'Rent Payment',
      amount: Math.round(randomInRange(7500000, 8500000) * amountMultiplier),
      date: formatDate(year, month, 1),
      type: 'expense',
      tag_id: tags.rent?.id ?? null,
    })
  }

  // Groceries (2-4 transactions)
  const groceryCount =
    config.expenseVariety === 'full' ? randomInRange(2, 4) : 1
  const groceryTitles = [
    'Weekly Groceries',
    'Grocery Shopping',
    'Supermarket Run',
    'Fresh Produce',
  ]
  for (let i = 0; i < groceryCount; i++) {
    transactions.push({
      user_id: userId,
      title: groceryTitles[i] || 'Groceries',
      amount: Math.round(randomInRange(300000, 1200000) * amountMultiplier),
      date: formatDate(year, month, randomInRange(3 + i * 7, 7 + i * 7)),
      type: 'expense',
      tag_id: tags.groceries?.id ?? null,
    })
  }

  // Utilities (1-2 transactions)
  if (config.expenseVariety === 'full') {
    transactions.push({
      user_id: userId,
      title: 'Electric Bill',
      amount: Math.round(randomInRange(300000, 600000) * amountMultiplier),
      date: formatDate(year, month, 5),
      type: 'expense',
      tag_id: tags.utilities?.id ?? null,
    })
    if (Math.random() > 0.5) {
      transactions.push({
        user_id: userId,
        title: 'Water Bill',
        amount: Math.round(randomInRange(100000, 200000) * amountMultiplier),
        date: formatDate(year, month, 10),
        type: 'expense',
        tag_id: tags.utilities?.id ?? null,
      })
    }
  }

  // Transportation (1-3 transactions)
  if (config.expenseVariety === 'full') {
    const transportCount = randomInRange(1, 3)
    const transportTitles = ['Gas Station', 'Grab Ride', 'Parking Fee']
    for (let i = 0; i < transportCount; i++) {
      transactions.push({
        user_id: userId,
        title: transportTitles[i] || 'Transportation',
        amount: Math.round(randomInRange(100000, 800000) * amountMultiplier),
        date: formatDate(year, month, randomInRange(1, 28)),
        type: 'expense',
        tag_id: tags.transportation?.id ?? null,
      })
    }
  }

  // Entertainment (0-3 transactions)
  if (config.expenseVariety === 'full') {
    const entertainmentCount = randomInRange(0, 3)
    const entertainmentTitles = ['Movie Night', 'Dinner Out', 'Coffee Shop']
    for (let i = 0; i < entertainmentCount; i++) {
      transactions.push({
        user_id: userId,
        title: entertainmentTitles[i] || 'Entertainment',
        amount: Math.round(randomInRange(50000, 500000) * amountMultiplier),
        date: formatDate(year, month, randomInRange(1, 28)),
        type: 'expense',
        tag_id: tags.entertainment?.id ?? null,
      })
    }
  }

  // Untagged expenses (0-2 transactions, for testing "Untagged" category)
  if (config.expenseVariety === 'full' && Math.random() > 0.5) {
    const untaggedCount = randomInRange(1, 2)
    const untaggedTitles = ['Misc Purchase', 'Random Expense']
    for (let i = 0; i < untaggedCount; i++) {
      transactions.push({
        user_id: userId,
        title: untaggedTitles[i] || 'Uncategorized',
        amount: Math.round(randomInRange(20000, 200000) * amountMultiplier),
        date: formatDate(year, month, randomInRange(1, 28)),
        type: 'expense',
        tag_id: null, // Untagged
      })
    }
  }

  // Add a tiny expense to current month for < 1% percentage testing
  if (config.monthOffset === 0) {
    transactions.push({
      user_id: userId,
      title: 'Parking Meter',
      amount: 5000, // Very small amount
      date: formatDate(year, month, 20),
      type: 'expense',
      tag_id: tags.transportation?.id ?? null,
    })
  }

  return transactions
}

// Define configurations for 18 months
function getMonthConfigs(): Array<MonthConfig> {
  return [
    // Current month (0)
    {
      monthOffset: 0,
      hasSalary: true,
      hasFreelance: true,
      hasInvestment: true,
      expenseVariety: 'full',
    },
    // Month -1
    {
      monthOffset: -1,
      hasSalary: true,
      hasFreelance: false,
      hasInvestment: false,
      expenseVariety: 'full',
    },
    // Month -2
    {
      monthOffset: -2,
      hasSalary: true,
      hasFreelance: true,
      hasInvestment: false,
      expenseVariety: 'full',
    },
    // Month -3: SPECIAL - Single tag only (100% pie chart test)
    {
      monthOffset: -3,
      hasSalary: false,
      hasFreelance: false,
      hasInvestment: false,
      expenseVariety: 'none',
      specialCase: 'single-tag',
    },
    // Month -4
    {
      monthOffset: -4,
      hasSalary: true,
      hasFreelance: false,
      hasInvestment: true, // Quarterly investment
      expenseVariety: 'full',
    },
    // Month -5
    {
      monthOffset: -5,
      hasSalary: true,
      hasFreelance: true,
      hasInvestment: false,
      expenseVariety: 'full',
    },
    // Month -6
    {
      monthOffset: -6,
      hasSalary: true,
      hasFreelance: false,
      hasInvestment: false,
      expenseVariety: 'full',
    },
    // Month -7: SPECIAL - All untagged (tests "Untagged" dominance)
    {
      monthOffset: -7,
      hasSalary: false,
      hasFreelance: false,
      hasInvestment: false,
      expenseVariety: 'none',
      specialCase: 'all-untagged',
    },
    // Month -8
    {
      monthOffset: -8,
      hasSalary: true,
      hasFreelance: true,
      hasInvestment: true, // Quarterly
      expenseVariety: 'full',
    },
    // Month -9
    {
      monthOffset: -9,
      hasSalary: true,
      hasFreelance: false,
      hasInvestment: false,
      expenseVariety: 'full',
    },
    // Month -10: SPECIAL - Skip (empty month test)
    {
      monthOffset: -10,
      hasSalary: false,
      hasFreelance: false,
      hasInvestment: false,
      expenseVariety: 'none',
      specialCase: 'skip',
    },
    // Month -11
    {
      monthOffset: -11,
      hasSalary: true,
      hasFreelance: true,
      hasInvestment: false,
      expenseVariety: 'full',
    },
    // Month -12 (Previous year starts here potentially)
    {
      monthOffset: -12,
      hasSalary: true,
      hasFreelance: false,
      hasInvestment: true, // Quarterly
      expenseVariety: 'full',
    },
    // Month -13
    {
      monthOffset: -13,
      hasSalary: true,
      hasFreelance: true,
      hasInvestment: false,
      expenseVariety: 'full',
    },
    // Month -14: SPECIAL - Low amounts (tests small percentages)
    {
      monthOffset: -14,
      hasSalary: true,
      hasFreelance: false,
      hasInvestment: false,
      expenseVariety: 'full',
      specialCase: 'low-amounts',
    },
    // Month -15
    {
      monthOffset: -15,
      hasSalary: true,
      hasFreelance: false,
      hasInvestment: false,
      expenseVariety: 'full',
    },
    // Month -16
    {
      monthOffset: -16,
      hasSalary: true,
      hasFreelance: true,
      hasInvestment: true, // Quarterly
      expenseVariety: 'full',
    },
    // Month -17
    {
      monthOffset: -17,
      hasSalary: true,
      hasFreelance: false,
      hasInvestment: false,
      expenseVariety: 'full',
    },
  ]
}

async function seedTestData() {
  console.log('Starting comprehensive test data seeding...')
  console.log('This will create ~150-180 transactions across 18 months.\n')

  // 1. Clean up existing test user data first
  console.log('Cleaning up existing test data...')
  const { data: existingData } = await supabase.auth.admin.listUsers()
  const testUser = existingData.users.find((u) => u.email === TEST_USER.email)

  if (testUser) {
    await supabase
      .from('tracked_protocol_accounts')
      .delete()
      .eq('user_id', testUser.id)
    await supabase
      .from('net_worth_snapshots')
      .delete()
      .eq('user_id', testUser.id)
    await supabase
      .from('crypto_portfolio_snapshots')
      .delete()
      .eq('user_id', testUser.id)
    await supabase
      .from('crypto_transactions')
      .delete()
      .eq('user_id', testUser.id)
    await supabase.from('crypto_assets').delete().eq('user_id', testUser.id)
    await supabase.from('crypto_storages').delete().eq('user_id', testUser.id)
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

  // Build tag map
  const tagMap: TagMap = {
    rent: tags.find((t) => t.name === 'Rent & Mortgage'),
    groceries: tags.find((t) => t.name === 'Groceries'),
    utilities: tags.find((t) => t.name === 'Utilities'),
    transportation: tags.find((t) => t.name === 'Transportation'),
    entertainment: tags.find((t) => t.name === 'Entertainment'),
    salary: tags.find((t) => t.name === 'Salary'),
    freelance: tags.find((t) => t.name === 'Freelance Work'),
    investments: tags.find((t) => t.name === 'Investments'),
  }

  // Log which tags were found
  console.log('\nTag mapping:')
  Object.entries(tagMap).forEach(([key, tag]) => {
    console.log(`  ${key}: ${tag ? `${tag.emoji} ${tag.name}` : 'NOT FOUND'}`)
  })

  // 5. Generate transactions for all months
  console.log('\nGenerating transactions...')

  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  const monthConfigs = getMonthConfigs()
  const allTransactions: Array<Transaction> = []

  for (const config of monthConfigs) {
    const { year, month } = getDateFromOffset(
      currentYear,
      currentMonth,
      config.monthOffset,
    )
    const monthName = new Date(year, month).toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
    })

    const monthTransactions = generateMonthTransactions(
      userId,
      year,
      month,
      tagMap,
      config,
    )

    if (config.specialCase) {
      console.log(
        `  ${monthName}: ${monthTransactions.length} transactions (${config.specialCase})`,
      )
    } else {
      console.log(`  ${monthName}: ${monthTransactions.length} transactions`)
    }

    allTransactions.push(...monthTransactions)
  }

  // 6. Insert all transactions
  console.log(`\nInserting ${allTransactions.length} transactions...`)

  // Insert in batches to avoid potential issues
  const batchSize = 50
  for (let i = 0; i < allTransactions.length; i += batchSize) {
    const batch = allTransactions.slice(i, i + batchSize)
    const { error: insertError } = await supabase
      .from('transactions')
      .insert(batch)

    if (insertError) {
      console.error('Error inserting transactions:', insertError)
      process.exit(1)
    }
  }

  // 7. Seed crypto data
  console.log('\nSeeding crypto portfolio data...')

  const storage: CryptoStorageSeed = {
    user_id: userId,
    type: 'wallet',
    name: 'Test Wallet',
    address: '0x1111111111111111111111111111111111111111',
    explorer_url:
      'https://etherscan.io/address/0x1111111111111111111111111111111111111111',
  }

  const { data: insertedStorage, error: storageError } = await supabase
    .from('crypto_storages')
    .insert(storage)
    .select()
    .single()

  if (storageError) {
    console.error('Error inserting crypto storage:', storageError)
    process.exit(1)
  }

  const cryptoAssets: Array<CryptoAssetSeed> = [
    {
      user_id: userId,
      coingecko_id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      icon_url: null,
    },
    {
      user_id: userId,
      coingecko_id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      icon_url: null,
    },
  ]

  const { data: insertedAssets, error: assetError } = await supabase
    .from('crypto_assets')
    .insert(cryptoAssets)
    .select()

  if (assetError) {
    console.error('Error inserting crypto assets:', assetError)
    process.exit(1)
  }

  const assetIdBySymbol = new Map(
    insertedAssets.map((asset) => [asset.symbol, asset.id]),
  )
  const todayDate = formatDate(
    currentYear,
    currentMonth,
    Math.min(today.getDate(), 28),
  )

  const { error: cryptoTxError } = await supabase
    .from('crypto_transactions')
    .insert([
      {
        user_id: userId,
        type: 'transfer_in',
        date: todayDate,
        asset_id: assetIdBySymbol.get('BTC'),
        amount: 0.15,
        storage_id: insertedStorage.id,
      },
      {
        user_id: userId,
        type: 'transfer_in',
        date: todayDate,
        asset_id: assetIdBySymbol.get('ETH'),
        amount: 1.75,
        storage_id: insertedStorage.id,
      },
    ])

  if (cryptoTxError) {
    console.error('Error inserting crypto transactions:', cryptoTxError)
    process.exit(1)
  }

  const { error: trackedAccountError } = await supabase
    .from('tracked_protocol_accounts')
    .insert({
      user_id: userId,
      protocol: 'aave-v3',
      network: 'ethereum',
      address: '0x000000000000000000000000000000000000dEaD',
    })

  if (trackedAccountError) {
    console.error(
      'Error inserting tracked protocol account:',
      trackedAccountError,
    )
    process.exit(1)
  }

  const snapshotBaseDate = addDays(today, -2)
  const snapshotDates = [0, 1, 2].map((offset) =>
    addDays(snapshotBaseDate, offset),
  )

  const portfolioSnapshots = snapshotDates.map((date, index) => ({
    user_id: userId,
    snapshot_date: date.toISOString().slice(0, 10),
    total_value_usd: 18000 + index * 750,
    spot_value_usd: 14000 + index * 500,
    aave_supplied_usd: 4000 + index * 250,
    aave_borrowed_usd: 900 + index * 150,
    allocations: {
      bitcoin: {
        percentage: 65,
        valueUsd: 11700 + index * 350,
      },
      ethereum: {
        percentage: 15,
        valueUsd: 2300 + index * 150,
      },
      'aave-v3-usdc': {
        percentage: 20,
        valueUsd: 4000 + index * 250,
      },
    },
  }))

  const { error: portfolioSnapshotError } = await supabase
    .from('crypto_portfolio_snapshots')
    .insert(portfolioSnapshots)

  if (portfolioSnapshotError) {
    console.error(
      'Error inserting crypto portfolio snapshots:',
      portfolioSnapshotError,
    )
    process.exit(1)
  }

  const netWorthSnapshots = snapshotDates.map((date, index) => ({
    user_id: userId,
    snapshot_date: date.toISOString().slice(0, 10),
    bank_balance: 220000000 + index * 8000000,
    crypto_value_vnd: 436050000 + index * 25500000,
    spot_crypto_value_vnd: 357000000 + index * 12750000,
    aave_supplied_value_vnd: 102000000 + index * 6375000,
    aave_borrowed_value_vnd: 22950000 + index * 3825000,
    net_crypto_value_vnd: 436050000 + index * 25500000,
    total_net_worth: 656050000 + index * 33500000,
    exchange_rate: 25500,
  }))

  const { error: netWorthSnapshotError } = await supabase
    .from('net_worth_snapshots')
    .insert(netWorthSnapshots)

  if (netWorthSnapshotError) {
    console.error('Error inserting net worth snapshots:', netWorthSnapshotError)
    process.exit(1)
  }

  // 8. Summary
  console.log('\n' + '='.repeat(50))
  console.log('Test data seeding complete!')
  console.log('='.repeat(50))
  console.log('')
  console.log('Summary:')
  console.log(`  Total transactions: ${allTransactions.length}`)
  console.log(`  Months covered: ${monthConfigs.length}`)
  console.log(
    `  Expense transactions: ${allTransactions.filter((t) => t.type === 'expense').length}`,
  )
  console.log(
    `  Income transactions: ${allTransactions.filter((t) => t.type === 'income').length}`,
  )
  console.log(
    `  Untagged transactions: ${allTransactions.filter((t) => t.tag_id === null).length}`,
  )
  console.log('')
  console.log('Special test periods:')
  console.log('  - Month -3: Single tag only (100% pie chart)')
  console.log('  - Month -7: All untagged transactions')
  console.log('  - Month -10: Empty (no transactions)')
  console.log('  - Month -14: Very low amounts')
  console.log('  - Current month: Includes tiny 5,000 VND expense (< 1% test)')
  console.log('')
  console.log('Test user credentials:')
  console.log(`  Email: ${TEST_USER.email}`)
  console.log(`  Password: ${TEST_USER.password}`)
  console.log('')
}

seedTestData().catch(console.error)
