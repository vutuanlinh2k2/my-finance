# Crypto Portfolio Feature - QA/Logic Testing Checklist

This document provides a comprehensive QA checklist for testing the Crypto Portfolio feature. The feature consists of three pages (Assets, Storage, Transactions) with complex business logic for balance calculations, currency conversions, and linked transaction management.

---

## 1. Assets Page - Core Functionality

### 1.1 Page Access and Navigation

- [ ] User can navigate to `/crypto/assets` from sidebar
- [ ] Page loads successfully for authenticated users
- [ ] Unauthenticated users are redirected to login
- [ ] Browser back/forward navigation works correctly
- [ ] Sidebar shows "Crypto" section with collapsible sub-items (Assets, Storage, Transactions)

### 1.2 Header Section

- [ ] Page title "Crypto Assets" is displayed correctly (top-left)
- [ ] "Add Asset" button is visible in the header (top-right)
- [ ] "Add Asset" button has proper styling and is clickable
- [ ] Header layout is responsive on mobile/tablet/desktop

### 1.3 Summary Cards (4 Cards Row)

- [ ] All four summary cards are displayed: Portfolio Value, 24h Change, 7d Change, USD Rate
- [ ] Cards are properly aligned and spaced in a 4-column grid
- [ ] Portfolio Value shows total in VND using `formatCompact()`
- [ ] Portfolio Value tooltip shows full value using `formatCurrency()`
- [ ] 24h Change shows percentage with color indicator (green positive, red negative)
- [ ] 7d Change shows percentage with color indicator
- [ ] USD Rate card shows current exchange rate with source info tooltip
- [ ] USD Rate card shows "Offline" badge when using fallback/default rate
- [ ] Cards show "0" or appropriate empty state when no assets exist
- [ ] Cards show loading skeletons while fetching data
- [ ] Cards are responsive across different screen sizes

### 1.4 Charts Section

#### Allocation Pie Chart (1/3 Width)

- [ ] Pie chart displays current portfolio allocation by asset
- [ ] Each asset has a consistent color across the app
- [ ] Chart segments are interactive (hover for details)
- [ ] Center label shows total portfolio value
- [ ] Empty state shown when no assets exist
- [ ] Chart updates when assets or balances change
- [ ] Small allocations (< 1%) are visible or grouped as "Other"

#### History Charts (2/3 Width, Tabbed) - Placeholder for Phase 6

- [ ] Tab navigation between "Allocation" and "Total Value" is visible
- [ ] Default tab is "Allocation"
- [ ] Time range selector: 7d, 30d, 60d, 1y, All (all disabled)
- [ ] "Historical data coming soon" empty state displayed
- [ ] Empty state icon (ChartLine) is visible
- [ ] Subtitle explains "Portfolio snapshots will be collected daily"

**Note:** Full chart functionality will be implemented in Phase 6 when portfolio snapshots are available.

### 1.5 Assets Table

#### Column Display

- [ ] Asset column: Icon + Symbol (e.g., [BTC icon] BTC)
- [ ] Price column: Current price in VND (formatCompact with tooltip)
- [ ] 24h column: Percentage change with color (green/red)
- [ ] 7d column: Percentage change with color
- [ ] 30d column: Percentage change with color
- [ ] 60d column: Percentage change with color
- [ ] 1y column: Percentage change with color
- [ ] Market Cap column: In VND (compact format with tooltip)
- [ ] Balance column: User's holding amount (shows 0 until Phase 4)
- [ ] Value column: Balance x Price in VND
- [ ] % Portfolio column: Allocation percentage
- [ ] Actions column: Delete button (trash icon)

#### Table Behavior

- [ ] All columns display correct data from CoinGecko markets endpoint
- [ ] Delete button opens confirmation dialog (AlertDialog)
- [ ] Delete confirmation shows asset name
- [ ] Delete removes asset from table and updates summary cards
- [ ] Delete shows success toast "Asset removed from portfolio"
- [ ] Table is responsive (horizontal scroll on mobile)
- [ ] Empty state with "Add your first crypto asset" message when no assets
- [ ] Loading skeleton shown while fetching data
- [ ] Price data refreshes automatically (stale time ~60s)

**Note:** Sorting is planned but not yet implemented. Balance is 0 until transactions are implemented in Phase 4.

---

## 2. Add Crypto Asset Modal (Search-Based)

### 2.1 Modal Opening and Closing

- [ ] Modal opens when "Add Asset" button is clicked
- [ ] Modal has proper overlay/backdrop
- [ ] Modal is centered on screen
- [ ] Focus is trapped within modal
- [ ] Modal can be closed by clicking outside
- [ ] Modal can be closed by pressing Escape key
- [ ] Page scroll is locked when modal is open
- [ ] Cancel button closes modal without saving
- [ ] Form state resets when modal reopens

### 2.2 Search Input Field

- [ ] Search input field is present with magnifying glass icon
- [ ] Field has appropriate placeholder (e.g., "Search by name or symbol...")
- [ ] Search is debounced by 300ms
- [ ] Loading spinner appears in input while searching
- [ ] Search does not trigger until 2+ characters entered
- [ ] Search is case-insensitive

