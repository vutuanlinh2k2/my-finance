# Crypto Portfolio Feature Specification

## Overview

A comprehensive cryptocurrency portfolio tracking system integrated into the my-finance app. This feature allows users to track their crypto assets, storage locations (CEXs and wallets), and all related transactions. The system integrates with CoinGecko API for real-time price data and converts all values to VND using the existing exchange rate system.

**Key Integration Points:**
- CoinGecko API for crypto price data (returns USD)
- Existing USD→VND exchange rate converter for display
- Existing expense/income transaction system for Buy/Sell operations
- Supabase edge functions for daily portfolio snapshots

## User Stories

### Assets
- As a user, I want to add crypto assets by their CoinGecko ID so I can track their prices
- As a user, I want to auto-fetch asset metadata (name, symbol, icon) from CoinGecko
- As a user, I want to see my total portfolio value in VND
- As a user, I want to see value changes over 24h, 7d, and 30d periods
- As a user, I want to see allocation breakdown via pie chart
- As a user, I want to see historical allocation and value over time via charts
- As a user, I want to see a detailed table of all my assets with price metrics

### Storage
- As a user, I want to create storage locations (CEX or Wallet) to track where my crypto is stored
- As a user, I want to see how my portfolio is distributed across storage locations
- As a user, I want to click a storage and see all assets within it

### Transactions
- As a user, I want to record Buy transactions and have them auto-create expense items
- As a user, I want to record Sell transactions and have them auto-create income items
- As a user, I want to transfer assets between my storage locations
- As a user, I want to swap one asset for another
- As a user, I want to record transfer-in (airdrops, gifts) and transfer-out transactions
- As a user, I want to filter and paginate my transaction history

---

## Data Models

### CryptoAsset

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key (internal) |
| user_id | uuid | Owner user reference |
| coingecko_id | string | CoinGecko asset identifier |
| name | string | Asset name (e.g., "Bitcoin") |
| symbol | string | Asset symbol (e.g., "BTC") |
| icon_url | string? | URL to asset icon from CoinGecko |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

**Note:** Balance is calculated from transactions, not stored directly.

### CryptoStorage

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner user reference |
| type | 'cex' \| 'wallet' | Storage type |
| name | string | Storage name (e.g., "Binance", "MetaMask") |
| address | string? | Wallet address (required for wallet type) |
| explorer_url | string? | Block explorer URL (optional for wallet) |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### CryptoTransaction

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner user reference |
| type | enum | Transaction type (see below) |
| date | date | Transaction date |
| tx_id | string? | On-chain transaction ID |
| tx_explorer_url | string? | Link to block explorer |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |
| linked_transaction_id | uuid? | FK to transactions table (for Buy/Sell) |

**Transaction Type-Specific Fields:**

| Type | Additional Fields |
|------|-------------------|
| buy | asset_id, amount, storage_id, fiat_amount (VND paid) |
| sell | asset_id, amount, storage_id, fiat_amount (VND received) |
| transfer_between | asset_id, amount, from_storage_id, to_storage_id |
| swap | from_asset_id, from_amount, to_asset_id, to_amount, storage_id |
| transfer_in | asset_id, amount, storage_id |
| transfer_out | asset_id, amount, storage_id |

**Implementation Note:** Consider using a JSONB `details` column or separate junction tables for type-specific fields.

### CryptoPortfolioSnapshot (for historical charts)

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner user reference |
| date | date | Snapshot date |
| total_value_usd | numeric | Total portfolio value in USD |
| allocations | jsonb | Per-asset allocation data |
| created_at | timestamptz | Creation timestamp |

---

## API Endpoints / Functions

### CoinGecko Integration

**Fetch Asset Metadata:**
```typescript
async function fetchCoinGeckoAsset(coingeckoId: string): Promise<{
  id: string
  name: string
  symbol: string
  image: { small: string; large: string }
}>
```
- Endpoint: `https://api.coingecko.com/api/v3/coins/{id}`
- Cache aggressively - metadata rarely changes

