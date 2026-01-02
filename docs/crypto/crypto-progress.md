# Crypto Portfolio Feature - Implementation Progress

## Overview

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Project Setup & CoinGecko API | Complete |
| Phase 2 | Assets Page (incl. DB migration) | Complete |
| Phase 3 | Storage Page (incl. DB migration) | Complete |
| Phase 4 | Transactions Page - Basic UI (incl. DB migration) | Pending |
| Phase 5 | Transaction Types Logic | Pending |
| Phase 6 | Charts & Historical Data (incl. DB migration) | Pending |
| Phase 7 | Edge Function (Daily Snapshots) | Pending |
| Phase 8 | Testing & Polish | Pending |

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

| Action | File |
|--------|------|
| Created | `src/lib/crypto/types.ts` |
| Created | `src/lib/crypto/utils.ts` |
| Created | `src/lib/api/coingecko.ts` |
| Created | `src/lib/hooks/use-coingecko.ts` |
| Modified | `src/components/app-sidebar.tsx` |
| Modified | `src/lib/query-keys.ts` |

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

| Action | File |
|--------|------|
| Created | `supabase/migrations/20260102100000_create_crypto_assets.sql` |
| Created | `src/routes/_authenticated/crypto/assets.tsx` |
| Created | `src/lib/api/crypto-assets.ts` |
| Created | `src/lib/hooks/use-crypto-assets.ts` |
| Created | `src/components/crypto/add-asset-modal.tsx` |
| Created | `src/components/crypto/portfolio-summary-cards.tsx` |
| Created | `src/components/crypto/allocation-pie-chart.tsx` |
| Created | `src/components/crypto/assets-table.tsx` |
| Created | `src/components/crypto/portfolio-history-chart.tsx` (placeholder) |
| Created | `src/components/crypto/index.ts` |
| Modified | `src/lib/crypto/types.ts` (added CryptoAsset, CryptoAssetWithPrice) |
| Modified | `src/lib/api/coingecko.ts` (added search, markets endpoints) |
| Modified | `src/lib/hooks/use-coingecko.ts` (added useCryptoMarkets, useCoinGeckoSearch) |
| Modified | `src/lib/query-keys.ts` (added crypto.assets, coingecko.markets, coingecko.search) |
| Modified | `src/types/database.ts` (auto-generated) |

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

| Action | File |
|--------|------|
| Created | `supabase/migrations/20260102150000_create_crypto_storages.sql` |
| Created | `src/routes/_authenticated/crypto/storage.tsx` |
| Created | `src/lib/api/crypto-storages.ts` |
| Created | `src/lib/hooks/use-crypto-storages.ts` |
| Created | `src/components/crypto/add-storage-modal.tsx` |
| Created | `src/components/crypto/storage-pie-chart.tsx` |
| Created | `src/components/crypto/storage-list.tsx` |
| Created | `src/components/crypto/storage-assets-panel.tsx` |
| Modified | `src/lib/crypto/types.ts` |
| Modified | `src/components/crypto/index.ts` |
| Modified | `src/lib/query-keys.ts` |
| Modified | `src/types/database.ts` (auto-generated) |

---

## Phase 4: Transactions Page (incl. DB Migration)

### Goal
Create the `crypto_transactions` table and build the transactions page with list, filters, and all 6 transaction type forms.

### Summary
[To be filled during implementation]

### Success Criteria
- [ ] `crypto_transactions` table created with RLS
- [ ] Route accessible at `/crypto/transactions`
- [ ] Filter bar works (type, date range)
- [ ] Transaction list displays correctly
- [ ] Add Transaction modal works for all 6 types
- [ ] Pagination works
- [ ] Balance calculations work correctly
- [ ] Assets/Storage pages now show real balances

### Implementation Steps

#### Step 4.1: Database Migration - crypto_transactions
- [ ] Create `supabase/migrations/<timestamp>_create_crypto_transactions.sql`

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

- [ ] Run `pnpm db:migrate`
- [ ] Run `pnpm db:types`
- [ ] Verify Security Advisor → 0 errors/warnings

#### Step 4.2: Update TypeScript Types
- [ ] Update `src/lib/crypto/types.ts` with `CryptoTransaction` type
- [ ] Define type-specific field interfaces
- [ ] Define input types for each transaction type

#### Step 4.3: Create Route
- [ ] Create `src/routes/_authenticated/crypto/transactions.tsx`
- [ ] Set up page layout with filters bar
- [ ] URL search params for filters

#### Step 4.4: Create API Layer
- [ ] Create `src/lib/api/crypto-transactions.ts`
- [ ] Implement `fetchCryptoTransactions(filters, pagination)`
- [ ] Implement `createCryptoTransaction(input)` - handles all 6 types
- [ ] Implement `updateCryptoTransaction(id, updates)`
- [ ] Implement `deleteCryptoTransaction(id)`

#### Step 4.5: Create Hooks
- [ ] Create `src/lib/hooks/use-crypto-transactions.ts`
- [ ] Implement `useCryptoTransactions(filters)` query
- [ ] Implement CRUD mutations
- [ ] Add cache invalidation for assets query (balance recalc)

#### Step 4.6: Filter Bar
- [ ] Create `src/components/crypto/transaction-filters.tsx`
- [ ] Type filter (multi-select dropdown)
- [ ] Start date picker
- [ ] End date picker
- [ ] Clear filters button

#### Step 4.7: Transaction Type Badge
- [ ] Create `src/components/crypto/transaction-type-badge.tsx`
- [ ] Distinct color per type
- [ ] Icon per type

#### Step 4.8: Transaction List
- [ ] Create `src/components/crypto/transaction-list.tsx`
- [ ] Date column
- [ ] Type badge
- [ ] Details column (type-specific formatting)
- [ ] TX ID/Link column
- [ ] Actions column (Edit, Delete)
- [ ] Pagination

#### Step 4.9: Add Transaction Modal
- [ ] Create `src/components/crypto/add-transaction-modal.tsx`
- [ ] Step 1: Type selection (6 buttons)
- [ ] Step 2: Type-specific form

#### Step 4.10: Transaction Type Forms
- [ ] Create `src/components/crypto/transaction-forms/buy-form.tsx`
- [ ] Create `src/components/crypto/transaction-forms/sell-form.tsx`
- [ ] Create `src/components/crypto/transaction-forms/transfer-between-form.tsx`
- [ ] Create `src/components/crypto/transaction-forms/swap-form.tsx`
- [ ] Create `src/components/crypto/transaction-forms/transfer-in-form.tsx`
- [ ] Create `src/components/crypto/transaction-forms/transfer-out-form.tsx`

#### Step 4.11: Balance Calculation Utility
- [ ] Implement `calculateAssetBalance(assetId, storageId, transactions)` in utils
- [ ] Handle all 6 transaction types correctly
- [ ] Test with various transaction combinations

#### Step 4.12: Update Assets Page
- [ ] Now Balance column shows real calculated values
- [ ] Value column = Balance × Price
- [ ] Verify portfolio totals are correct

#### Step 4.13: Update Storage Page
- [ ] Storage values now show real totals
- [ ] Asset list in right panel shows real balances
- [ ] Pie chart reflects actual distribution

#### Step 4.14: Visual Testing
- [ ] Test all 6 transaction types
- [ ] Verify balance calculations
- [ ] Test filters and pagination
- [ ] Test responsive design

### Files Created/Modified

| Action | File |
|--------|------|
| Created | `supabase/migrations/<timestamp>_create_crypto_transactions.sql` |
| Created | `src/routes/_authenticated/crypto/transactions.tsx` |
| Created | `src/lib/api/crypto-transactions.ts` |
| Created | `src/lib/hooks/use-crypto-transactions.ts` |
| Created | `src/components/crypto/transaction-filters.tsx` |
| Created | `src/components/crypto/transaction-list.tsx` |
| Created | `src/components/crypto/transaction-type-badge.tsx` |
| Created | `src/components/crypto/add-transaction-modal.tsx` |
| Created | `src/components/crypto/transaction-forms/*.tsx` (6 files) |
| Modified | `src/lib/crypto/utils.ts` |
| Modified | `src/lib/crypto/types.ts` |
| Modified | `src/types/database.ts` (auto-generated) |

---

## Phase 5: Buy/Sell Transaction Integration

### Goal
Implement the Buy/Sell ↔ Expense/Income integration with "Investing" tag validation and cascade behavior.

### Summary
[To be filled during implementation]

### Success Criteria
- [ ] Buy creates linked expense transaction with "Investing" tag
- [ ] Sell creates linked income transaction with "Investing" tag
- [ ] Missing tag shows clear error message
- [ ] Edit updates linked transaction
- [ ] Delete cascades to linked transaction
- [ ] Calendar page shows Buy/Sell as expense/income

### Implementation Steps

#### Step 5.1: Tag Validation Utility
- [ ] Create function to find "Investing" tag by type
- [ ] Case-insensitive search
- [ ] Return tag or null

#### Step 5.2: Buy Transaction Logic
- [ ] Before creating: Check "Investing" expense tag exists
- [ ] If missing: Show error "Please create an 'Investing' tag for expenses first"
- [ ] Create expense transaction first with:
  - title: "Buy {AssetSymbol}"
  - amount: fiat_amount (VND)
  - type: 'expense'
  - tag_id: Investing expense tag
- [ ] Create crypto transaction with linked_transaction_id
- [ ] Both in atomic transaction (all or nothing)

#### Step 5.3: Sell Transaction Logic
- [ ] Before creating: Check "Investing" income tag exists
- [ ] If missing: Show error "Please create an 'Investing' tag for income first"
- [ ] Create income transaction first with:
  - title: "Sell {AssetSymbol}"
  - amount: fiat_amount (VND)
  - type: 'income'
  - tag_id: Investing income tag
- [ ] Create crypto transaction with linked_transaction_id
- [ ] Both in atomic transaction

#### Step 5.4: Edit Buy/Sell Updates Linked Transaction
- [ ] When editing fiat_amount → update linked expense/income amount
- [ ] When editing date → update linked transaction date
- [ ] Changes are atomic

#### Step 5.5: Delete Cascade
- [ ] Update delete logic to also delete linked transaction
- [ ] Confirm dialog mentions linked expense/income will be deleted
- [ ] Verify no orphaned records

#### Step 5.6: Edit Transaction Modal
- [ ] Create `src/components/crypto/edit-transaction-modal.tsx`
- [ ] Pre-populate with existing data
- [ ] Type cannot be changed
- [ ] Save updates both records (Buy/Sell)
- [ ] Delete button with cascade warning

#### Step 5.7: Calendar Integration Verification
- [ ] Test Buy expense appears on calendar
- [ ] Test Sell income appears on calendar
- [ ] Verify amounts display correctly
- [ ] Verify "Investing" tag visible
- [ ] Delete from calendar should NOT break crypto tx (or be prevented)

### Files Created/Modified

| Action | File |
|--------|------|
| Created | `src/components/crypto/edit-transaction-modal.tsx` |
| Modified | `src/lib/api/crypto-transactions.ts` |
| Modified | `src/lib/crypto/utils.ts` |

---

## Phase 6: Charts & Historical Data (incl. DB Migration)

### Goal
Implement the Allocation History and Total Value History charts with time range selection.

### Summary
[To be filled during implementation]

### Success Criteria
- [ ] Time range selector works (7d, 30d, 60d, 1y, all)
- [ ] Allocation History area chart renders
- [ ] Total Value History line chart renders
- [ ] Charts show correct historical data
- [ ] Tooltips display allocation at specific time
- [ ] Charts handle edge cases (no data, single point)

### Implementation Steps