### 2.3 Search Results

- [ ] Results appear below input in a scrollable dropdown
- [ ] Each result shows coin icon, name, and symbol
- [ ] Results are clickable
- [ ] Hover state visible on result items
- [ ] "No results found" message when search returns empty
- [ ] Error message displayed when API fails
- [ ] Results disappear after coin selection

### 2.4 Coin Selection

- [ ] Clicking a result selects the coin
- [ ] Selected coin preview shows icon, name, symbol
- [ ] "Change" button appears to clear selection
- [ ] Name and Symbol fields become visible and are editable
- [ ] Fields are pre-populated with selected coin data
- [ ] Search input clears after selection

### 2.5 Name and Symbol Fields

- [ ] Name field is present and editable after selection
- [ ] Name is required for submission
- [ ] Symbol field is present and editable after selection
- [ ] Symbol is auto-uppercased on input
- [ ] Symbol is required for submission
- [ ] Trims leading/trailing whitespace

### 2.6 Form Submission

- [ ] "Add Asset" button submits the form
- [ ] Button is disabled when no coin is selected
- [ ] Button shows loading state during submission
- [ ] Toast error if no coin selected
- [ ] Toast error if name is empty
- [ ] Toast error if symbol is empty
- [ ] Duplicate asset shows toast error: "This asset has already been added to your portfolio"
- [ ] Success: Asset appears in table immediately
- [ ] Success: Modal closes after creation
- [ ] Success: Toast shows "Asset added to portfolio"
- [ ] Success: Summary cards and pie chart update

---

## 3. Storage Page - Core Functionality

### 3.1 Page Access and Layout

- [ ] User can navigate to `/crypto/storage` from sidebar
- [ ] Page title "Crypto Storage" is displayed correctly
- [ ] "Add Storage" button is visible in header
- [ ] Two-panel layout displays correctly (like Reports page)
- [ ] Left panel shows pie chart and storage list (50% width)
- [ ] Right panel shows selected storage details (50% width)
- [ ] Layout is responsive on different screen sizes

### 3.2 Storage Pie Chart

- [ ] Pie chart shows distribution of value across storages
- [ ] Each storage has a distinct color
- [ ] Chart segments are interactive (hover for details)
- [ ] Chart updates when storage contents change
- [ ] Empty state when no storages exist
- [ ] Storages with zero balance are shown appropriately

### 3.3 Storage List

- [ ] All user's storages are displayed below the chart
- [ ] Each item shows: Storage type icon, name, total value, % of portfolio
- [ ] Items are clickable to select
- [ ] Selected item is visually highlighted
- [ ] List updates when storages are added/edited/deleted
- [ ] Empty state prompts user to add first storage

### 3.4 Selected Storage Details (Right Panel)

- [ ] Empty state shown when no storage is selected
- [ ] Storage name and type displayed at top
- [ ] List of assets in selected storage shown
- [ ] Assets sorted by value (descending)
- [ ] Each asset shows: Icon, Symbol, Balance, Price, Value
- [ ] Total value of selected storage displayed
- [ ] Edit and Delete buttons for selected storage
- [ ] Asset list updates when transactions change balances

---

## 4. Add/Edit Crypto Storage Modal

### 4.1 Add Storage Modal

- [ ] Modal opens when "Add Storage" button is clicked
- [ ] Type toggle: CEX / Wallet is present
- [ ] Default type is appropriately set
- [ ] Type selection is mutually exclusive

### 4.2 CEX Type Fields

- [ ] When CEX is selected, only Name field is required
- [ ] Name field accepts common exchange names (Binance, OKX, etc.)
- [ ] Address and Explorer URL fields are hidden or disabled for CEX
- [ ] Name validation (required, max length)

### 4.3 Wallet Type Fields

- [ ] When Wallet is selected, Address field is required
- [ ] Address field accepts wallet address format
- [ ] Name field is optional (defaults to truncated address)
- [ ] Explorer URL field is optional
- [ ] Explorer URL is validated using `sanitizeUrl()`
- [ ] Invalid Explorer URL shows error

### 4.4 Edit Storage Modal

- [ ] Modal opens when Edit button is clicked on storage
- [ ] All fields are pre-populated with existing data
- [ ] Type cannot be changed (or shows warning if allowed)
- [ ] Changes are saved correctly
- [ ] Cancel discards changes
- [ ] Storage list and details update after edit

### 4.5 Delete Storage

- [ ] Delete button shows confirmation dialog
- [ ] Cannot delete storage that has assets in it
- [ ] Error message explains that assets must be moved first
- [ ] Empty storage can be deleted successfully
- [ ] Storage is removed from list after deletion
- [ ] Pie chart updates after deletion

---

## 5. Transactions Page - Core Functionality

### 5.1 Page Access and Layout

