# Dashboard Feature Specification

## Overview

The Dashboard is the main landing page of TLinh's Finance app, providing a comprehensive overview of the user's complete financial health. It displays the current net worth (combining bank account balance and crypto investments), monthly income/expense summaries, and visualizations showing net worth composition and historical trends.

## User Stories

- As a user, I want to see my total net worth at a glance so I can understand my overall financial position
- As a user, I want to see how much I earned and spent this month to track my current financial activity
- As a user, I want to see how my net worth is distributed between bank savings and crypto investments
- As a user, I want to see how my net worth has changed over time to understand my financial trajectory

## Functional Requirements

### FR-1: Net Worth Summary Card

- **Description**: Display the user's current total net worth
- **Calculation**: `Net Worth = Bank Account Balance + Crypto Investment Value`
  - Bank Account Balance = All-time income - All-time expenses (from transactions)
  - Crypto Investment Value = Total VND value of all crypto assets (from crypto feature)
- **Display**: Use `formatCompact()` with `formatCurrency()` tooltip
- **Acceptance Criteria**:
  - Shows 0 when user has no data
  - Updates when transactions or crypto values change
  - Displays loading skeleton while fetching data

### FR-2: Monthly Income Card

- **Description**: Display total income for the current month
- **Calculation**: Sum of all transactions where `type = 'income'` for current month
- **Display**: Use `formatCompact()` with green color, `formatCurrency()` tooltip
- **Acceptance Criteria**:
  - Shows 0 when no income transactions exist for current month
  - Correctly identifies "current month" based on system date

### FR-3: Monthly Expense Card

- **Description**: Display total expenses for the current month
- **Calculation**: Sum of all transactions where `type = 'expense'` for current month
- **Display**: Use `formatCompact()` with red color, `formatCurrency()` tooltip
- **Acceptance Criteria**:
  - Shows 0 when no expense transactions exist for current month
  - Correctly identifies "current month" based on system date

### FR-4: Net Worth Composition Pie Chart

- **Description**: Visual breakdown of how net worth is distributed
- **Segments**:
  - Bank Account Balance (color: emerald/green)
  - Crypto Investment (color: blue)
- **Interactions**:
  - Hover shows tooltip with segment name, amount, and percentage
  - No click navigation (informational only)
- **Center Label**: Show "Net Worth" label in center
- **Acceptance Criteria**:
  - Percentages add up to 100%
  - Handles edge cases: 100% bank (no crypto), 100% crypto (negative bank balance not shown)
  - Shows empty state when both values are 0

### FR-5: Net Worth History Line Chart

- **Description**: Time-series chart showing net worth changes over time
- **Time Ranges**: 1m (1 month), 1y (1 year), All
- **Data Source**: `net_worth_snapshots` table (new table with daily snapshots)
- **Display**:
  - X-axis: Date
  - Y-axis: Net worth value in VND
  - Line color: Primary brand color
  - Hover shows exact value and date
- **Acceptance Criteria**:
  - Smooth line connecting data points
  - Handles gaps in data gracefully
  - Shows empty state for new users with no history
  - Default time range: 1m

### FR-6: Net Worth Snapshot System

- **Description**: Daily cron job to capture net worth snapshots
- **Implementation**: Supabase Edge Function + pg_cron
- **Data Captured**:
  - `snapshot_date`: Date of snapshot
  - `bank_balance`: All-time income - all-time expenses
  - `crypto_value_vnd`: Total crypto portfolio value in VND
  - `total_net_worth`: Sum of above
  - `exchange_rate`: USD/VND rate used for crypto conversion
- **Schedule**: Daily at midnight (or configurable)
- **Acceptance Criteria**:
  - Creates one snapshot per user per day
  - Handles users with no transactions or no crypto gracefully
  - Stores values in VND for consistency

## Data Models

### Net Worth Snapshot (New Table)

| Field            | Type        | Description                             |
| ---------------- | ----------- | --------------------------------------- |
| id               | uuid        | Primary key                             |
| user_id          | uuid        | Foreign key to auth.users               |
| snapshot_date    | date        | Date of the snapshot                    |
| bank_balance     | numeric     | All-time income - expenses in VND       |
| crypto_value_vnd | numeric     | Total crypto value in VND               |
| total_net_worth  | numeric     | bank_balance + crypto_value_vnd         |
| exchange_rate    | numeric     | USD/VND rate used for crypto conversion |
| created_at       | timestamptz | When the snapshot was created           |

**Constraints**:

- Unique constraint on (user_id, snapshot_date) - one snapshot per user per day
- RLS policies for user isolation

### Aggregated Totals (Computed)

These are computed on-the-fly, not stored:

| Field           | Calculation                                            |
| --------------- | ------------------------------------------------------ |
| allTimeIncome   | SUM(amount) WHERE type = 'income'                      |
| allTimeExpenses | SUM(amount) WHERE type = 'expense'                     |
| bankBalance     | allTimeIncome - allTimeExpenses                        |
| monthlyIncome   | SUM(amount) WHERE type = 'income' AND month = current  |
| monthlyExpenses | SUM(amount) WHERE type = 'expense' AND month = current |

## API Layer

### Database Functions (RPC)

#### `get_all_time_totals()`

