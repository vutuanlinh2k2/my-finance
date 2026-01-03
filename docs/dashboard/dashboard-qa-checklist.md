# Dashboard QA Testing Checklist

This checklist covers comprehensive quality assurance testing for the Dashboard feature. Each item must be verified before the feature can be considered complete.

## 1. Functional Requirements

### FR-1: Net Worth Summary Card

- [ ] **NW-01**: Net Worth card displays correctly formatted value using `formatCompact()`
- [ ] **NW-02**: Tooltip shows full value using `formatCurrency()` on hover
- [ ] **NW-03**: Net Worth = Bank Balance + Crypto Investment Value (calculation verified)
- [ ] **NW-04**: Bank Balance correctly calculates as All-time Income - All-time Expenses
- [ ] **NW-05**: Crypto Investment Value correctly fetched from crypto portfolio
- [ ] **NW-06**: Loading skeleton displays while data is being fetched
- [ ] **NW-07**: Shows "0" when user has no data (not empty state)
- [ ] **NW-08**: Updates automatically when transactions are added/edited/deleted
- [ ] **NW-09**: Updates automatically when crypto portfolio value changes

### FR-2: Monthly Income Card

- [ ] **MI-01**: Monthly Income card displays correctly formatted value using `formatCompact()`
- [ ] **MI-02**: Tooltip shows full value using `formatCurrency()` on hover
- [ ] **MI-03**: Value displayed in green/emerald color
- [ ] **MI-04**: Correctly calculates sum of all `type = 'income'` transactions for current month
- [ ] **MI-05**: "Current month" correctly determined based on system date
- [ ] **MI-06**: Shows "0" when no income transactions exist for current month
- [ ] **MI-07**: Loading skeleton displays while data is being fetched
- [ ] **MI-08**: Updates when new income transaction is added in current month

### FR-3: Monthly Expense Card

- [ ] **ME-01**: Monthly Expense card displays correctly formatted value using `formatCompact()`
- [ ] **ME-02**: Tooltip shows full value using `formatCurrency()` on hover
- [ ] **ME-03**: Value displayed in red/rose color
- [ ] **ME-04**: Correctly calculates sum of all `type = 'expense'` transactions for current month
- [ ] **ME-05**: "Current month" correctly determined based on system date
- [ ] **ME-06**: Shows "0" when no expense transactions exist for current month
- [ ] **ME-07**: Loading skeleton displays while data is being fetched
- [ ] **ME-08**: Updates when new expense transaction is added in current month

### FR-4: Net Worth Composition Pie Chart

- [ ] **PC-01**: Pie chart displays with two segments: Bank Balance and Crypto Investment
- [ ] **PC-02**: Bank Balance segment uses emerald/green color
- [ ] **PC-03**: Crypto Investment segment uses blue color
- [ ] **PC-04**: Hover tooltip shows segment name, amount (formatCurrency), and percentage
- [ ] **PC-05**: Percentages correctly calculated and add up to 100%
- [ ] **PC-06**: Center label displays "Net Worth" text
- [ ] **PC-07**: Loading skeleton/placeholder displays while data is being fetched
- [ ] **PC-08**: Empty state message shows when both values are 0
- [ ] **PC-09**: Shows 100% bank when user has no crypto investments
- [ ] **PC-10**: Handles negative bank balance appropriately (not shown in pie chart)

### FR-5: Net Worth History Line Chart

- [ ] **LC-01**: Line chart displays with date on X-axis and value on Y-axis
- [ ] **LC-02**: Time range selector shows options: 1m, 1y, All
- [ ] **LC-03**: Default time range is 1m (1 month)
- [ ] **LC-04**: Clicking "1m" button filters data to last 30 days
- [ ] **LC-05**: Clicking "1y" button filters data to last 365 days
- [ ] **LC-06**: Clicking "All" button shows all available data
- [ ] **LC-07**: Active time range button is visually distinct (selected state)
- [ ] **LC-08**: Hover shows tooltip with exact date and value
- [ ] **LC-09**: Line connects data points smoothly
- [ ] **LC-10**: Line uses primary brand color
- [ ] **LC-11**: Loading skeleton displays while data is being fetched
- [ ] **LC-12**: Empty state shows "No history available" for new users
- [ ] **LC-13**: Chart handles gaps in data gracefully (missing days)

### FR-6: Net Worth Snapshot System

- [ ] **SN-01**: Daily cron job creates one snapshot per user per day
- [ ] **SN-02**: Snapshot stores correct `bank_balance` value
- [ ] **SN-03**: Snapshot stores correct `crypto_value_vnd` value
- [ ] **SN-04**: Snapshot stores correct `total_net_worth` (sum of above)
- [ ] **SN-05**: Snapshot stores exchange rate used for crypto conversion
- [ ] **SN-06**: Users with no transactions get 0 for bank_balance
- [ ] **SN-07**: Users with no crypto get 0 for crypto_value_vnd
- [ ] **SN-08**: Edge function validates CRON_SECRET authentication
- [ ] **SN-09**: Duplicate snapshots prevented by unique constraint