- [ ] User can navigate to `/crypto/transactions` from sidebar
- [ ] Page title "Crypto Transactions" is displayed correctly
- [ ] "Add Transaction" button is visible in header
- [ ] Filters bar is displayed below header
- [ ] Transaction list/table is displayed below filters
- [ ] Pagination is displayed at bottom (20 items per page)

### 5.2 Filters Bar

- [ ] Type filter dropdown: All, Buy, Sell, Transfer, Swap
- [ ] Type filter supports multi-select or single select
- [ ] Date range: Start date picker
- [ ] Date range: End date picker
- [ ] Clear Filters button resets all filters
- [ ] Filters persist in URL parameters
- [ ] Page reloads with filters applied from URL
- [ ] Filtering triggers data refresh
- [ ] Empty result shows appropriate message

### 5.3 Transaction List Display

| Column | Verification |
|--------|--------------|
| Date | - [ ] Transaction date displayed correctly |
| Type | - [ ] Badge with type name (color-coded) |
| Details | - [ ] Type-specific summary (see 5.4) |
| TX ID/Link | - [ ] Truncated ID or link icon if exists |
| Actions | - [ ] Edit and Delete buttons visible |

### 5.4 Type-Specific Details Display

- [ ] **Buy**: "Bought 0.5 BTC for 250M" + storage icon
- [ ] **Sell**: "Sold 0.5 BTC for 300M" + storage icon
- [ ] **Transfer Between**: "0.5 BTC: Binance -> Ledger"
- [ ] **Swap**: "0.5 BTC -> 8.5 ETH" + storage icon
- [ ] **Transfer In**: "Received 0.5 BTC" + storage icon
- [ ] **Transfer Out**: "Sent 0.5 BTC" + storage icon

### 5.5 Pagination

- [ ] 20 items per page
- [ ] Page navigation controls visible
- [ ] Current page indicator
- [ ] First/Last page navigation
- [ ] Previous/Next page navigation
- [ ] Correct total count displayed
- [ ] Pagination works with filters applied

---

## 6. Add Crypto Transaction Modal

### 6.1 Transaction Type Selection (Step 1)

- [ ] Modal opens when "Add Transaction" button is clicked
- [ ] Six type buttons displayed: Buy, Sell, Transfer Between, Swap, Transfer In, Transfer Out
- [ ] Each button has appropriate icon/styling
- [ ] Selecting type advances to Step 2
- [ ] Selected type is clearly indicated

### 6.2 Common Form Fields

- [ ] Date picker is present and required
- [ ] Date defaults to today
- [ ] Date cannot be in the future (if validated)
- [ ] TX ID field is optional
- [ ] TX Explorer URL field is optional
- [ ] TX Explorer URL is validated using `sanitizeUrl()`

### 6.3 Buy Transaction Form

- [ ] Asset dropdown shows user's assets
- [ ] Asset is required
- [ ] Amount field (crypto) is required
- [ ] Amount accepts decimal values (e.g., 0.5 BTC)
- [ ] Amount must be positive
- [ ] Storage dropdown shows user's storages
- [ ] Storage is required
- [ ] Fiat Amount field (VND) is required
- [ ] Fiat Amount must be positive
- [ ] Fiat Amount is stored in VND

### 6.4 Sell Transaction Form

- [ ] Asset dropdown shows user's assets
- [ ] Asset is required
- [ ] Amount field (crypto) is required
- [ ] Amount must be positive
- [ ] Amount cannot exceed available balance in selected storage
- [ ] Validation error when amount > balance
- [ ] Storage dropdown shows user's storages
- [ ] Storage is required
- [ ] Fiat Amount field (VND) is required
- [ ] Fiat Amount must be positive

### 6.5 Transfer Between Form

- [ ] Asset dropdown shows user's assets
- [ ] Asset is required
- [ ] Amount field is required and positive
- [ ] Amount cannot exceed balance in From Storage
- [ ] From Storage dropdown is required
- [ ] To Storage dropdown is required
- [ ] From and To Storage cannot be the same
- [ ] Validation error when From = To
- [ ] Both storages must be user's own storages

### 6.6 Swap Transaction Form

- [ ] From Asset dropdown shows user's assets
- [ ] From Asset is required
- [ ] From Amount is required and positive
- [ ] From Amount cannot exceed balance in storage
- [ ] To Asset dropdown shows user's assets
- [ ] To Asset is required
- [ ] From Asset and To Asset cannot be the same
- [ ] To Amount is required and positive
- [ ] Storage dropdown shows user's storages
- [ ] Storage is required (swap happens in one place)

### 6.7 Transfer In Form

- [ ] Asset dropdown shows user's assets
- [ ] Asset is required
- [ ] Amount is required and positive
- [ ] Storage dropdown shows user's storages
- [ ] Storage is required (destination)

### 6.8 Transfer Out Form

- [ ] Asset dropdown shows user's assets
- [ ] Asset is required
- [ ] Amount is required and positive
- [ ] Amount cannot exceed available balance in storage
- [ ] Validation error when amount > balance
- [ ] Storage dropdown shows user's storages
- [ ] Storage is required (source)

---

## 7. Buy/Sell Transaction Integration (CRITICAL)