#### Step 6.1: Database Migration - crypto_portfolio_snapshots
- [ ] Create `supabase/migrations/<timestamp>_create_crypto_portfolio_snapshots.sql`

**Schema:**
```sql
-- Crypto Portfolio Snapshots (for historical charts)
CREATE TABLE public.crypto_portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_value_usd NUMERIC(20, 2) NOT NULL,
  allocations JSONB NOT NULL, -- { "bitcoin": 0.45, "ethereum": 0.30, ... }
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
  ON public.crypto_portfolio_snapshots(user_id, snapshot_date);
```

- [ ] Run `pnpm db:migrate`
- [ ] Run `pnpm db:types`
- [ ] Verify Security Advisor → 0 errors/warnings

#### Step 6.2: History Charts Container
- [ ] Create `src/components/crypto/history-charts.tsx`
- [ ] Tab interface (Allocation / Total Value)
- [ ] Time range selector buttons
- [ ] Loading states

#### Step 6.3: Allocation History Chart
- [ ] Create `src/components/crypto/allocation-history-chart.tsx`
- [ ] Stacked area chart (recharts)
- [ ] One area per asset
- [ ] Percentage Y-axis
- [ ] Interactive tooltip showing breakdown

#### Step 6.4: Total Value History Chart
- [ ] Create `src/components/crypto/value-history-chart.tsx`
- [ ] Line chart (recharts)
- [ ] Value in VND on Y-axis
- [ ] Date on X-axis
- [ ] Tooltip with formatted value

#### Step 6.5: Historical Data Hook
- [ ] Create `usePortfolioHistory(range)` hook
- [ ] Fetch from `crypto_portfolio_snapshots`
- [ ] Calculate allocation percentages
- [ ] Convert to VND

#### Step 6.6: Wire Up to Assets Page
- [ ] Add charts section to Assets page
- [ ] Time range state management
- [ ] Data integration

### Files Created/Modified

| Action | File |
|--------|------|
| Created | `supabase/migrations/<timestamp>_create_crypto_portfolio_snapshots.sql` |
| Created | `src/components/crypto/history-charts.tsx` |
| Created | `src/components/crypto/allocation-history-chart.tsx` |
| Created | `src/components/crypto/value-history-chart.tsx` |
| Modified | `src/lib/hooks/use-crypto-assets.ts` |
| Modified | `src/routes/_authenticated/crypto/assets.tsx` |
| Modified | `src/types/database.ts` (auto-generated) |

---

## Phase 7: Edge Function (Daily Snapshots)

### Goal
Create Supabase edge function for daily portfolio snapshots.

### Summary
[To be filled during implementation]

### Success Criteria
- [ ] Edge function deployed
- [ ] Cron job configured
- [ ] Snapshots created daily
- [ ] Data accurate for charts
- [ ] Error handling for API failures

### Implementation Steps

#### Step 7.1: Create Edge Function
- [ ] Run `supabase functions new snapshot-crypto-portfolio`
- [ ] Implement snapshot logic

**Logic:**
```typescript
// For each user with crypto assets:
// 1. Fetch all crypto transactions
// 2. Calculate current balances
// 3. Fetch prices from CoinGecko
// 4. Calculate total value (USD)
// 5. Calculate allocations
// 6. Insert snapshot
```

#### Step 7.2: Configure Cron Job
- [ ] Add to `supabase/config.toml`
- [ ] Set schedule (daily at midnight UTC)
- [ ] Add CRON_SECRET validation

#### Step 7.3: Error Handling
- [ ] Handle CoinGecko rate limits
- [ ] Handle partial failures (some users succeed, others fail)
- [ ] Log errors for debugging

#### Step 7.4: Testing
- [ ] Test locally with `supabase functions serve`
- [ ] Verify snapshot creation
- [ ] Verify data accuracy

### Files Created/Modified

| Action | File |
|--------|------|
| Created | `supabase/functions/snapshot-crypto-portfolio/index.ts` |
| Modified | `supabase/config.toml` |

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

| Action | File |
|--------|------|
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