Returns all-time income and expense totals for the authenticated user.

```sql
RETURNS TABLE (
  total_income numeric,
  total_expenses numeric,
  bank_balance numeric
)
```

#### `get_monthly_totals(year int, month int)`

Returns income and expense totals for a specific month.

```sql
RETURNS TABLE (
  total_income numeric,
  total_expenses numeric
)
```

### Supabase API Functions

#### `src/lib/api/dashboard.ts`

```typescript
// Fetch all-time totals
fetchAllTimeTotals(): Promise<{ totalIncome: number; totalExpenses: number; bankBalance: number }>

// Fetch current month totals
fetchMonthlyTotals(year: number, month: number): Promise<{ income: number; expenses: number }>

// Fetch net worth snapshots for chart
fetchNetWorthSnapshots(range: '1m' | '1y' | 'all'): Promise<Array<NetWorthSnapshot>>
```

### Edge Function

#### `snapshot-net-worth/index.ts`

- Triggered by pg_cron daily
- For each user:
  1. Calculate bank balance from transactions
  2. Fetch crypto portfolio value
  3. Get current exchange rate
  4. Insert snapshot into `net_worth_snapshots`

## UI Components

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard (h1, top-left)                                    │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐       │
│ │  Net Worth    │ │ Monthly Income│ │Monthly Expense│       │
│ │   25.5M       │ │    +5.2M      │ │    -3.1M      │       │
│ └───────────────┘ └───────────────┘ └───────────────┘       │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐  ┌──────────────────────────────┐   │
│ │                     │  │  Net Worth History           │   │
│ │   Pie Chart         │  │  [1m] [1y] [All]             │   │
│ │   (Composition)     │  │                              │   │
│ │                     │  │  ~~~~ Line Chart ~~~~        │   │
│ │                     │  │                              │   │
│ └─────────────────────┘  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
src/components/dashboard/
├── dashboard-summary-cards.tsx    # 3 summary cards (net worth, income, expense)
├── net-worth-pie-chart.tsx        # Pie chart showing bank vs crypto split
├── net-worth-history-chart.tsx    # Line chart with time range selector
└── index.ts                       # Barrel export
```

### Component Details

#### `DashboardSummaryCards`

**Props**:

```typescript
interface DashboardSummaryCardsProps {
  netWorth: number
  monthlyIncome: number
  monthlyExpenses: number
  isLoading?: boolean
}
```

**States**:

- Loading: Show skeleton placeholders
- Loaded: Show formatted values
- Zero state: Show "0" (no special empty state)

#### `NetWorthPieChart`

**Props**:

```typescript
interface NetWorthPieChartProps {
  bankBalance: number
  cryptoValue: number
  isLoading?: boolean
}
```

**States**:

- Loading: Show skeleton/placeholder
- Has data: Show pie chart with two segments
- All zeros: Show empty chart with message

#### `NetWorthHistoryChart`

**Props**:

```typescript
interface NetWorthHistoryChartProps {
  isLoading?: boolean
}
```

**Internal State**:

- `timeRange`: '1m' | '1y' | 'all' (default: '1m')

**States**:

- Loading: Show skeleton
- Has data: Show line chart
- No data: Show empty state message

## State Management

### Query Keys

```typescript
// Add to src/lib/query-keys.ts
dashboard: {
  all: ['dashboard'] as const,
  allTimeTotals: ['dashboard', 'all-time-totals'] as const,
  monthlyTotals: (year: number, month: number) =>
    ['dashboard', 'monthly-totals', year, month] as const,
  netWorthHistory: (range: string) =>
    ['dashboard', 'net-worth-history', range] as const,
}
```

### Hooks

```typescript
// src/lib/hooks/use-dashboard.ts
useDashboardTotals() // Fetches all-time + monthly totals
useNetWorthHistory(range) // Fetches snapshots for chart
```

## Edge Cases

- [ ] User with no transactions: Show 0 for bank balance
- [ ] User with no crypto: Show 0 for crypto, 100% bank in pie chart
- [ ] User with negative bank balance: Still show in chart (can happen if expenses > income)
- [ ] No snapshots yet: Show empty chart with "No history available" message
- [ ] Exchange rate unavailable: Use fallback rate for crypto conversion
- [ ] Very large numbers: Ensure `formatCompact()` handles billions correctly

## Security Considerations

- RLS policies on `net_worth_snapshots` table for user isolation
- Edge function validates CRON_SECRET for scheduled execution
- All API functions use authenticated Supabase client
- No exposure of other users' financial data

## Dependencies

### External Libraries

- `recharts`: Already installed, used for pie and line charts

### Internal Modules

- `@/lib/currency`: formatCompact, formatCurrency
- `@/lib/hooks/use-crypto-assets`: For getting crypto portfolio value
- `@/lib/hooks/use-exchange-rate`: For USD/VND conversion
- `@/lib/api/transactions`: For monthly totals (reuse existing)

## Design References

- **Cards**: Follow `PortfolioSummaryCards` pattern from crypto page
- **Pie Chart**: Follow `DistributionPieChart` pattern from reports page
- **Line Chart**: Follow `ValueHistoryChart` pattern from crypto page
- **Time Range Selector**: Follow `PortfolioHistoryChart` pattern (tabs style)