---

## 2. Data Validation

### Zero Values

- [ ] **DV-01**: Net Worth card shows "0" when bank balance is 0 and no crypto
- [ ] **DV-02**: Monthly Income shows "0" when no income transactions in current month
- [ ] **DV-03**: Monthly Expense shows "0" when no expense transactions in current month
- [ ] **DV-04**: Pie chart shows appropriate empty state when net worth is 0
- [ ] **DV-05**: Line chart handles days with 0 net worth correctly

### Negative Values

- [ ] **DV-06**: Bank balance can be negative (expenses > income) - displays correctly
- [ ] **DV-07**: Negative bank balance shown with "-" prefix in card
- [ ] **DV-08**: Negative bank balance excluded from pie chart (only positive segments shown)
- [ ] **DV-09**: Line chart correctly displays negative net worth values

### Large Numbers

- [ ] **DV-10**: `formatCompact()` handles thousands correctly (e.g., 15000 -> "15K")
- [ ] **DV-11**: `formatCompact()` handles millions correctly (e.g., 1500000 -> "1.5M")
- [ ] **DV-12**: `formatCompact()` handles billions correctly (e.g., 1500000000 -> "1.5B")
- [ ] **DV-13**: `formatCurrency()` tooltip shows full value with proper separators
- [ ] **DV-14**: Chart Y-axis labels handle large numbers appropriately
- [ ] **DV-15**: Pie chart tooltip shows large numbers with proper formatting

### Data Types

- [ ] **DV-16**: All monetary values are numbers (not strings)
- [ ] **DV-17**: Dates are properly formatted in chart tooltips
- [ ] **DV-18**: Percentages in pie chart are valid numbers (0-100)

---

## 3. API Integration

### All-Time Totals API (`get_all_time_totals()`)

- [ ] **API-01**: RPC function returns `total_income`, `total_expenses`, `bank_balance`
- [ ] **API-02**: Returns correct values for authenticated user
- [ ] **API-03**: Returns zeros for user with no transactions
- [ ] **API-04**: Handles database errors gracefully with error state
- [ ] **API-05**: Only returns data for authenticated user (RLS enforced)

### Monthly Totals API (`get_monthly_totals()`)

- [ ] **API-06**: RPC function accepts year and month parameters
- [ ] **API-07**: Returns `total_income` and `total_expenses` for specified month
- [ ] **API-08**: Returns zeros for months with no transactions
- [ ] **API-09**: Correctly filters by year and month boundaries
- [ ] **API-10**: Handles invalid month values gracefully

### Net Worth Snapshots API

- [ ] **API-11**: `fetchNetWorthSnapshots()` accepts range parameter ('1m', '1y', 'all')
- [ ] **API-12**: Returns array of snapshot objects with correct structure
- [ ] **API-13**: Data sorted by date ascending
- [ ] **API-14**: Returns empty array for new users with no snapshots
- [ ] **API-15**: Filters data correctly based on time range
- [ ] **API-16**: Only returns snapshots for authenticated user

### Error Handling

- [ ] **API-17**: Network failure shows appropriate error message
- [ ] **API-18**: Authentication failure redirects to login
- [ ] **API-19**: Timeout errors handled gracefully
- [ ] **API-20**: Error states are recoverable (can retry)
- [ ] **API-21**: Partial data failure doesn't crash entire dashboard

---

## 4. State Management

### Query Keys

- [ ] **SM-01**: `dashboard.allTimeTotals` query key defined in `query-keys.ts`
- [ ] **SM-02**: `dashboard.monthlyTotals(year, month)` query key defined
- [ ] **SM-03**: `dashboard.netWorthHistory(range)` query key defined
- [ ] **SM-04**: Query keys are unique and don't conflict with existing keys

### Cache Invalidation

- [ ] **SM-05**: Adding a transaction invalidates all-time totals
- [ ] **SM-06**: Editing a transaction invalidates all-time totals
- [ ] **SM-07**: Deleting a transaction invalidates all-time totals
- [ ] **SM-08**: Adding a transaction in current month invalidates monthly totals
- [ ] **SM-09**: Crypto portfolio changes do not require invalidation (separate queries)

### Data Refresh

- [ ] **SM-10**: Data refreshes when navigating to dashboard page
- [ ] **SM-11**: Time range change triggers new data fetch for line chart
- [ ] **SM-12**: Stale data is replaced with fresh data on refetch
- [ ] **SM-13**: Loading states show correctly during refetch

### Hook Behavior