### 7.1 Pre-Creation Tag Validation

- [ ] Before creating Buy: Check if "Investing" expense tag exists
- [ ] Before creating Sell: Check if "Investing" income tag exists
- [ ] Tag check is case-insensitive ("investing", "Investing", "INVESTING")
- [ ] Missing expense tag: Show error "Please create an 'Investing' tag for expenses first"
- [ ] Missing income tag: Show error "Please create an 'Investing' tag for income first"
- [ ] Transaction creation is blocked until tag exists
- [ ] Error message is clear and actionable

### 7.2 Buy Transaction - Linked Expense Creation

- [ ] Creating Buy transaction creates linked expense in main transactions table
- [ ] Expense title is "Buy {AssetSymbol}" (e.g., "Buy BTC")
- [ ] Expense amount equals fiat_amount (VND)
- [ ] Expense date matches crypto transaction date
- [ ] Expense type is 'expense'
- [ ] Expense tag_id is set to "Investing" expense tag
- [ ] Expense user_id matches current user
- [ ] linked_transaction_id on crypto tx points to expense id
- [ ] Both transactions created atomically (all or nothing)

### 7.3 Sell Transaction - Linked Income Creation

- [ ] Creating Sell transaction creates linked income in main transactions table
- [ ] Income title is "Sell {AssetSymbol}" (e.g., "Sell BTC")
- [ ] Income amount equals fiat_amount (VND)
- [ ] Income date matches crypto transaction date
- [ ] Income type is 'income'
- [ ] Income tag_id is set to "Investing" income tag
- [ ] Income user_id matches current user
- [ ] linked_transaction_id on crypto tx points to income id
- [ ] Both transactions created atomically

### 7.4 Linked Transaction Updates

- [ ] Editing Buy fiat_amount updates linked expense amount
- [ ] Editing Sell fiat_amount updates linked income amount
- [ ] Editing date updates linked transaction date
- [ ] Linked transaction title updates if asset changes (edge case)

### 7.5 Cascade Delete - Buy/Sell

- [ ] Deleting Buy crypto transaction deletes linked expense
- [ ] Deleting Sell crypto transaction deletes linked income
- [ ] Linked transaction is not orphaned
- [ ] Calendar page no longer shows deleted expense/income
- [ ] Monthly totals update correctly after cascade delete

### 7.6 Calendar Integration Verification

- [ ] Buy expense appears on calendar for transaction date
- [ ] Sell income appears on calendar for transaction date
- [ ] Amounts are displayed correctly in calendar view
- [ ] "Investing" tag is visible in transaction details
- [ ] Editing from calendar does NOT break crypto tx link (or is prevented)
- [ ] Deleting from calendar cascades correctly (or is prevented)

---

## 8. Balance Calculation (CRITICAL)

### 8.1 Balance Formula Verification

```
Balance = Sum of all transaction amounts for each asset
```

- [ ] Balance is calculated, not stored directly in database
- [ ] Balance is recalculated when transactions change
- [ ] Balance is per-asset, per-storage when storage is specified
- [ ] Balance is per-asset across all storages when no storage filter

### 8.2 Buy Transaction Effect

- [ ] Buy: Adds `amount` to asset balance in specified storage
- [ ] Example: Buy 0.5 BTC in Binance -> Binance BTC balance += 0.5
- [ ] Total asset balance also increases by 0.5

### 8.3 Sell Transaction Effect

- [ ] Sell: Subtracts `amount` from asset balance in specified storage
- [ ] Example: Sell 0.3 BTC from Binance -> Binance BTC balance -= 0.3
- [ ] Cannot sell more than available balance (validation)
- [ ] Total asset balance also decreases

### 8.4 Transfer Between Effect

- [ ] Transfer Between: Moves amount from one storage to another
- [ ] From Storage balance decreases by amount
- [ ] To Storage balance increases by amount
- [ ] Total asset balance remains the same (net zero)
- [ ] Example: Transfer 0.2 BTC from Binance to Ledger
  - [ ] Binance BTC: -0.2
  - [ ] Ledger BTC: +0.2
  - [ ] Total BTC: unchanged

### 8.5 Swap Transaction Effect

- [ ] Swap: Decreases from_asset, increases to_asset in same storage
- [ ] from_asset balance -= from_amount
- [ ] to_asset balance += to_amount
- [ ] Example: Swap 0.5 BTC -> 8.5 ETH in Binance
  - [ ] Binance BTC: -0.5
  - [ ] Binance ETH: +8.5
- [ ] Cannot swap more than available balance

### 8.6 Transfer In Effect

- [ ] Transfer In: Adds `amount` to asset balance in specified storage
- [ ] Used for airdrops, gifts, etc.
- [ ] No corresponding expense created (unlike Buy)
- [ ] Example: Receive 0.1 BTC airdrop in MetaMask
  - [ ] MetaMask BTC: +0.1

### 8.7 Transfer Out Effect