**Fetch Price Data:**
```typescript
async function fetchCoinGeckoPrices(coingeckoIds: string[]): Promise<{
  [id: string]: {
    usd: number
    usd_24h_change: number
    usd_market_cap: number
  }
}>
```
- Endpoint: `https://api.coingecko.com/api/v3/simple/price`
- Query params: `ids={csv}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
- Stale time: ~60 seconds for price data

**Fetch Historical Prices (for price change columns):**
```typescript
async function fetchCoinGeckoMarketChart(
  coingeckoId: string,
  days: number
): Promise<{
  prices: [timestamp: number, price: number][]
}>
```
- Endpoint: `https://api.coingecko.com/api/v3/coins/{id}/market_chart`
- Query params: `vs_currency=usd&days={days}`
- Used for calculating 7d, 30d, 60d, 1y price changes

### Supabase API Functions

**Assets:**
- `fetchCryptoAssets()` - Get all user's assets
- `createCryptoAsset(input)` - Add new asset
- `deleteCryptoAsset(id)` - Remove asset

**Storages:**
- `fetchCryptoStorages()` - Get all user's storages
- `createCryptoStorage(input)` - Add new storage
- `updateCryptoStorage(id, updates)` - Edit storage
- `deleteCryptoStorage(id)` - Remove storage

**Transactions:**
- `fetchCryptoTransactions(filters)` - Get transactions with filters
- `createCryptoTransaction(input)` - Create transaction (handles linked expense/income)
- `updateCryptoTransaction(id, updates)` - Update transaction
- `deleteCryptoTransaction(id)` - Delete transaction (cascade deletes linked item)

**Calculated Data:**
- `calculateAssetBalances(transactions)` - Compute current balance per asset per storage
- `calculateStorageTotals(balances, prices, exchangeRate)` - Compute storage values in VND

---

## UI Components

### Sidebar Navigation

Add "Crypto" section to `app-sidebar.tsx`:
```
Crypto (collapsible)
├── Assets
├── Storage
└── Transactions
```

### Assets Page (`/crypto/assets`)

#### Header Section
- **Page Title**: "Crypto Assets" (top-left)
- **Add Asset Button**: Opens AddCryptoAssetModal (top-right)

#### AddCryptoAssetModal
- CoinGecko ID input with validation
- "Auto-fill Metadata" button (fetches name/symbol from CoinGecko)
- Name input (editable)
- Symbol input (editable)
- Cancel / Create buttons

#### Summary Cards (4 cards row)
1. **Total Value**: Current portfolio value in VND
2. **24h Change**: Value change with % and color indicator
3. **7d Change**: Value change with % and color indicator
4. **30d Change**: Value change with % and color indicator

**Display Pattern:**
```tsx
<span className="tooltip-fast" data-tooltip={formatCurrency(valueVND)}>
  {formatCompact(valueVND)}
</span>
```

#### Charts Section (flex row)

**Allocation Pie Chart** (1/3 width)
- Shows current portfolio allocation by asset
- Interactive segments (hover for details)
- Center label shows total value
- Color per asset (consistent across app)

**History Charts** (2/3 width, tabbed)
- Tab 1: **Allocation History** (stacked area chart)
  - Shows how allocation percentages changed over time
  - Hover shows allocation breakdown at that point
- Tab 2: **Total Value History** (line chart)
  - Shows total portfolio value over time in VND
- **Time Range Selector**: 7d, 30d, 60d, 1y, All

#### Assets Table

| Column | Description |
|--------|-------------|
| Asset | Icon + Symbol (e.g., [BTC] BTC) |
| Price | Current price in VND |
| 24h | % change with color |
| 7d | % change with color |
| 30d | % change with color |
| 60d | % change with color |
| 1y | % change with color |
| Market Cap | In VND (compact format) |
| Balance | User's holding amount |
| Value | Balance × Price in VND |
| % Portfolio | Allocation percentage |