- [ ] **SM-14**: `useDashboardTotals()` hook returns loading state initially
- [ ] **SM-15**: `useDashboardTotals()` hook returns correct data structure
- [ ] **SM-16**: `useNetWorthHistory(range)` hook refetches when range changes
- [ ] **SM-17**: Hooks handle error states appropriately

---

## 5. Chart Functionality

### Pie Chart

- [ ] **CH-01**: Uses recharts `PieChart` component correctly
- [ ] **CH-02**: Segments are clickable for hover interaction (not navigation)
- [ ] **CH-03**: Tooltip appears on segment hover
- [ ] **CH-04**: Tooltip shows: segment name, amount in VND, percentage
- [ ] **CH-05**: Legend correctly identifies both segments
- [ ] **CH-06**: Colors match specification (emerald for bank, blue for crypto)
- [ ] **CH-07**: Donut chart with center label works correctly
- [ ] **CH-08**: Animation on initial render is smooth

### Line Chart

- [ ] **CH-09**: Uses recharts `LineChart` component correctly
- [ ] **CH-10**: X-axis shows dates with appropriate formatting
- [ ] **CH-11**: Y-axis shows values with formatCompact
- [ ] **CH-12**: Grid lines display for readability
- [ ] **CH-13**: Single data point renders correctly
- [ ] **CH-14**: Many data points (365+) render without performance issues
- [ ] **CH-15**: Chart is responsive to container width
- [ ] **CH-16**: Tooltip shows date and exact value on hover
- [ ] **CH-17**: Line animation on data change is smooth

### Time Range Switching

- [ ] **CH-18**: Clicking time range button updates active state immediately
- [ ] **CH-19**: Chart shows loading state during data fetch
- [ ] **CH-20**: Chart smoothly transitions to new data
- [ ] **CH-21**: Switching ranges rapidly doesn't cause race conditions
- [ ] **CH-22**: Back-to-back range changes show correct final data

### Chart Edge Cases

- [ ] **CH-23**: Chart handles single data point gracefully
- [ ] **CH-24**: Chart handles missing data points (gaps) in timeline
- [ ] **CH-25**: Chart handles all zero values
- [ ] **CH-26**: Chart handles very large value differences between points
- [ ] **CH-27**: Chart handles negative values in data

---

## 6. Edge Cases

### New User (No Data)

- [ ] **EC-01**: Dashboard loads successfully for new user
- [ ] **EC-02**: Net Worth shows "0"
- [ ] **EC-03**: Monthly Income shows "0"
- [ ] **EC-04**: Monthly Expense shows "0"
- [ ] **EC-05**: Pie chart shows empty state message
- [ ] **EC-06**: Line chart shows "No history available" message
- [ ] **EC-07**: No console errors or warnings

### User with Only Transactions (No Crypto)

- [ ] **EC-08**: Net Worth equals Bank Balance only
- [ ] **EC-09**: Pie chart shows 100% Bank Balance
- [ ] **EC-10**: Crypto segment not displayed or shows 0%
- [ ] **EC-11**: All cards display correctly

### User with Only Crypto (No Transactions)

- [ ] **EC-12**: Bank Balance shows 0
- [ ] **EC-13**: Net Worth equals Crypto Value only
- [ ] **EC-14**: Monthly Income and Expense show 0
- [ ] **EC-15**: Pie chart shows 100% Crypto Investment
- [ ] **EC-16**: Line chart displays crypto-only history

### Very Large Values (Billions)

- [ ] **EC-17**: Net Worth card displays "1.5B" format correctly
- [ ] **EC-18**: Tooltip shows full value "1.500.000.000 d"
- [ ] **EC-19**: Pie chart percentages calculate correctly with large values
- [ ] **EC-20**: Line chart Y-axis scales appropriately

### Exchange Rate Unavailable

- [ ] **EC-21**: Dashboard still loads when exchange rate API fails
- [ ] **EC-22**: Fallback exchange rate used for crypto conversion
- [ ] **EC-23**: Warning indicator shown for stale/fallback rate
- [ ] **EC-24**: Crypto values calculated using fallback rate

### Mixed Positive/Negative Scenarios

- [ ] **EC-25**: Expenses > Income (negative bank balance) displays correctly
- [ ] **EC-26**: Negative bank + positive crypto = correct net worth
- [ ] **EC-27**: All negative values handled without NaN or Infinity

---

## 7. Database and Snapshots

### Net Worth Snapshots Table

- [ ] **DB-01**: Table `net_worth_snapshots` exists with correct schema
- [ ] **DB-02**: Columns: id, user_id, snapshot_date, bank_balance, crypto_value_vnd, total_net_worth, exchange_rate, created_at
- [ ] **DB-03**: Primary key on `id` (uuid)
- [ ] **DB-04**: Foreign key on `user_id` references auth.users
- [ ] **DB-05**: Unique constraint on (user_id, snapshot_date)
- [ ] **DB-06**: All numeric columns use appropriate precision