- [ ] Transfer Out: Subtracts `amount` from asset balance in specified storage
- [ ] Used for gifts, donations, etc.
- [ ] No corresponding income created (unlike Sell)
- [ ] Cannot transfer out more than available balance
- [ ] Example: Send 0.05 BTC as gift from MetaMask
  - [ ] MetaMask BTC: -0.05

### 8.8 Complex Balance Scenarios

- [ ] Multiple transactions on same asset: Correct cumulative balance
- [ ] Transactions across multiple storages: Correct per-storage balances
- [ ] Mixed transaction types: Correct final balance
- [ ] Chronological order doesn't affect final balance (sum-based)
- [ ] Deleting middle transaction recalculates correctly

### 8.9 Negative Balance Prevention

- [ ] Sell amount > balance: Shows validation error
- [ ] Transfer Out amount > balance: Shows validation error
- [ ] Transfer Between from amount > balance: Shows validation error
- [ ] Swap from amount > balance: Shows validation error
- [ ] Editing transaction to create negative balance: Prevented
- [ ] Deleting transaction that would create negative balance: Warn or allow

---

## 9. Currency Conversion (CRITICAL)

### 9.1 CoinGecko Price Data (USD)

- [ ] Prices fetched from CoinGecko are in USD
- [ ] Price data includes: current price, 24h change %, market cap
- [ ] Prices are cached with ~60 second stale time
- [ ] Multiple assets fetched in single batch request
- [ ] API response is validated before use

### 9.2 Exchange Rate Integration

- [ ] Exchange rate fetched from existing API (USD -> VND)
- [ ] Exchange rate uses 24-hour localStorage cache
- [ ] Fallback rate used when API unavailable
- [ ] Toast notification when using fallback rate
- [ ] Exchange rate source indicator shown (if using fallback)

### 9.3 USD to VND Conversion

```typescript
valueVnd = usdAmount * exchangeRate
```

- [ ] All displayed prices are in VND
- [ ] All displayed values are in VND
- [ ] Market cap is converted to VND
- [ ] Summary card totals are in VND
- [ ] Chart values are in VND
- [ ] Conversion is applied consistently across all pages

### 9.4 Display Formatting

- [ ] Use `formatCompact()` for inline display (e.g., "250M")
- [ ] Use `formatCurrency()` for tooltips (e.g., "250.000.000 d")
- [ ] tooltip-fast class applied for instant tooltip display
- [ ] Negative values formatted correctly (if applicable)
- [ ] Very large values use B suffix (billions)

### 9.5 Fiat Amount Handling

- [ ] Buy/Sell fiat_amount is user-input in VND
- [ ] fiat_amount is stored as VND in database
- [ ] No conversion needed for fiat_amount display
- [ ] fiat_amount is separate from calculated USD value

### 9.6 Crypto Amount Display

- [ ] Crypto amounts displayed as decimals (e.g., 0.5 BTC)
- [ ] Very small balances (< 0.00001) handled appropriately
- [ ] Scientific notation for extremely small values (if needed)
- [ ] Precision appropriate for each crypto (BTC: 8 decimals, etc.)

### 9.7 Price Change Percentages

- [ ] 24h, 7d, 30d, 60d, 1y changes are percentages
- [ ] Percentages do NOT need USD->VND conversion
- [ ] Positive changes shown in green
- [ ] Negative changes shown in red
- [ ] Zero change handled appropriately

---

## 10. Edit Transaction Modal

### 10.1 Modal Opening

- [ ] Modal opens when Edit button clicked on transaction
- [ ] Correct transaction data is loaded
- [ ] Transaction type is displayed (cannot be changed)
- [ ] All type-specific fields are pre-populated

### 10.2 Pre-populated Data by Type

#### Buy Transaction
- [ ] Asset shows selected asset
- [ ] Amount shows existing amount
- [ ] Storage shows existing storage
- [ ] Fiat Amount shows existing VND amount
- [ ] Date shows existing date
- [ ] TX ID/URL shows existing values

#### Sell Transaction
- [ ] Same as Buy with correct data

#### Transfer Between
- [ ] Asset shows selected asset
- [ ] Amount shows existing amount
- [ ] From Storage shows existing source
- [ ] To Storage shows existing destination
- [ ] Date shows existing date

#### Swap
- [ ] From Asset and To Asset shown
- [ ] From Amount and To Amount shown
- [ ] Storage shows existing storage
- [ ] Date shows existing date

#### Transfer In/Out
- [ ] Asset, Amount, Storage, Date shown correctly

### 10.3 Edit Validation

- [ ] All validation rules from Add apply
- [ ] Amount validation considers current balance
- [ ] Editing amount to exceed balance shows error
- [ ] Changing storage validates balance in new storage
- [ ] Cannot change transaction type

### 10.4 Linked Transaction Sync (Buy/Sell)

- [ ] Editing fiat_amount updates linked expense/income
- [ ] Editing date updates linked transaction date
- [ ] Changes are atomic (both update or neither)

### 10.5 Edit Actions

- [ ] Save button saves changes
- [ ] Cancel button discards changes
- [ ] Modal closes after successful save
- [ ] Transaction list updates with changes
- [ ] Asset balances recalculate
- [ ] Summary cards update if values changed

---

## 11. Delete Transaction

### 11.1 Delete Confirmation

- [ ] Delete button shows confirmation dialog
- [ ] Dialog explains consequences
- [ ] For Buy/Sell: Mentions linked expense/income will be deleted
- [ ] Cancel returns to list without deleting
- [ ] Confirm deletes the transaction

### 11.2 Post-Delete Behavior

- [ ] Transaction removed from list immediately
- [ ] Asset balances recalculate
- [ ] Summary cards update
- [ ] Charts update
- [ ] Linked expense/income deleted (Buy/Sell)
- [ ] Calendar page updates (Buy/Sell)
- [ ] Success message/toast shown

### 11.3 Cascade Delete Verification

- [ ] Buy: Linked expense transaction deleted
- [ ] Sell: Linked income transaction deleted
- [ ] No orphaned records in transactions table
- [ ] Query for linked_transaction_id returns empty

---

## 12. Data Validation

### 12.1 Required Fields

| Entity | Required Fields |
|--------|-----------------|
| Asset | coingecko_id, name, symbol |
| Storage (CEX) | type, name |
| Storage (Wallet) | type, address |
| Transaction (all) | type, date, asset_id, amount |
| Transaction (Buy/Sell) | storage_id, fiat_amount |
| Transaction (Transfer Between) | from_storage_id, to_storage_id |
| Transaction (Swap) | from_asset_id, from_amount, to_asset_id, to_amount, storage_id |
| Transaction (In/Out) | storage_id |

### 12.2 Field Validation Rules

- [ ] Amount: Positive number, allows decimals
- [ ] Fiat Amount: Positive integer (VND)
- [ ] Date: Valid date format, not future (if validated)
- [ ] CoinGecko ID: Valid format, exists in CoinGecko
- [ ] Wallet Address: Valid format (if validated)
- [ ] Explorer URLs: Valid URL format, sanitized

### 12.3 Referential Integrity

- [ ] asset_id must reference user's own asset
- [ ] storage_id must reference user's own storage
- [ ] from_storage_id/to_storage_id must reference user's storages
- [ ] from_asset_id/to_asset_id must reference user's assets
- [ ] linked_transaction_id must reference valid transaction (or null)

### 12.4 Type-Specific Constraints

- [ ] Swap: from_asset != to_asset
- [ ] Transfer Between: from_storage != to_storage
- [ ] Sell/Transfer Out/Swap: amount <= available balance
- [ ] Storage (Wallet): address is required

---

## 13. Error Handling

### 13.1 CoinGecko API Errors

- [ ] Invalid CoinGecko ID: Clear error message
- [ ] Rate limit (429): "Price data may be delayed" warning
- [ ] Network failure: Use cached prices with indicator
- [ ] Timeout: Retry mechanism or graceful degradation
- [ ] API response validation failure: Fallback behavior

### 13.2 Exchange Rate API Errors

- [ ] API unavailable: Use cached rate from localStorage
- [ ] Cache expired and API failed: Use fallback rate
- [ ] Toast notification for estimated/fallback rate
- [ ] Page still functional with fallback

### 13.3 Database Errors

- [ ] Network failure: Show user-friendly message
- [ ] Constraint violation: Show specific error
- [ ] Duplicate CoinGecko ID: "Asset already exists"
- [ ] Foreign key violation: "Referenced record not found"
- [ ] Concurrent modification: Handle gracefully

### 13.4 Validation Errors

- [ ] Form validation errors shown inline
- [ ] Error messages are clear and specific
- [ ] Multiple errors shown simultaneously
- [ ] Errors clear when corrected
- [ ] Submit button blocked until errors fixed

### 13.5 Loading States

- [ ] Page shows skeleton while loading
- [ ] Modals show loading during submission
- [ ] Price fetching shows loading indicator
- [ ] Chart shows loading while fetching history
- [ ] Empty state distinguished from loading state

---

## 14. Edge Cases

### 14.1 Empty States

- [ ] No assets: "Add your first crypto asset to start tracking"
- [ ] No storages: "Add a storage location to organize your assets"
- [ ] No transactions: "Record your first transaction"
- [ ] No assets in storage: "No assets in this storage yet"
- [ ] Storage with zero balance: Show with 0 value
- [ ] No historical data: Charts show empty state

### 14.2 Very Small Values

- [ ] Balance < 0.00001: Display appropriately
- [ ] Value < 1 VND: Show as < 1d or 0d
- [ ] Percentage < 0.01%: Show as < 0.01%
- [ ] Scientific notation for extremely small (optional)

### 14.3 Very Large Values

- [ ] Balance in millions of units: Display correctly
- [ ] Value in trillions of VND: Use "T" suffix or scientific
- [ ] Percentage calculations don't overflow
- [ ] Chart scales appropriately

### 14.4 Zero Values

- [ ] Asset with zero balance: Show in table
- [ ] Storage with zero value: Show in list
- [ ] 0% allocation: Display correctly
- [ ] 0% price change: Display as 0%

### 14.5 Special Characters

- [ ] Asset name with special characters: Display correctly
- [ ] Storage name with emojis: Display correctly
- [ ] TX ID with special characters: Display correctly
- [ ] XSS prevention: HTML entities escaped
- [ ] SQL injection prevention: Parameterized queries

### 14.6 Concurrent Operations

- [ ] Adding while deleting: No race conditions
- [ ] Multiple browser tabs: Data consistency
- [ ] Rapid operations: No duplicate submissions
- [ ] Optimistic updates: Rollback on failure

---

## 15. State Management

### 15.1 TanStack Query Cache

- [ ] Assets query uses correct query key
- [ ] Storages query uses correct query key
- [ ] Transactions query uses correct query key with filters
- [ ] Prices query uses sorted asset IDs as key
- [ ] Portfolio history query uses time range as key

### 15.2 Cache Invalidation

- [ ] Creating asset invalidates assets query
- [ ] Creating storage invalidates storages query
- [ ] Creating transaction invalidates:
  - [ ] transactions queries
  - [ ] assets query (balance recalc)
  - [ ] For Buy/Sell: main transactions query (calendar)
- [ ] Updating/Deleting triggers same invalidations

### 15.3 Optimistic Updates

- [ ] Create shows immediately before API confirms
- [ ] Update shows immediately before API confirms
- [ ] Delete removes immediately before API confirms
- [ ] Rollback on API failure
- [ ] Error toast on rollback

### 15.4 Stale Time Configuration

- [ ] Prices: ~60 seconds stale time
- [ ] Assets: Reasonable stale time
- [ ] Transactions: Reasonable stale time
- [ ] Exchange rate: Uses localStorage (24h TTL)

---

## 16. Security

### 16.1 Row Level Security (RLS)

- [ ] User can only see own assets
- [ ] User can only see own storages
- [ ] User can only see own transactions
- [ ] User cannot access other users' data via URL manipulation
- [ ] User cannot access other users' data via API calls

### 16.2 RLS Policy Performance

- [ ] Use `(SELECT auth.uid())` pattern in policies
- [ ] No function search path mutable warnings
- [ ] Security Advisor shows 0 errors, 0 warnings

### 16.3 Input Sanitization

- [ ] CoinGecko ID format validated
- [ ] Wallet addresses sanitized
- [ ] Explorer URLs use `sanitizeUrl()` utility
- [ ] TX Explorer URLs sanitized
- [ ] All user inputs escaped before display

### 16.4 Authorization Checks

- [ ] Validate user owns asset before transaction
- [ ] Validate user owns storage before transaction
- [ ] Validate user owns transaction before edit/delete
- [ ] Foreign key references verified at application level

---

## 17. Performance

### 17.1 Page Load Performance

- [ ] Initial page load under 3 seconds
- [ ] Time to interactive is reasonable
- [ ] Price fetching doesn't block page render
- [ ] Skeleton loading provides visual feedback

### 17.2 API Call Optimization

- [ ] Batch price fetch for multiple assets
- [ ] No N+1 queries for related data
- [ ] Exchange rate cached in localStorage
- [ ] CoinGecko metadata cached aggressively
- [ ] Pagination limits data per request

### 17.3 Chart Performance

- [ ] Charts render smoothly
- [ ] Large dataset handled efficiently
- [ ] Animation doesn't cause jank
- [ ] Responsive to window resize

### 17.4 Memory Management

- [ ] No memory leaks on modal open/close
- [ ] No memory leaks on page navigation
- [ ] Query cache size managed appropriately
- [ ] Large lists virtualized (if needed)

---

## 18. Snapshot Edge Function (Cron Job)

### 18.1 Function Configuration

- [ ] Edge function exists: `snapshot-crypto-portfolio`
- [ ] Function enabled in config.toml
- [ ] Cron schedule: Daily at 00:00 UTC
- [ ] CRON_SECRET environment variable configured

### 18.2 Authorization

- [ ] Function validates Authorization header
- [ ] Unauthorized requests return 401
- [ ] Only accepts Bearer token with CRON_SECRET

### 18.3 Snapshot Logic

- [ ] For each user with crypto assets:
  - [ ] Fetch current prices from CoinGecko
  - [ ] Calculate total portfolio value (USD)
  - [ ] Calculate per-asset allocations
  - [ ] Insert into crypto_portfolio_snapshots table
- [ ] user_id correctly set
- [ ] date is current date
- [ ] total_value_usd is accurate
- [ ] allocations JSONB contains correct data

### 18.4 Error Handling

- [ ] CoinGecko API failure: Log error, skip user, continue
- [ ] Database insert failure: Log error, continue with others
- [ ] Partial failure doesn't stop entire job
- [ ] Errors are logged for monitoring

### 18.5 Data Accuracy

- [ ] Snapshot values match calculated values at time of snapshot
- [ ] Allocations sum to 100% (or close, accounting for rounding)
- [ ] Historical chart uses snapshot data correctly
- [ ] No duplicate snapshots for same user/date

### 18.6 Cleanup (Optional)

- [ ] Snapshots older than 2 years pruned (if implemented)
- [ ] Pruning doesn't affect data integrity
- [ ] Pruning runs as part of cron or separately

---

## 19. Integration Tests

### 19.1 End-to-End User Flows

- [ ] New user adds first asset via CoinGecko ID
- [ ] User creates CEX storage (e.g., Binance)
- [ ] User creates Wallet storage with address
- [ ] User creates Buy transaction (with linked expense)
- [ ] User creates Sell transaction (with linked income)
- [ ] User creates Transfer Between transaction
- [ ] User creates Swap transaction
- [ ] User creates Transfer In transaction
- [ ] User creates Transfer Out transaction
- [ ] User edits transaction and verifies changes
- [ ] User deletes transaction and verifies removal

### 19.2 Cross-Feature Integration

- [ ] Buy transaction expense appears on calendar
- [ ] Sell transaction income appears on calendar
- [ ] Deleting crypto tx removes calendar entry
- [ ] "Investing" tag visible in calendar transaction
- [ ] Monthly totals include crypto Buy/Sell transactions
- [ ] Reports page includes crypto-related income/expenses

### 19.3 Data Flow Verification

- [ ] Add asset -> Appears in Assets table
- [ ] Add transaction -> Balance updates
- [ ] Add transaction -> Summary cards update
- [ ] Add transaction -> Charts update
- [ ] Edit transaction -> All related data updates
- [ ] Delete transaction -> All related data updates

---

## 20. Browser Compatibility

### 20.1 Supported Browsers

- [ ] Chrome (latest) - all features work
- [ ] Firefox (latest) - all features work
- [ ] Safari (latest) - all features work
- [ ] Edge (latest) - all features work

### 20.2 Browser-Specific Issues

- [ ] Date picker works consistently
- [ ] Number input behavior consistent
- [ ] Charts render correctly
- [ ] Modal positioning correct
- [ ] CSS renders correctly

---

## Test Data Requirements

### Sample Assets

1. Bitcoin (coingecko_id: "bitcoin", symbol: BTC)
2. Ethereum (coingecko_id: "ethereum", symbol: ETH)
3. Solana (coingecko_id: "solana", symbol: SOL)
4. Stablecoin (coingecko_id: "tether", symbol: USDT)

### Sample Storages

1. CEX: "Binance"
2. CEX: "OKX"
3. Wallet: "MetaMask" with address
4. Wallet: "Ledger" with address and explorer URL

### Sample Transactions

1. Buy 0.5 BTC for 500,000,000 VND in Binance
2. Sell 0.1 BTC for 120,000,000 VND from Binance
3. Transfer 0.2 BTC from Binance to Ledger
4. Swap 0.1 BTC to 1.5 ETH in Binance
5. Transfer In 0.05 BTC (airdrop) to MetaMask
6. Transfer Out 0.01 BTC (gift) from MetaMask
7. Buy 2 ETH for 100,000,000 VND in OKX
8. Transfer 1 ETH from OKX to MetaMask

### Required Setup

- [ ] Test user account with authentication
- [ ] "Investing" expense tag exists
- [ ] "Investing" income tag exists
- [ ] Exchange rate API accessible
- [ ] CoinGecko API accessible
- [ ] Database in clean state before each test run

---

## Checklist Summary

| Category | Total Items |
|----------|-------------|
| Assets Page | ~50 |
| Storage Page | ~30 |
| Transactions Page | ~40 |
| Add Asset Modal | ~25 |
| Add/Edit Storage Modal | ~20 |
| Add Transaction Modal | ~50 |
| Buy/Sell Integration | ~30 |
| Balance Calculation | ~35 |
| Currency Conversion | ~25 |
| Edit/Delete Transaction | ~25 |
| Data Validation | ~25 |
| Error Handling | ~20 |
| Edge Cases | ~25 |
| State Management | ~20 |
| Security | ~15 |
| Performance | ~15 |
| Snapshot Edge Function | ~20 |
| Integration Tests | ~20 |
| Browser Compatibility | ~10 |
| **Total** | **~500** |

---

## Notes for Testers

1. **Balance Calculation is Critical**: The core value proposition is accurate balance tracking. Test all transaction types thoroughly.

2. **Buy/Sell Integration is Complex**: These transactions create linked records. Verify both sides of the link for every operation.

3. **Currency Conversion is Everywhere**: Every displayed value should be in VND. Verify conversion is applied consistently.

4. **Tag Dependency**: Buy/Sell requires "Investing" tags. Create these first in test setup.

5. **Cascade Deletes**: Deleting crypto Buy/Sell transactions should delete linked main transactions. Verify this doesn't break calendar/reports.

6. **Negative Balance Prevention**: The system should prevent any operation that would result in negative balance.

7. **Exchange Rate Fallback**: Test behavior when exchange rate API is unavailable.

8. **CoinGecko Rate Limits**: Test behavior when CoinGecko returns 429 (rate limited).