- Sortable by any column
- Default sort: Value (descending)
- Click row: Could open detail view or expand inline

### Storage Page (`/crypto/storage`)

#### Header Section
- **Page Title**: "Crypto Storage" (top-left)
- **Add Storage Button**: Opens AddCryptoStorageModal (top-right)

#### AddCryptoStorageModal
- Type toggle: CEX / Wallet
- **CEX fields**: Name only (e.g., "Binance", "OKX")
- **Wallet fields**:
  - Address (required)
  - Name (optional, defaults to truncated address)
  - Explorer URL (optional)
- Cancel / Create buttons

#### Main Content (two-panel layout like Reports page)

**Left Panel** (50% width)
- **Storage Pie Chart**: Distribution of value across storages
- **Storage List**: Below the chart
  - Each item: Storage icon/type, name, total value, % of portfolio
  - Clickable to select
  - Selected item highlighted

**Right Panel** (50% width)
- Shows assets in selected storage
- Empty state if no selection
- List of assets sorted by value (descending):
  - Icon, Symbol, Balance, Price, Value

### Transactions Page (`/crypto/transactions`)

#### Header Section
- **Page Title**: "Crypto Transactions" (top-left)
- **Add Transaction Button**: Opens AddCryptoTransactionModal (top-right)

#### Filters Bar
- **Type Filter**: All, Buy, Sell, Transfer, Swap (multi-select or dropdown)
- **Date Range**: Start date, End date pickers
- **Clear Filters** button

#### AddCryptoTransactionModal

**Step 1: Select Transaction Type**
- 6 type buttons: Buy, Sell, Transfer Between, Swap, Transfer In, Transfer Out

**Step 2: Type-Specific Form**

| Type | Fields |
|------|--------|
| Buy | Asset (select), Amount, Storage (select), Fiat Amount (VND), Date, TX ID/URL |
| Sell | Asset (select), Amount, Storage (select), Fiat Amount (VND), Date, TX ID/URL |
| Transfer Between | Asset (select), Amount, From Storage, To Storage, Date, TX ID/URL |
| Swap | From Asset, From Amount, To Asset, To Amount, Storage, Date, TX ID/URL |
| Transfer In | Asset (select), Amount, Storage (select), Date, TX ID/URL |
| Transfer Out | Asset (select), Amount, Storage (select), Date, TX ID/URL |

**Buy/Sell Special Behavior:**
1. Before creating, check if "Investing" tag exists for appropriate type
2. If not: Show error toast "Please create an 'Investing' tag for [expense/income] first"
3. If exists: Create crypto transaction + linked expense/income transaction atomically

#### Transaction List

| Column | Description |
|--------|-------------|
| Date | Transaction date |
| Type | Badge with type (color-coded) |
| Details | Type-specific summary (see below) |
| TX ID/Link | Truncated ID or link icon |
| Actions | Edit, Delete buttons |

**Type-Specific Details Display:**
- **Buy**: "Bought 0.5 BTC for 250M" + storage icon
- **Sell**: "Sold 0.5 BTC for 300M" + storage icon
- **Transfer**: "0.5 BTC: Binance → Ledger"
- **Swap**: "0.5 BTC → 8.5 ETH" + storage icon
- **Transfer In**: "Received 0.5 BTC" + storage icon
- **Transfer Out**: "Sent 0.5 BTC" + storage icon

#### Edit Transaction Modal
- Same form as Add, pre-filled with existing data
- Save / Cancel buttons
- Delete button (with confirmation)

#### Pagination
- Page size: 20 items
- Page navigation at bottom

---

## State Management

### Query Keys

```typescript
export const queryKeys = {
  crypto: {
    assets: ['crypto', 'assets'] as const,
    storages: ['crypto', 'storages'] as const,
    transactions: {
      all: ['crypto', 'transactions'] as const,
      list: (filters: CryptoTransactionFilters) =>
        ['crypto', 'transactions', 'list', filters] as const,
    },
    prices: (assetIds: string[]) =>
      ['crypto', 'prices', assetIds.sort().join(',')] as const,
    portfolioHistory: (range: TimeRange) =>
      ['crypto', 'portfolio-history', range] as const,
  },
}
```

### Mutations with Optimistic Updates

- Create/Update/Delete assets: Invalidate `assets` query
- Create/Update/Delete storages: Invalidate `storages` query
- Create/Update/Delete transactions:
  - Invalidate `transactions` queries
  - Invalidate `assets` query (balance recalculation)
  - For Buy/Sell: Also invalidate main `transactions` query (for calendar)

---

## Currency Handling (CRITICAL)

All prices from CoinGecko are in USD. All display values must be in VND.

### Conversion Flow

```typescript
// 1. Fetch exchange rate
const { rate: exchangeRate } = useExchangeRateValue()

// 2. Fetch prices from CoinGecko (USD)
const { data: prices } = useCryptoPrices(assetIds)

// 3. Convert to VND for display
function convertUsdToVnd(usdAmount: number, exchangeRate: number): number {
  return Math.round(usdAmount * exchangeRate)
}

// 4. Format for display
const valueVnd = convertUsdToVnd(price * balance, exchangeRate)
<span className="tooltip-fast" data-tooltip={formatCurrency(valueVnd)}>
  {formatCompact(valueVnd)}
</span>
```

### Display Rules

1. **Always show VND** for user-facing values
2. **Use formatCompact()** for inline display
3. **Use formatCurrency()** for tooltips
4. **Show exchange rate source** indicator if using fallback rate
5. **Price changes** are percentages (no conversion needed)
6. **Market cap** should also be converted to VND

### Storage Considerations