### Row Level Security (RLS)

- [ ] **DB-07**: RLS enabled on net_worth_snapshots table
- [ ] **DB-08**: SELECT policy: users can only read their own snapshots
- [ ] **DB-09**: INSERT policy: service role only (cron job)
- [ ] **DB-10**: UPDATE policy: denied for all users
- [ ] **DB-11**: DELETE policy: denied for all users
- [ ] **DB-12**: Cross-user data access prevented (tested with multiple users)

### Snapshot Edge Function

- [ ] **DB-13**: Edge function `snapshot-net-worth` deployed correctly
- [ ] **DB-14**: Function validates CRON_SECRET header
- [ ] **DB-15**: Function processes all users in database
- [ ] **DB-16**: Function handles empty user portfolios
- [ ] **DB-17**: Function handles database errors gracefully
- [ ] **DB-18**: Function logs execution for monitoring

### Cron Job

- [ ] **DB-19**: pg_cron job created for daily execution
- [ ] **DB-20**: Job scheduled at appropriate time (midnight)
- [ ] **DB-21**: Job passes correct CRON_SECRET
- [ ] **DB-22**: Job execution logged in cron history
- [ ] **DB-23**: Job handles edge function errors

### Historical Data

- [ ] **DB-24**: Snapshots accumulate over multiple days
- [ ] **DB-25**: Old snapshots preserved (not overwritten)
- [ ] **DB-26**: Query performance acceptable with 1 year of data
- [ ] **DB-27**: Query performance acceptable with 5+ years of data

---

## 8. Currency Handling

### formatCompact()

- [ ] **CU-01**: 500 displays as "500d"
- [ ] **CU-02**: 15000 displays as "15K"
- [ ] **CU-03**: 150000 displays as "150K"
- [ ] **CU-04**: 1500000 displays as "1.5M"
- [ ] **CU-05**: 25000000 displays as "25M"
- [ ] **CU-06**: 1500000000 displays as "1.5B"
- [ ] **CU-07**: Negative values show "-" prefix correctly

### formatCurrency()

- [ ] **CU-08**: 150000000 displays as "150.000.000 d" in tooltip
- [ ] **CU-09**: Vietnamese locale formatting used (dots as separators)
- [ ] **CU-10**: Currency symbol "d" positioned correctly
- [ ] **CU-11**: Zero displays as "0 d"
- [ ] **CU-12**: Negative values display with "-" prefix

### VND Calculations

- [ ] **CU-13**: All bank transactions stored and calculated in VND
- [ ] **CU-14**: Net worth displayed in VND
- [ ] **CU-15**: Monthly totals displayed in VND
- [ ] **CU-16**: Pie chart percentages based on VND values

### USD to VND Conversion

- [ ] **CU-17**: Crypto values converted from USD to VND
- [ ] **CU-18**: Current exchange rate fetched from API
- [ ] **CU-19**: Exchange rate cached appropriately
- [ ] **CU-20**: Fallback rate used when API unavailable
- [ ] **CU-21**: Conversion calculation: USD amount * exchange rate = VND
- [ ] **CU-22**: Snapshot stores exchange rate used for historical accuracy

---

## 9. Performance

### Load Time

- [ ] **PF-01**: Dashboard initial load under 2 seconds
- [ ] **PF-02**: Charts render within 1 second of data load
- [ ] **PF-03**: Time range switch updates chart within 500ms

### Caching

- [ ] **PF-04**: TanStack Query caches dashboard data appropriately
- [ ] **PF-05**: Cached data used on subsequent navigation to dashboard
- [ ] **PF-06**: Stale-while-revalidate pattern working correctly

### Large Data Sets

- [ ] **PF-07**: 365 data points render smoothly in line chart
- [ ] **PF-08**: 1000+ data points don't freeze UI
- [ ] **PF-09**: Large transaction history doesn't slow aggregation

---

## 10. Accessibility

- [ ] **A11Y-01**: All cards have appropriate aria-labels
- [ ] **A11Y-02**: Charts have descriptive titles for screen readers
- [ ] **A11Y-03**: Time range buttons are keyboard accessible
- [ ] **A11Y-04**: Focus states visible on all interactive elements
- [ ] **A11Y-05**: Color is not the only indicator of information
- [ ] **A11Y-06**: Tooltips accessible via keyboard

---

## Testing Sign-Off

| Section | Tested By | Date | Status |
|---------|-----------|------|--------|
| Functional Requirements | | | |
| Data Validation | | | |
| API Integration | | | |
| State Management | | | |
| Chart Functionality | | | |
| Edge Cases | | | |
| Database & Snapshots | | | |
| Currency Handling | | | |
| Performance | | | |
| Accessibility | | | |

**Overall Status**: [ ] PASS / [ ] FAIL

**Notes**:
