# Crypto Portfolio Feature - Implementation Progress

## Overview

| Phase   | Description                                       | Status   |
| ------- | ------------------------------------------------- | -------- |
| Phase 1 | Project Setup & CoinGecko API                     | Complete |
| Phase 2 | Assets Page (incl. DB migration)                  | Complete |
| Phase 3 | Storage Page (incl. DB migration)                 | Complete |
| Phase 4 | Transactions Page - Basic UI (incl. DB migration) | Complete |
| Phase 5 | Transaction Types Logic                           | Complete |
| Phase 6 | Charts & Historical Data (incl. DB migration)     | Complete |
| Phase 7 | Edge Function (Daily Snapshots)                   | Complete |
| Phase 8 | Testing & Polish                                  | Pending  |

**Note:** Database schema is created incrementally with each feature phase. This allows us to validate each table design with real usage before building dependent features.

---

## Phase 1: Project Setup & CoinGecko API

### Goal

Set up the project structure, create shared types, and implement CoinGecko API integration.

### Summary

Set up the foundational project structure for the crypto portfolio feature. Created folder structure, added sidebar navigation with Crypto section (Assets, Storage, Transactions links), implemented CoinGecko API integration with rate limit handling, created React Query hooks for data fetching, and defined shared TypeScript types and utility functions.

### Success Criteria

- [x] Crypto folder structure created
- [x] CoinGecko API functions work
- [x] Sidebar navigation added (links won't work yet)
- [x] Shared TypeScript types defined

### Implementation Steps

#### Step 1.1: Create Folder Structure

- [x] Create `src/lib/crypto/` directory
- [x] Create `src/components/crypto/` directory
- [x] Create placeholder route files

#### Step 1.2: Sidebar Navigation

- [x] Edit `src/components/app-sidebar.tsx`
- [x] Add collapsible "Crypto" section
- [x] Add links: Assets, Storage, Transactions (routes created later)

#### Step 1.3: Shared TypeScript Types

- [x] Create `src/lib/crypto/types.ts`
- [x] Define `CryptoTransactionType` enum
- [x] Define shared interfaces (will be extended per phase)

#### Step 1.4: CoinGecko API Functions

- [x] Create `src/lib/api/coingecko.ts`
- [x] Implement `fetchCoinGeckoAssetMetadata(id)` - get name, symbol, icon
- [x] Implement `fetchCoinGeckoPrices(ids[])` - batch price fetch
- [x] Implement `fetchCoinGeckoMarketData(id, days)` - historical prices
- [x] Add error handling for rate limits (429)

#### Step 1.5: CoinGecko Query Hooks

- [x] Create `src/lib/hooks/use-coingecko.ts`
- [x] Implement `useCoinGeckoAsset(id)` - metadata fetch
- [x] Implement `useCryptoPrices(ids[])` - batch prices
- [x] Configure staleTime (60s for prices, longer for metadata)

#### Step 1.6: Crypto Utilities

- [x] Create `src/lib/crypto/utils.ts`
- [x] Implement `convertUsdToVnd(usdAmount, exchangeRate)`
- [x] Implement `formatCryptoAmount(amount, symbol)` - handles decimals

#### Step 1.7: Update Query Keys

- [x] Update `src/lib/query-keys.ts` with crypto keys

### Files Created/Modified

| Action   | File                             |
| -------- | -------------------------------- |
| Created  | `src/lib/crypto/types.ts`        |
| Created  | `src/lib/crypto/utils.ts`        |
| Created  | `src/lib/api/coingecko.ts`       |
| Created  | `src/lib/hooks/use-coingecko.ts` |
| Modified | `src/components/app-sidebar.tsx` |
| Modified | `src/lib/query-keys.ts`          |

---

## Phase 2: Assets Page (incl. DB Migration)

### Goal

Create the `crypto_assets` table and build the complete Assets page with all components.

### Summary

Created the `crypto_assets` database table with RLS policies, built the complete Assets page with all UI components. Implemented CoinGecko search integration for adding assets, portfolio summary cards showing total value and price changes, allocation pie chart with interactive tooltips, and a sortable assets table. All values display in VND using the existing exchange rate integration.

### Success Criteria

- [x] `crypto_assets` table created with RLS
- [x] Route accessible at `/crypto/assets`
- [x] Add Asset modal works with CoinGecko search (search-based UI instead of ID input)
- [x] Summary cards show portfolio value, 24h/7d change percentages, and USD exchange rate
- [x] Pie chart shows allocation (empty state until transactions implemented)
- [x] Table displays all assets with price data from CoinGecko markets endpoint
- [x] All values display in VND
- [x] History charts placeholder created (functional in Phase 6)

### Implementation Steps

#### Step 2.1: Database Migration - crypto_assets

- [x] Create `supabase/migrations/20260102100000_create_crypto_assets.sql`

**Schema:**

```sql
-- Crypto Assets
CREATE TABLE public.crypto_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coingecko_id TEXT NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  icon_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, coingecko_id)
);

-- RLS Policies
ALTER TABLE public.crypto_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crypto_assets_select_own" ON public.crypto_assets
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "crypto_assets_insert_own" ON public.crypto_assets
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "crypto_assets_update_own" ON public.crypto_assets
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "crypto_assets_delete_own" ON public.crypto_assets
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Index
CREATE INDEX idx_crypto_assets_user ON public.crypto_assets(user_id);
```

- [x] Run `pnpm db:reset` (applies migrations)
- [x] Run `pnpm db:types`
- [x] Verify Security Advisor → 0 errors/warnings

#### Step 2.2: Update TypeScript Types

- [x] Update `src/lib/crypto/types.ts` with `CryptoAsset` type
- [x] Define input/update types

#### Step 2.3: Create Route

- [x] Create `src/routes/_authenticated/crypto/assets.tsx`
- [x] Set up basic page layout

#### Step 2.4: Create API Layer

- [x] Create `src/lib/api/crypto-assets.ts`
- [x] Implement `fetchCryptoAssets()`
- [x] Implement `createCryptoAsset(input)`
- [x] Implement `deleteCryptoAsset(id)`

#### Step 2.5: Create Hooks

- [x] Create `src/lib/hooks/use-crypto-assets.ts`
- [x] Implement `useCryptoAssets()` query
- [x] Implement `useCreateCryptoAsset()` mutation
- [x] Implement `useDeleteCryptoAsset()` mutation

#### Step 2.6: Add Asset Modal (Search-Based)

- [x] Create `src/components/crypto/add-asset-modal.tsx`
- [x] CoinGecko search input with 300ms debounce
- [x] Search results list with icons (using `searchCoinGeckoCoins` API)
- [x] Click to select coin and auto-fill Name/Symbol/Icon
- [x] Selected coin preview with "Change" button
- [x] Name and Symbol fields editable after selection
- [x] Form validation (requires selection, name, symbol)
- [x] Submit handler with loading state

#### Step 2.7: Summary Cards

- [x] Create `src/components/crypto/portfolio-summary-cards.tsx`
- [x] Portfolio Value card (total value in VND with formatCompact/formatCurrency tooltip)
- [x] 24h Change card (percentage with green/red color coding)
- [x] 7d Change card (percentage with green/red color coding)
- [x] USD Rate card (exchange rate with source indicator and offline badge)
- [x] Loading skeletons for all cards

#### Step 2.8: Allocation Pie Chart

- [x] Create `src/components/crypto/allocation-pie-chart.tsx`
- [x] Use recharts PieChart
- [x] Interactive segments with hover tooltips
- [x] Center label with total value

#### Step 2.9: Assets Table

- [x] Create `src/components/crypto/assets-table.tsx`
- [x] Columns: Asset (icon + symbol), Price, 24h, 7d, 30d, 60d, 1y, Market Cap, Balance, Value, % Portfolio, Actions
- [x] VND formatting with tooltips (formatCompact/formatCurrency)
- [x] Price change colors (green/red for positive/negative percentages)
- [x] Loading skeleton
- [x] Empty state
- [x] Delete action with confirmation dialog

**Note:** Balance column shows 0 until transactions are implemented in Phase 4. Uses `useCryptoMarkets` hook for extended price change data.

#### Step 2.10: History Charts Placeholder

- [x] Create `src/components/crypto/portfolio-history-chart.tsx`
- [x] Tab interface (Allocation / Total Value) - UI only
- [x] Time range selector (7d, 30d, 60d, 1y, All) - disabled
- [x] "Coming soon" empty state with icon

**Note:** This is a placeholder component. Full functionality will be implemented in Phase 6 when portfolio snapshots are available.

#### Step 2.11: Wire Up Page

- [x] Import all components
- [x] Fetch data with hooks (useCryptoAssets, useCryptoMarkets, useExchangeRateValue)
- [x] Integrate CoinGecko market data for prices and changes
- [x] Pass exchange rate for VND conversion
- [x] Handle loading/error/empty states
- [x] Delete confirmation dialog with AlertDialog component

#### Step 2.12: Visual Testing

- [x] Test in browser with Playwright
- [x] Verify page layout and components render correctly
- [x] Verify CoinGecko search works
- [x] Verify summary cards display
- [x] Verify empty state works

### Files Created/Modified

| Action   | File                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| Created  | `supabase/migrations/20260102100000_create_crypto_assets.sql`                      |
| Created  | `src/routes/_authenticated/crypto/assets.tsx`                                      |
| Created  | `src/lib/api/crypto-assets.ts`                                                     |
| Created  | `src/lib/hooks/use-crypto-assets.ts`                                               |
| Created  | `src/components/crypto/add-asset-modal.tsx`                                        |
| Created  | `src/components/crypto/portfolio-summary-cards.tsx`                                |
| Created  | `src/components/crypto/allocation-pie-chart.tsx`                                   |
| Created  | `src/components/crypto/assets-table.tsx`                                           |
| Created  | `src/components/crypto/portfolio-history-chart.tsx` (placeholder)                  |
| Created  | `src/components/crypto/index.ts`                                                   |
| Modified | `src/lib/crypto/types.ts` (added CryptoAsset, CryptoAssetWithPrice)                |
| Modified | `src/lib/api/coingecko.ts` (added search, markets endpoints)                       |
| Modified | `src/lib/hooks/use-coingecko.ts` (added useCryptoMarkets, useCoinGeckoSearch)      |
| Modified | `src/lib/query-keys.ts` (added crypto.assets, coingecko.markets, coingecko.search) |
| Modified | `src/types/database.ts` (auto-generated)                                           |

---

## Phase 3: Storage Page (incl. DB Migration)

### Goal

Create the `crypto_storages` table and build the complete Storage page with two-panel layout.

### Summary

Created the `crypto_storages` database table with RLS policies, built the complete Storage page with two-panel layout. Implemented Add Storage modal with CEX/Wallet type toggle and conditional fields. Built storage pie chart with click-to-select functionality, storage list with type icons and selection highlighting, and storage assets panel showing holdings per storage. Selection state is persisted in URL search params. All values display in VND with proper formatting.

### Success Criteria

- [x] `crypto_storages` table created with RLS
- [x] Route accessible at `/crypto/storage`
- [x] Add Storage modal works (CEX/Wallet toggle)
- [x] Left panel shows pie chart + storage list
- [x] Right panel shows assets in selected storage
- [x] Selection state persisted in URL

### Implementation Steps

#### Step 3.1: Database Migration - crypto_storages

- [x] Create `supabase/migrations/20260102150000_create_crypto_storages.sql`

**Schema:**

```sql
-- Crypto Storages
CREATE TABLE public.crypto_storages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cex', 'wallet')),
  name TEXT NOT NULL,
  address TEXT, -- Required for wallet type
  explorer_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.crypto_storages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crypto_storages_select_own" ON public.crypto_storages
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "crypto_storages_insert_own" ON public.crypto_storages
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "crypto_storages_update_own" ON public.crypto_storages
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "crypto_storages_delete_own" ON public.crypto_storages
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Index
CREATE INDEX idx_crypto_storages_user ON public.crypto_storages(user_id);
```

- [x] Run `pnpm db:reset` (applies migrations)
- [x] Run `pnpm db:types`
- [x] Verify Security Advisor → 0 errors/warnings

#### Step 3.2: Update TypeScript Types

- [x] Update `src/lib/crypto/types.ts` with `CryptoStorage` type
- [x] Define `StorageType = 'cex' | 'wallet'`

#### Step 3.3: Create Route

- [x] Create `src/routes/_authenticated/crypto/storage.tsx`
- [x] Set up two-panel layout (similar to Reports page)
- [x] URL search params for selected storage

#### Step 3.4: Create API Layer

- [x] Create `src/lib/api/crypto-storages.ts`
- [x] Implement `fetchCryptoStorages()`
- [x] Implement `createCryptoStorage(input)`
- [x] Implement `updateCryptoStorage(id, updates)`
- [x] Implement `deleteCryptoStorage(id)`

#### Step 3.5: Create Hooks

- [x] Create `src/lib/hooks/use-crypto-storages.ts`
- [x] Implement `useCryptoStorages()` query
- [x] Implement CRUD mutations

#### Step 3.6: Add Storage Modal

- [x] Create `src/components/crypto/add-storage-modal.tsx`
- [x] CEX/Wallet type toggle
- [x] Conditional fields based on type
- [x] Wallet address validation
- [x] Explorer URL sanitization with `sanitizeUrl()`

#### Step 3.7: Storage Pie Chart

- [x] Create `src/components/crypto/storage-pie-chart.tsx`
- [x] Distribution by storage
- [x] Interactive segments
- [x] Click to select

#### Step 3.8: Storage List

- [x] Create `src/components/crypto/storage-list.tsx`
- [x] Show storage type icon, name, value, percentage
- [x] Selected state highlighting
- [x] Empty state

#### Step 3.9: Storage Assets Panel

- [x] Create `src/components/crypto/storage-assets-panel.tsx`
- [x] Show assets in selected storage
- [x] Sort by value descending
- [x] Empty state if no selection
- [x] Empty state if no assets

**Note:** Asset values per storage will show 0 until transactions are implemented in Phase 4.

#### Step 3.10: Wire Up Page

- [x] Layout components
- [x] Handle selection state
- [x] URL param persistence
- [x] Loading states

#### Step 3.11: Visual Testing

- [x] Test in browser with Playwright
- [x] Add CEX and Wallet storages
- [x] Test selection behavior
- [x] Test responsive design

### Files Created/Modified

| Action   | File                                                            |
| -------- | --------------------------------------------------------------- |
| Created  | `supabase/migrations/20260102150000_create_crypto_storages.sql` |
| Created  | `src/routes/_authenticated/crypto/storage.tsx`                  |
| Created  | `src/lib/api/crypto-storages.ts`                                |
| Created  | `src/lib/hooks/use-crypto-storages.ts`                          |
| Created  | `src/components/crypto/add-storage-modal.tsx`                   |
| Created  | `src/components/crypto/storage-pie-chart.tsx`                   |
| Created  | `src/components/crypto/storage-list.tsx`                        |
| Created  | `src/components/crypto/storage-assets-panel.tsx`                |
| Modified | `src/lib/crypto/types.ts`                                       |
| Modified | `src/components/crypto/index.ts`                                |
| Modified | `src/lib/query-keys.ts`                                         |
| Modified | `src/types/database.ts` (auto-generated)                        |

---

## Phase 4: Transactions Page (incl. DB Migration)

### Goal

Create the `crypto_transactions` table and build the transactions page with list, filters, and all 6 transaction type forms.

### Summary

Created the `crypto_transactions` database table with RLS policies and built the complete Transactions page with all UI components. Implemented filter bar (type, date range), transaction list with pagination, and Add Transaction modal supporting all 6 transaction types (buy, sell, transfer_between, swap, transfer_in, transfer_out). Built type-specific forms with validation, balance calculation utilities, and integrated real balances into Assets and Storage pages. Transaction type badges display with distinct colors and icons.

### Success Criteria

- [x] `crypto_transactions` table created with RLS
- [x] Route accessible at `/crypto/transactions`
- [x] Filter bar works (type, date range)
- [x] Transaction list displays correctly
- [x] Add Transaction modal works for all 6 types
- [x] Pagination works
- [x] Balance calculations work correctly
- [x] Assets/Storage pages now show real balances

### Implementation Steps

#### Step 4.1: Database Migration - crypto_transactions

- [x] Create `supabase/migrations/20260102200000_create_crypto_transactions.sql`

**Schema:**

```sql
-- Crypto Transaction Types
CREATE TYPE public.crypto_transaction_type AS ENUM (
  'buy', 'sell', 'transfer_between', 'swap', 'transfer_in', 'transfer_out'
);

-- Crypto Transactions
CREATE TABLE public.crypto_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.crypto_transaction_type NOT NULL,
  date DATE NOT NULL,

  -- Common optional fields
  tx_id TEXT,
  tx_explorer_url TEXT,

  -- Asset & amount (for most types)
  asset_id UUID REFERENCES public.crypto_assets(id) ON DELETE CASCADE,
  amount NUMERIC(30, 18), -- High precision for crypto

  -- Storage (for most types)
  storage_id UUID REFERENCES public.crypto_storages(id) ON DELETE RESTRICT,

  -- Buy/Sell specific
  fiat_amount BIGINT, -- VND amount
  linked_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,

  -- Transfer Between specific
  from_storage_id UUID REFERENCES public.crypto_storages(id) ON DELETE RESTRICT,
  to_storage_id UUID REFERENCES public.crypto_storages(id) ON DELETE RESTRICT,

  -- Swap specific
  from_asset_id UUID REFERENCES public.crypto_assets(id) ON DELETE CASCADE,
  from_amount NUMERIC(30, 18),
  to_asset_id UUID REFERENCES public.crypto_assets(id) ON DELETE CASCADE,
  to_amount NUMERIC(30, 18),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.crypto_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crypto_transactions_select_own" ON public.crypto_transactions
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "crypto_transactions_insert_own" ON public.crypto_transactions
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "crypto_transactions_update_own" ON public.crypto_transactions
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "crypto_transactions_delete_own" ON public.crypto_transactions
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Indexes
CREATE INDEX idx_crypto_transactions_user_date
  ON public.crypto_transactions(user_id, date);
CREATE INDEX idx_crypto_transactions_asset
  ON public.crypto_transactions(asset_id);
CREATE INDEX idx_crypto_transactions_storage
  ON public.crypto_transactions(storage_id);
```

- [x] Run `pnpm db:migrate`
- [x] Run `pnpm db:types`
- [x] Verify Security Advisor → 0 errors/warnings

#### Step 4.2: Update TypeScript Types

- [x] Update `src/lib/crypto/types.ts` with `CryptoTransaction` type
- [x] Define type-specific field interfaces
- [x] Define input types for each transaction type

#### Step 4.3: Create Route

- [x] Create `src/routes/_authenticated/crypto/transactions.tsx`
- [x] Set up page layout with filters bar
- [x] URL search params for filters

#### Step 4.4: Create API Layer

- [x] Create `src/lib/api/crypto-transactions.ts`
- [x] Implement `fetchCryptoTransactions(filters, pagination)`
- [x] Implement `createCryptoTransaction(input)` - handles all 6 types
- [x] Implement `updateCryptoTransaction(id, updates)`
- [x] Implement `deleteCryptoTransaction(id)`

#### Step 4.5: Create Hooks

- [x] Create `src/lib/hooks/use-crypto-transactions.ts`
- [x] Implement `useCryptoTransactions(filters)` query
- [x] Implement CRUD mutations
- [x] Add cache invalidation for assets query (balance recalc)

#### Step 4.6: Filter Bar

- [x] Create `src/components/crypto/transaction-filters.tsx`
- [x] Type filter (multi-select dropdown)
- [x] Start date picker
- [x] End date picker
- [x] Clear filters button

#### Step 4.7: Transaction Type Badge

- [x] Create `src/components/crypto/transaction-type-badge.tsx`
- [x] Use CVA (Class Variance Authority) for badge variants
- [x] **Badge Colors & Icons per Type:**
  - **Buy:** Green/Emerald background, ShoppingCart or ArrowDown icon
  - **Sell:** Red background, CurrencyDollar or ArrowUp icon
  - **Transfer Between:** Blue background, ArrowsLeftRight icon
  - **Swap:** Purple background, ArrowsClockwise or Swap icon
  - **Transfer In:** Teal/Cyan background, ArrowDownLeft or Download icon
  - **Transfer Out:** Orange background, ArrowUpRight or Upload icon
- [x] Badge shows icon + type label (e.g., [icon] "Buy")
- [x] Consistent sizing across all badges

#### Step 4.8: Transaction List

- [x] Create `src/components/crypto/transaction-list.tsx`
- [x] **Columns:**
  - Date column (formatted consistently, e.g., "Jan 5, 2024")
  - Type badge (colored, with icon)
  - Details column (type-specific formatting - see below)
  - TX ID/Link column (truncated ID or external link icon)
  - Actions column (Edit, Delete buttons)
- [x] **Type-Specific Details Display:**
  - **Buy:** "Bought {amount} {symbol} for {fiat_amount}" + storage icon
    - Example: "Bought 0.5 BTC for 250M" [Binance icon]
  - **Sell:** "Sold {amount} {symbol} for {fiat_amount}" + storage icon
    - Example: "Sold 0.3 BTC for 180M" [Binance icon]
  - **Transfer Between:** "{amount} {symbol}: {from_storage} → {to_storage}"
    - Example: "0.2 BTC: Binance → Ledger"
  - **Swap:** "{from_amount} {from_symbol} → {to_amount} {to_symbol}" + storage icon
    - Example: "0.5 BTC → 8.5 ETH" [Binance icon]
  - **Transfer In:** "Received {amount} {symbol}" + storage icon
    - Example: "Received 0.1 BTC" [MetaMask icon]
  - **Transfer Out:** "Sent {amount} {symbol}" + storage icon
    - Example: "Sent 0.05 BTC" [MetaMask icon]
- [x] **TX ID/Link Column:**
  - If tx_explorer_url exists: Show external link icon, opens in new tab
  - If only tx_id exists: Show truncated ID (first 8 chars...) with copy button
  - If neither: Show dash or empty
- [x] **Actions Column:**
  - Edit button: Opens edit modal with pre-populated data
  - Delete button: Opens confirmation dialog
- [x] **Pagination:**
  - 20 items per page
  - Page navigation controls (First, Prev, page numbers, Next, Last)
  - Current page indicator
  - Total count display
- [x] **Empty State:** "No transactions found" with Add Transaction CTA
- [x] **Loading State:** Skeleton rows

#### Step 4.9: Add Transaction Modal

- [x] Create `src/components/crypto/add-transaction-modal.tsx`
- [x] Step 1: Type selection (6 buttons)
- [x] Step 2: Type-specific form

#### Step 4.10: Transaction Type Forms

##### Step 4.10.1: Buy Form (`buy-form.tsx`)

- [x] Create `src/components/crypto/transaction-forms/buy-form.tsx`
- [x] **Fields:**
  - Asset dropdown (select from user's existing assets, required)
  - Amount input (crypto amount bought, required, positive decimal)
  - Storage dropdown (where the asset is stored after buying, required)
  - Fiat Amount input (VND paid, required, positive integer)
  - Date picker (required, defaults to today)
  - TX ID input (optional, for reference)
  - TX Explorer URL input (optional, sanitized with `sanitizeUrl()`)
- [x] **Validation:**
  - All required fields must be filled
  - Amount must be positive number
  - Fiat Amount must be positive integer
- [x] **Note:** Buy creates linked expense - handled in Phase 5

##### Step 4.10.2: Sell Form (`sell-form.tsx`)

- [x] Create `src/components/crypto/transaction-forms/sell-form.tsx`
- [x] **Fields:**
  - Asset dropdown (select from user's existing assets, required)
  - Amount input (crypto amount sold, required, positive decimal)
  - Storage dropdown (where the asset is sold from, required)
  - Fiat Amount input (VND received, required, positive integer)
  - Date picker (required, defaults to today)
  - TX ID input (optional)
  - TX Explorer URL input (optional, sanitized)
- [x] **Validation:**
  - All required fields must be filled
  - Amount must be positive and ≤ available balance in selected storage
  - Show "Insufficient balance" error if amount > balance
  - Fiat Amount must be positive integer
- [x] **UI Enhancement:** Show available balance for selected asset/storage
- [x] **Note:** Sell creates linked income - handled in Phase 5

##### Step 4.10.3: Transfer Between Form (`transfer-between-form.tsx`)

- [x] Create `src/components/crypto/transaction-forms/transfer-between-form.tsx`
- [x] **Fields:**
  - Asset dropdown (select from user's existing assets, required)
  - Amount input (crypto amount to transfer, required, positive decimal)
  - From Storage dropdown (source storage, required)
  - To Storage dropdown (destination storage, required)
  - Date picker (required, defaults to today)
  - TX ID input (optional)
  - TX Explorer URL input (optional, sanitized)
- [x] **Validation:**
  - All required fields must be filled
  - From Storage ≠ To Storage (show error "Source and destination must be different")
  - Amount must be positive and ≤ available balance in From Storage
  - Show "Insufficient balance in [storage name]" error if amount > balance
- [x] **UI Enhancement:** Show available balance for selected asset in From Storage
- [x] **Balance Effect:** Decreases From Storage, increases To Storage (net zero for total)

##### Step 4.10.4: Swap Form (`swap-form.tsx`)

- [x] Create `src/components/crypto/transaction-forms/swap-form.tsx`
- [x] **Fields:**
  - From Asset dropdown (asset being swapped away, required)
  - From Amount input (amount of from_asset, required, positive decimal)
  - To Asset dropdown (asset being received, required)
  - To Amount input (amount of to_asset received, required, positive decimal)
  - Storage dropdown (where the swap happens, required)
  - Date picker (required, defaults to today)
  - TX ID input (optional)
  - TX Explorer URL input (optional, sanitized)
- [x] **Validation:**
  - All required fields must be filled
  - From Asset ≠ To Asset (show error "Cannot swap same asset")
  - From Amount must be positive and ≤ available balance of From Asset in Storage
  - To Amount must be positive
  - Show "Insufficient balance" error if From Amount > balance
- [x] **UI Enhancement:** Show available balance for From Asset in selected Storage
- [x] **Balance Effect:** Decreases From Asset balance, increases To Asset balance in same storage

##### Step 4.10.5: Transfer In Form (`transfer-in-form.tsx`)

- [x] Create `src/components/crypto/transaction-forms/transfer-in-form.tsx`
- [x] **Fields:**
  - Asset dropdown (asset being received, required)
  - Amount input (crypto amount received, required, positive decimal)
  - Storage dropdown (where the asset is received, required)
  - Date picker (required, defaults to today)
  - TX ID input (optional)
  - TX Explorer URL input (optional, sanitized)
- [x] **Validation:**
  - All required fields must be filled
  - Amount must be positive
- [x] **Use Cases:** Airdrops, gifts received, mining rewards, staking rewards
- [x] **Balance Effect:** Adds amount to asset balance in specified storage
- [x] **Note:** Does NOT create linked income transaction (unlike Sell)

##### Step 4.10.6: Transfer Out Form (`transfer-out-form.tsx`)

- [x] Create `src/components/crypto/transaction-forms/transfer-out-form.tsx`
- [x] **Fields:**
  - Asset dropdown (asset being sent out, required)
  - Amount input (crypto amount sent, required, positive decimal)
  - Storage dropdown (where the asset is sent from, required)
  - Date picker (required, defaults to today)
  - TX ID input (optional)
  - TX Explorer URL input (optional, sanitized)
- [x] **Validation:**
  - All required fields must be filled
  - Amount must be positive and ≤ available balance in selected storage
  - Show "Insufficient balance" error if amount > balance
- [x] **UI Enhancement:** Show available balance for selected asset/storage
- [x] **Use Cases:** Gifts sent, donations, lost funds, network fees paid in crypto
- [x] **Balance Effect:** Subtracts amount from asset balance in specified storage
- [x] **Note:** Does NOT create linked expense transaction (unlike Buy)

#### Step 4.11: Balance Calculation Utility

##### Step 4.11.1: Core Balance Function

- [x] Create `calculateAssetBalance(assetId, storageId, transactions)` in `src/lib/crypto/utils.ts`
- [x] Parameters:
  - `assetId: string` - The asset to calculate balance for
  - `storageId: string | null` - Specific storage (null = all storages combined)
  - `transactions: CryptoTransaction[]` - All user's crypto transactions
- [x] Returns: `number` - The calculated balance

##### Step 4.11.2: Buy Transaction Effect

- [x] **Logic:** Adds `amount` to asset balance in `storage_id`
- [x] **Code:**
  ```typescript
  case 'buy':
    if (tx.asset_id === assetId && (!storageId || tx.storage_id === storageId)) {
      balance += tx.amount
    }
  ```

##### Step 4.11.3: Sell Transaction Effect

- [x] **Logic:** Subtracts `amount` from asset balance in `storage_id`
- [x] **Code:**
  ```typescript
  case 'sell':
    if (tx.asset_id === assetId && (!storageId || tx.storage_id === storageId)) {
      balance -= tx.amount
    }
  ```

##### Step 4.11.4: Transfer Between Transaction Effect

- [x] **Logic:** Moves amount between storages (net zero for total balance)
- [x] **Code:**
  ```typescript
  case 'transfer_between':
    if (tx.asset_id === assetId) {
      if (storageId === tx.from_storage_id) {
        balance -= tx.amount  // Leaving from_storage
      } else if (storageId === tx.to_storage_id) {
        balance += tx.amount  // Arriving at to_storage
      }
      // If storageId is null (total), net effect is 0
    }
  ```

##### Step 4.11.5: Swap Transaction Effect

- [x] **Logic:** Decreases from_asset, increases to_asset in same storage
- [x] **Code:**
  ```typescript
  case 'swap':
    if (!storageId || tx.storage_id === storageId) {
      if (tx.from_asset_id === assetId) {
        balance -= tx.from_amount  // Swapping away
      }
      if (tx.to_asset_id === assetId) {
        balance += tx.to_amount    // Receiving
      }
    }
  ```

##### Step 4.11.6: Transfer In Transaction Effect

- [x] **Logic:** Adds `amount` to asset balance in `storage_id`
- [x] **Code:**
  ```typescript
  case 'transfer_in':
    if (tx.asset_id === assetId && (!storageId || tx.storage_id === storageId)) {
      balance += tx.amount
    }
  ```

##### Step 4.11.7: Transfer Out Transaction Effect

- [x] **Logic:** Subtracts `amount` from asset balance in `storage_id`
- [x] **Code:**
  ```typescript
  case 'transfer_out':
    if (tx.asset_id === assetId && (!storageId || tx.storage_id === storageId)) {
      balance -= tx.amount
    }
  ```

##### Step 4.11.8: Helper Functions

- [x] Create `calculateStorageBalance(storageId, transactions, prices, exchangeRate)` - total VND value in a storage
- [x] Create `calculatePortfolioBalance(transactions, prices, exchangeRate)` - total VND value across all storages
- [x] Create `getAvailableBalance(assetId, storageId, transactions)` - for validation in forms

##### Step 4.11.9: Negative Balance Prevention

- [x] Before creating Sell: Validate `amount ≤ getAvailableBalance(assetId, storageId)`
- [x] Before creating Transfer Between: Validate `amount ≤ getAvailableBalance(assetId, fromStorageId)`
- [x] Before creating Swap: Validate `fromAmount ≤ getAvailableBalance(fromAssetId, storageId)`
- [x] Before creating Transfer Out: Validate `amount ≤ getAvailableBalance(assetId, storageId)`
- [x] Show user-friendly error messages with current available balance

##### Step 4.11.10: Testing Balance Calculations

- [x] Test Buy: Balance increases correctly
- [x] Test Sell: Balance decreases, cannot go negative
- [x] Test Transfer Between: From decreases, To increases, total unchanged
- [x] Test Swap: From asset decreases, To asset increases
- [x] Test Transfer In: Balance increases (no linked transaction)
- [x] Test Transfer Out: Balance decreases, cannot go negative
- [x] Test mixed transactions: Cumulative balance is correct
- [x] Test per-storage vs total balance calculations

#### Step 4.12: Update Assets Page

- [x] Now Balance column shows real calculated values
- [x] Value column = Balance × Price
- [x] Verify portfolio totals are correct

#### Step 4.13: Update Storage Page

- [x] Storage values now show real totals
- [x] Asset list in right panel shows real balances
- [x] Pie chart reflects actual distribution

#### Step 4.14: Visual Testing

- [x] Test all 6 transaction types
- [x] Verify balance calculations
- [x] Test filters and pagination
- [x] Test responsive design

### Files Created/Modified

| Action   | File                                                                |
| -------- | ------------------------------------------------------------------- |
| Created  | `supabase/migrations/<timestamp>_create_crypto_transactions.sql`    |
| Created  | `src/routes/_authenticated/crypto/transactions.tsx`                 |
| Created  | `src/lib/api/crypto-transactions.ts`                                |
| Created  | `src/lib/hooks/use-crypto-transactions.ts`                          |
| Created  | `src/components/crypto/transaction-filters.tsx`                     |
| Created  | `src/components/crypto/transaction-list.tsx`                        |
| Created  | `src/components/crypto/transaction-type-badge.tsx`                  |
| Created  | `src/components/crypto/add-transaction-modal.tsx`                   |
| Created  | `src/components/crypto/transaction-forms/buy-form.tsx`              |
| Created  | `src/components/crypto/transaction-forms/sell-form.tsx`             |
| Created  | `src/components/crypto/transaction-forms/transfer-between-form.tsx` |
| Created  | `src/components/crypto/transaction-forms/swap-form.tsx`             |
| Created  | `src/components/crypto/transaction-forms/transfer-in-form.tsx`      |
| Created  | `src/components/crypto/transaction-forms/transfer-out-form.tsx`     |
| Created  | `src/components/crypto/transaction-forms/index.ts`                  |
| Modified | `src/lib/crypto/utils.ts` (balance calculation functions)           |
| Modified | `src/lib/crypto/types.ts` (CryptoTransaction, input types)          |
| Modified | `src/lib/query-keys.ts` (crypto.transactions keys)                  |
| Modified | `src/components/crypto/index.ts` (export new components)            |
| Modified | `src/routes/_authenticated/crypto/assets.tsx` (real balances)       |
| Modified | `src/routes/_authenticated/crypto/storage.tsx` (real balances)      |
| Modified | `src/types/database.ts` (auto-generated)                            |

---

## Phase 5: Buy/Sell Transaction Integration

### Goal

Implement the Buy/Sell ↔ Expense/Income integration with "Investing" tag validation and cascade behavior.

### Summary

Implemented the Buy/Sell and Transfer In/Out integration with the calendar's expense/income system. Created tag validation utilities to find "Investing" tags. Buy and Transfer Out transactions create linked expense records; Sell and Transfer In transactions create linked income records. All linked transactions are created atomically and cascade on delete. Edit modal supports all 6 transaction types with proper balance validation. Delete confirmation shows warning about linked transactions being deleted.

### Success Criteria

- [x] Buy creates linked expense transaction with "Investing" tag
- [x] Sell creates linked income transaction with "Investing" tag
- [x] Missing tag shows clear error message
- [x] Edit modal works for all 6 transaction types
- [x] Edit Buy/Sell updates linked expense/income transaction
- [x] Delete Buy/Sell cascades to linked transaction
- [x] Calendar page shows Buy/Sell as expense/income
- [x] Edit validates balance for Sell, Transfer Between, Swap, Transfer Out

### Implementation Steps

#### Step 5.1: Tag Validation Utility

- [x] Create function to find "Investing" tag by type
- [x] Case-insensitive search
- [x] Return tag or null

#### Step 5.2: Buy Transaction Logic

- [x] Before creating: Check "Investing" expense tag exists
- [x] If missing: Show error "Please create an 'Investing' tag for expenses first"
- [x] Create expense transaction first with:
  - title: "Buy {AssetSymbol}"
  - amount: fiat_amount (VND)
  - type: 'expense'
  - tag_id: Investing expense tag
- [x] Create crypto transaction with linked_transaction_id
- [x] Both in atomic transaction (all or nothing)

#### Step 5.3: Sell Transaction Logic

- [x] Before creating: Check "Investing" income tag exists
- [x] If missing: Show error "Please create an 'Investing' tag for income first"
- [x] Create income transaction first with:
  - title: "Sell {AssetSymbol}"
  - amount: fiat_amount (VND)
  - type: 'income'
  - tag_id: Investing income tag
- [x] Create crypto transaction with linked_transaction_id
- [x] Both in atomic transaction

#### Step 5.4: Edit Buy/Sell Updates Linked Transaction

- [x] When editing fiat_amount → update linked expense/income amount
- [x] When editing date → update linked transaction date
- [x] Changes are atomic

#### Step 5.5: Delete Cascade

- [x] Update delete logic to also delete linked transaction
- [x] Confirm dialog mentions linked expense/income will be deleted
- [x] Verify no orphaned records

#### Step 5.6: Edit Transaction Modal

- [x] Create `src/components/crypto/edit-transaction-modal.tsx`
- [x] **Common Behavior (All Types):**
  - Pre-populate all fields with existing transaction data
  - Transaction type is displayed but CANNOT be changed
  - Date, TX ID, TX Explorer URL are editable
  - Cancel discards changes, Save commits changes
  - Delete button with confirmation dialog
- [x] **Type-Specific Edit Behavior:**
  - **Buy:** Asset, Amount, Storage, Fiat Amount editable; updates linked expense on save
  - **Sell:** Asset, Amount, Storage, Fiat Amount editable; updates linked income on save; validates balance
  - **Transfer Between:** Asset, Amount, From/To Storage editable; validates balance in From Storage
  - **Swap:** From/To Asset, From/To Amount, Storage editable; validates From Asset balance
  - **Transfer In:** Asset, Amount, Storage editable (no balance validation needed)
  - **Transfer Out:** Asset, Amount, Storage editable; validates balance
- [x] **Balance Validation on Edit:**
  - When editing amount, check new amount doesn't exceed available balance
  - Consider existing transaction's contribution to balance (can use same amount)
  - Show error if edit would cause negative balance
- [x] **Buy/Sell Linked Transaction Sync:**
  - Editing fiat_amount → update linked expense/income amount
  - Editing date → update linked transaction date
  - Changes must be atomic (both succeed or both fail)
- [x] **Delete Behavior:**
  - For Buy/Sell: Show warning that linked expense/income will also be deleted
  - For other types: Standard delete confirmation
  - After delete: Refresh transaction list, recalculate balances

#### Step 5.7: Calendar Integration Verification

- [x] Test Buy expense appears on calendar
- [x] Test Sell income appears on calendar
- [x] Verify amounts display correctly
- [x] Verify "Investing" tag visible
- [x] Delete from calendar should NOT break crypto tx (or be prevented)

### Files Created/Modified

| Action   | File                                                                     |
| -------- | ------------------------------------------------------------------------ |
| Created  | `src/components/crypto/edit-transaction-modal.tsx`                       |
| Modified | `src/lib/api/crypto-transactions.ts` (Buy/Sell linked transaction logic) |
| Modified | `src/lib/crypto/utils.ts` (tag validation utility)                       |
| Modified | `src/lib/hooks/use-crypto-transactions.ts` (edit/delete mutations)       |
| Modified | `src/components/crypto/transaction-list.tsx` (wire up edit modal)        |
| Modified | `src/components/crypto/index.ts` (export edit modal)                     |

---

## Phase 6: Charts & Historical Data (incl. DB Migration)

### Goal

Implement the Allocation History and Total Value History charts with time range selection.

### Summary

Created the `crypto_portfolio_snapshots` database table with RLS policies. Built chart components for displaying historical portfolio data including a stacked area chart for allocation history and an area chart for total value history. Implemented time range selector (7d, 30d, 60d, 1y, All) and tab switching between Allocation and Total Value views. Charts display empty states when no historical data is available (snapshots will be collected by edge function in Phase 7). All values convert to VND using the exchange rate integration.

### Success Criteria

- [x] Time range selector works (7d, 30d, 60d, 1y, all)
- [x] Allocation History area chart renders
- [x] Total Value History line chart renders
- [x] Charts show correct historical data
- [x] Tooltips display allocation at specific time
- [x] Charts handle edge cases (no data, single point)

### Implementation Steps

#### Step 6.1: Database Migration - crypto_portfolio_snapshots

- [x] Create `supabase/migrations/20260103100000_create_crypto_portfolio_snapshots.sql`

**Schema:**

```sql
-- Crypto Portfolio Snapshots (for historical charts)
CREATE TABLE public.crypto_portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_value_usd NUMERIC(20, 2) NOT NULL,
  allocations JSONB NOT NULL, -- { "bitcoin": { "percentage": 0.45, "value_usd": 1000 }, ... }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

-- RLS Policies
ALTER TABLE public.crypto_portfolio_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crypto_portfolio_snapshots_select_own" ON public.crypto_portfolio_snapshots
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "crypto_portfolio_snapshots_insert_own" ON public.crypto_portfolio_snapshots
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- Index
CREATE INDEX idx_crypto_portfolio_snapshots_user_date
  ON public.crypto_portfolio_snapshots(user_id, snapshot_date DESC);
```

- [x] Run `pnpm db:reset`
- [x] Run `pnpm db:types`
- [x] Verify Security Advisor → 0 errors/warnings

#### Step 6.2: History Charts Container

- [x] Update `src/components/crypto/portfolio-history-chart.tsx` (replaced placeholder)
- [x] Tab interface (Allocation / Total Value)
- [x] Time range selector buttons
- [x] Loading states

#### Step 6.3: Allocation History Chart

- [x] Create `src/components/crypto/allocation-history-chart.tsx`
- [x] Stacked area chart (recharts)
- [x] One area per asset with color mapping
- [x] Percentage Y-axis (0-100%)
- [x] Interactive tooltip showing asset breakdown

#### Step 6.4: Total Value History Chart

- [x] Create `src/components/crypto/value-history-chart.tsx`
- [x] Area chart with gradient fill (recharts)
- [x] Value in VND on Y-axis with formatCompact
- [x] Date on X-axis
- [x] Tooltip with formatted value (formatCurrency)

#### Step 6.5: Historical Data Hook

- [x] Create `src/lib/hooks/use-portfolio-history.ts`
- [x] `usePortfolioSnapshots(range)` - fetches from database
- [x] `useValueHistory(range, exchangeRate)` - transforms for value chart
- [x] `useAllocationHistory(range)` - transforms for allocation chart
- [x] Convert to VND using exchange rate

#### Step 6.6: Wire Up to Assets Page

- [x] Pass `assets` and `exchangeRate` props to PortfolioHistoryChart
- [x] Time range state management in component
- [x] Data integration with hooks

### Files Created/Modified

| Action   | File                                                                     |
| -------- | ------------------------------------------------------------------------ |
| Created  | `supabase/migrations/20260103100000_create_crypto_portfolio_snapshots.sql` |
| Created  | `src/lib/api/crypto-portfolio-snapshots.ts`                              |
| Created  | `src/lib/hooks/use-portfolio-history.ts`                                 |
| Created  | `src/components/crypto/allocation-history-chart.tsx`                     |
| Created  | `src/components/crypto/value-history-chart.tsx`                          |
| Modified | `src/components/crypto/portfolio-history-chart.tsx` (replaced placeholder) |
| Modified | `src/components/crypto/index.ts` (export new components)                 |
| Modified | `src/lib/crypto/types.ts` (added PortfolioSnapshot types)                |
| Modified | `src/lib/query-keys.ts` (already had portfolioHistory key)               |
| Modified | `src/routes/_authenticated/crypto/assets.tsx` (pass props)               |
| Modified | `src/types/database.ts` (auto-generated)                                 |

---

## Phase 7: Edge Function (Daily Snapshots)

### Goal

Create Supabase edge function for daily portfolio snapshots.

### Summary

Created a Supabase Edge Function that runs daily to create portfolio snapshots for all users with crypto assets. The function fetches all users with crypto assets, calculates their current balances from transactions, fetches real-time prices from CoinGecko API, and creates a snapshot record with total USD value and per-asset allocations. Configured as a cron job in config.toml to run daily at 00:10 UTC. The function handles partial failures gracefully (continues processing other users if one fails) and provides detailed logging for debugging.

### Success Criteria

- [x] Edge function deployed
- [x] Cron job configured
- [x] Snapshots created daily
- [x] Data accurate for charts
- [x] Error handling for API failures

### Implementation Steps

#### Step 7.1: Create Edge Function

- [x] Run `supabase functions new snapshot-crypto-portfolio`
- [x] Implement snapshot logic

**Logic:**

```typescript
// For each user with crypto assets:
// 1. Fetch all crypto transactions
// 2. Calculate current balances using calculateAssetBalance()
// 3. Fetch prices from CoinGecko (batch request)
// 4. Calculate total value (USD)
// 5. Calculate allocations (percentage per asset)
// 6. Insert snapshot with UPSERT (handles re-runs)
```

**Key Implementation Details:**

- Uses service role key to bypass RLS and access all users' data
- Batches CoinGecko API requests to minimize rate limiting
- Calculates balances using the same logic as frontend (consistency)
- Stores allocations as JSONB with coingecko_id as key
- Returns detailed response with success/failure counts

#### Step 7.2: Configure Cron Job

- [x] Add to `supabase/config.toml`
- [x] Set schedule: "10 0 * * *" (00:10 UTC daily)
- [x] Configure with verify_jwt = true for security

**Configuration:**

```toml
[functions.snapshot-crypto-portfolio]
enabled = true
verify_jwt = true
```

#### Step 7.3: Error Handling

- [x] Handle CoinGecko rate limits (graceful degradation)
- [x] Handle partial failures (some users succeed, others fail)
- [x] Log errors for debugging with [Info] and [Error] prefixes
- [x] Return detailed response with per-user results

#### Step 7.4: Testing

- [x] Test locally with `supabase functions serve`
- [x] Verify snapshot creation with test data
- [x] Verify data accuracy (balances, prices, allocations)
- [x] Verify charts display snapshot data correctly

**Test Results:**

- Edge function correctly identifies users with crypto assets
- Balances calculated accurately from transactions
- CoinGecko prices fetched successfully
- Snapshots created with correct total value and allocations
- Charts display historical data correctly (Allocation & Total Value)

### Files Created/Modified

| Action   | File                                                    |
| -------- | ------------------------------------------------------- |
| Created  | `supabase/functions/snapshot-crypto-portfolio/index.ts` |
| Modified | `supabase/config.toml`                                  |

---

## Phase 8: Testing & Polish

### Goal

Comprehensive testing against UI and QA checklists, bug fixes, and final polish.

### Summary

[To be filled during implementation]

### Success Criteria

- [ ] All UI checklist items pass
- [ ] All QA checklist items pass
- [ ] No console errors or warnings
- [ ] Accessibility requirements met
- [ ] Performance acceptable
- [ ] All edge cases handled

### Implementation Steps

#### Step 8.1: UI/UX Testing

- [ ] Run through `crypto-ui-checklist.md`
- [ ] Fix all visual issues
- [ ] Test responsive design (mobile/tablet/desktop)
- [ ] Verify dark mode

#### Step 8.2: Functional Testing

- [ ] Run through `crypto-qa-checklist.md`
- [ ] Test all CRUD operations
- [ ] Test all transaction types
- [ ] Verify balance calculations
- [ ] Test Buy/Sell integration

#### Step 8.3: Currency Testing

- [ ] Verify all values display in VND
- [ ] Check formatCompact/formatCurrency usage
- [ ] Test with fallback exchange rate
- [ ] Verify tooltips show full values

#### Step 8.4: Edge Case Testing

- [ ] Test with no assets
- [ ] Test with no storages
- [ ] Test with no transactions
- [ ] Test very large values
- [ ] Test very small crypto amounts

#### Step 8.5: Performance Testing

- [ ] Test with many assets
- [ ] Test with many transactions
- [ ] Verify chart rendering performance
- [ ] Check for unnecessary re-renders

#### Step 8.6: Accessibility Testing

- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] Color contrast verification
- [ ] ARIA labels

#### Step 8.7: Final Polish

- [ ] Fix any remaining bugs
- [ ] Improve error messages
- [ ] Add helpful tooltips
- [ ] Polish animations

### Files Created/Modified

| Action   | File                                |
| -------- | ----------------------------------- |
| Modified | Various files based on issues found |

---

## Dependencies Diagram

```
Phase 1 (Project Setup & CoinGecko API)
    │
    ├─────────────────────────────────┐
    ▼                                 ▼
Phase 2 (Assets Page)           Phase 3 (Storage Page)
[+ crypto_assets DB]            [+ crypto_storages DB]
    │                                 │
    └────────────┬────────────────────┘
                 ▼
           Phase 4 (Transactions Page)
           [+ crypto_transactions DB]
                 │
                 ▼
           Phase 5 (Buy/Sell Integration)
                 │
    ┌────────────┴────────────┐
    ▼                         ▼
Phase 6 (Charts)        Phase 7 (Edge Function)
[+ snapshots DB]
    │                         │
    └────────────┬────────────┘
                 ▼
           Phase 8 (Testing & Polish)
                 │
                 ▼
           Feature Complete ✅
```

**DB Migration Order:**

1. Phase 2: `crypto_assets` table
2. Phase 3: `crypto_storages` table
3. Phase 4: `crypto_transactions` table (depends on assets & storages)
4. Phase 6: `crypto_portfolio_snapshots` table (depends on assets)

---

## Notes

### Architecture Decisions

1. **Transaction-derived balances**: Balances are calculated from transaction history rather than stored. This ensures consistency and simplifies reconciliation.

2. **JSONB for snapshots**: Portfolio allocations in snapshots stored as JSONB for flexibility in adding new assets without schema changes.

3. **Linked transaction pattern**: Buy/Sell crypto transactions have a foreign key to the main transactions table, enabling cascade deletes and synchronized updates.

4. **CoinGecko caching**: Metadata cached aggressively (rarely changes), prices have short staleTime (60s) for near-real-time updates.

### Known Considerations

1. **CoinGecko Rate Limits**: Free tier has rate limits. Consider Pro API key for production.

2. **Historical Data Granularity**: Daily snapshots may not capture intra-day changes. Acceptable for this use case.

3. **Swap Complexity**: Swaps affect two assets simultaneously. Balance calculation must handle both sides.

### Future Improvements

1. **Cost basis tracking**: FIFO/LIFO for tax reporting
2. **Profit/Loss calculation**: Compare current value to invested amount
3. **CSV export**: For tax reporting
4. **Multi-chain support**: Track which blockchain each wallet is on
5. **Auto-import**: Import from wallet addresses via blockchain APIs