- Store fiat amounts (Buy/Sell) in VND (user's input)
- Store crypto amounts as-is (decimals, e.g., 0.5 BTC)
- Never store converted USD→VND values (they become stale)

---

## Edge Cases

### Empty States
- [ ] No assets: "Add your first crypto asset to start tracking"
- [ ] No storages: "Add a storage location to organize your assets"
- [ ] No transactions: "Record your first transaction"
- [ ] No assets in storage: "No assets in this storage yet"
- [ ] Storage with zero balance: Show with 0 value

### Error States
- [ ] CoinGecko rate limit: Show cached prices with "Price data may be delayed" warning
- [ ] Invalid CoinGecko ID: Show error during asset creation
- [ ] Network failure: Show cached data with offline indicator
- [ ] Missing "Investing" tag: Block Buy/Sell with clear error message

### Edge Cases
- [ ] Very small balances (< 0.00001): Show in scientific notation or hide
- [ ] Very large values (> trillions VND): formatCompact handles this
- [ ] Negative balance (more sells than buys): Should not be possible with validation
- [ ] Swap with different storage: Not allowed (swap happens in one place)
- [ ] Delete storage with assets: Warn user, require moving assets first
- [ ] Delete asset with transactions: Warn user, cascade delete or block

### Data Integrity
- [ ] Transaction-derived balance: Sum of all transaction amounts
- [ ] Linked transaction sync: Buy/Sell ↔ expense/income always in sync
- [ ] Cascade deletes: Deleting crypto tx deletes linked expense/income

---

## Security Considerations

### Input Validation
- Validate CoinGecko ID format before API call
- Sanitize wallet addresses (prevent XSS)
- Sanitize explorer URLs using existing `sanitizeUrl()` utility
- Validate transaction amounts (positive numbers only)
- Validate fiat amounts for Buy/Sell (positive VND)

### Authorization
- All tables have RLS policies for user isolation
- Use `(SELECT auth.uid())` pattern for performance
- Validate user owns referenced assets/storages before transactions

### Rate Limiting
- Cache CoinGecko responses aggressively
- Implement client-side request queuing if hitting limits
- Use batch endpoints when possible (e.g., multi-coin price fetch)

---

## Supabase Edge Functions

### Daily Portfolio Snapshot

**Function:** `snapshot-crypto-portfolio`
**Schedule:** Daily at 00:00 UTC

**Logic:**
1. For each user with crypto assets:
   - Fetch current prices from CoinGecko
   - Calculate total portfolio value (USD)
   - Calculate per-asset allocations
   - Insert into `crypto_portfolio_snapshots` table
2. Prune snapshots older than 2 years (optional)

**Config (config.toml):**
```toml
[functions.snapshot-crypto-portfolio]
enabled = true

[[analytics.cron]]
name = "snapshot-crypto-portfolio"
schedule = "0 0 * * *"  # Daily at midnight UTC
command = "SELECT net.http_post(...)"
```

---

## Dependencies

### External Libraries (may need user approval)
- **recharts**: For pie charts, area charts, line charts (check if already used)
- No new libraries expected - leverage existing shadcn/ui components

### Internal Modules
- `@/lib/currency` - formatCompact, formatCurrency
- `@/lib/hooks/use-exchange-rate` - USD→VND rate
- `@/lib/api/transactions` - For linked Buy/Sell transactions
- `@/lib/api/tags` - For checking "Investing" tag existence
- `@/components/ui/*` - shadcn/ui components

---

## Implementation Notes

### Buy/Sell Transaction Flow

```typescript
async function createBuyTransaction(input: BuyTransactionInput) {
  // 1. Check for Investing expense tag
  const investingTag = tags.find(t =>
    t.name.toLowerCase() === 'investing' && t.type === 'expense'
  )
  if (!investingTag) {
    throw new Error('Please create an "Investing" tag for expenses first')
  }

  // 2. Create expense transaction first
  const expense = await createTransaction({
    type: 'expense',
    title: `Buy ${input.assetSymbol}`,
    amount: input.fiatAmount,
    date: input.date,
    tag_id: investingTag.id,
  })

  // 3. Create crypto transaction with link
  const cryptoTx = await createCryptoTransaction({
    type: 'buy',
    asset_id: input.assetId,
    amount: input.amount,
    storage_id: input.storageId,
    fiat_amount: input.fiatAmount,
    date: input.date,
    tx_id: input.txId,
    tx_explorer_url: input.txExplorerUrl,
    linked_transaction_id: expense.id,
  })

  return cryptoTx
}
```

### Balance Calculation

```typescript
function calculateAssetBalance(
  assetId: string,
  storageId: string | null, // null = all storages
  transactions: CryptoTransaction[]
): number {
  return transactions
    .filter(tx => {
      // Filter by asset
      const matchesAsset =
        tx.asset_id === assetId ||
        tx.from_asset_id === assetId ||
        tx.to_asset_id === assetId

      // Filter by storage if specified
      const matchesStorage = !storageId ||
        tx.storage_id === storageId ||
        tx.from_storage_id === storageId ||
        tx.to_storage_id === storageId

      return matchesAsset && matchesStorage
    })
    .reduce((balance, tx) => {
      switch (tx.type) {
        case 'buy':
        case 'transfer_in':
          return balance + tx.amount
        case 'sell':
        case 'transfer_out':
          return balance - tx.amount
        case 'transfer_between':
          if (tx.from_storage_id === storageId) return balance - tx.amount
          if (tx.to_storage_id === storageId) return balance + tx.amount
          return balance // If no storage filter, net zero
        case 'swap':
          if (tx.from_asset_id === assetId) return balance - tx.from_amount
          if (tx.to_asset_id === assetId) return balance + tx.to_amount
          return balance
        default:
          return balance
      }
    }, 0)
}
```

---

## Open Questions / Future Considerations

1. **Price History Caching**: Should we store historical prices in DB or always fetch from CoinGecko?
2. **Portfolio Snapshot Frequency**: Daily is proposed, but could be more/less frequent
3. **Multi-chain Support**: Should wallets support chain identification?
4. **Cost Basis Tracking**: For tax purposes, track purchase prices per lot (FIFO/LIFO)
5. **Profit/Loss Calculation**: Compare current value to total invested
6. **Export Functionality**: CSV export for tax reporting
