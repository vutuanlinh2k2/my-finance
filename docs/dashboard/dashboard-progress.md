# Dashboard Feature - Implementation Progress

## Overview

| Phase   | Description                    | Status      |
| ------- | ------------------------------ | ----------- |
| Phase 1 | UI + Mock Data                 | Complete    |
| Phase 2 | Database & API Layer           | Pending     |
| Phase 3 | Net Worth Snapshot System      | Pending     |
| Phase 4 | Integration & State Management | Pending     |
| Phase 5 | Testing & Polish               | Pending     |

---

## Phase 1: UI with Mock Data

### Goal

Build all UI components with hardcoded/mock data to validate the design and user experience before integrating with the backend.

### Summary

Built all dashboard UI components with mock data. Created three summary cards (Net Worth, Monthly Income, Monthly Expenses) with proper icons and color coding. Implemented a donut pie chart showing bank balance vs crypto allocation with hover tooltips. Added a line chart with time range switching (1M, 1Y, All) for net worth history. All components are responsive and support dark mode.

### Success Criteria

- [x] All UI components render correctly
- [x] Mock data displays properly in all states
- [x] Cards show formatted values with tooltips
- [x] Pie chart shows correct segments
- [x] Line chart renders with time range switching
- [x] Responsive design works across viewports
- [x] Loading and empty states implemented

### Implementation Steps

#### Step 1: Page Setup

- [x] Update `src/routes/_authenticated/index.tsx` with dashboard layout
- [x] Add page title "Dashboard" at top-left
- [x] Set up grid layout for cards and charts

#### Step 2: Type Definitions

- [x] Create `src/lib/dashboard/types.ts`
- [x] Define `NetWorthSnapshot` interface
- [x] Define `DashboardTotals` interface
- [x] Define `TimeRange` type (`'1m' | '1y' | 'all'`)

#### Step 3: Mock Data

- [x] Create `src/lib/dashboard/mock-data.ts`
- [x] Generate mock net worth values
- [x] Generate mock monthly income/expense
- [x] Generate mock historical snapshots for chart

#### Step 4: Summary Cards Component

- [x] Create `src/components/dashboard/dashboard-summary-cards.tsx`
- [x] Implement Net Worth card with icon (Wallet)
- [x] Implement Monthly Income card with icon (ArrowUp, green)
- [x] Implement Monthly Expense card with icon (ArrowDown, red)
- [x] Use `formatCompact()` with `tooltip-fast` for values
- [x] Add loading skeletons

#### Step 5: Pie Chart Component

- [x] Create `src/components/dashboard/net-worth-pie-chart.tsx`
- [x] Implement donut chart with recharts
- [x] Add Bank Balance segment (emerald color)
- [x] Add Crypto Investment segment (blue color)
- [x] Add center label showing "Net Worth"
- [x] Implement hover tooltips with amounts and percentages
- [x] Add loading skeleton
- [x] Handle empty state (both values 0)

#### Step 6: History Chart Component

- [x] Create `src/components/dashboard/net-worth-history-chart.tsx`
- [x] Implement line chart with recharts
- [x] Add time range selector tabs (1m, 1y, All)
- [x] Style tabs to match `PortfolioHistoryChart`
- [x] Implement hover tooltips with date and value
- [x] Add loading skeleton
- [x] Handle empty state (no history)

#### Step 7: Component Barrel Export

- [x] Create `src/components/dashboard/index.ts`
- [x] Export all dashboard components

#### Step 8: Visual Testing

- [x] Test in browser with Playwright MCP
- [x] Verify card layout and values
- [x] Test pie chart hover interactions
- [x] Test line chart time range switching
- [x] Check responsive design (mobile, tablet, desktop)
- [x] Verify dark mode compatibility

### Files Created/Modified

| Action   | File                                                   |
| -------- | ------------------------------------------------------ |
| Modified | `src/routes/_authenticated/index.tsx`                  |
| Created  | `src/lib/dashboard/types.ts`                           |
| Created  | `src/lib/dashboard/mock-data.ts`                       |
| Created  | `src/components/dashboard/dashboard-summary-cards.tsx` |
| Created  | `src/components/dashboard/net-worth-pie-chart.tsx`     |
| Created  | `src/components/dashboard/net-worth-history-chart.tsx` |
| Created  | `src/components/dashboard/index.ts`                    |

---

## Phase 2: Database & API Layer

### Goal

Create database functions and API layer for fetching real transaction totals and preparing for snapshot system.

### Summary

[To be filled during implementation]

### Success Criteria

- [ ] Database RPC functions return correct totals
- [ ] API layer handles all data fetching
- [ ] React Query hooks work correctly
- [ ] Security Advisor shows 0 errors/warnings

### Implementation Steps

#### Step 1: Database RPC Functions

- [ ] Create migration for `get_all_time_totals()` function

  ```sql
  CREATE OR REPLACE FUNCTION public.get_all_time_totals()
  RETURNS TABLE (
    total_income numeric,
    total_expenses numeric,
    bank_balance numeric
  )
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = ''
  AS $$
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as bank_balance
    FROM public.transactions
    WHERE user_id = (SELECT auth.uid())
  $$;
  ```

- [ ] Create migration for `get_monthly_totals(year, month)` function

  ```sql
  CREATE OR REPLACE FUNCTION public.get_monthly_totals(p_year int, p_month int)
  RETURNS TABLE (
    total_income numeric,
    total_expenses numeric
  )
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = ''
  AS $$
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
    FROM public.transactions
    WHERE user_id = (SELECT auth.uid())
      AND EXTRACT(YEAR FROM date::date) = p_year
      AND EXTRACT(MONTH FROM date::date) = p_month
  $$;
  ```

- [ ] Run `pnpm db:migrate`
- [ ] Regenerate types with `pnpm db:types`

#### Step 2: API Layer

- [ ] Create `src/lib/api/dashboard.ts`
- [ ] Implement `fetchAllTimeTotals()` function
- [ ] Implement `fetchMonthlyTotals(year, month)` function
- [ ] Add proper error handling

#### Step 3: Query Keys

- [ ] Add dashboard query keys to `src/lib/query-keys.ts`
  ```typescript
  dashboard: {
    all: ['dashboard'] as const,
    allTimeTotals: ['dashboard', 'all-time-totals'] as const,
    monthlyTotals: (year: number, month: number) =>
      ['dashboard', 'monthly-totals', year, month] as const,
    netWorthHistory: (range: string) =>
      ['dashboard', 'net-worth-history', range] as const,
  }
  ```

#### Step 4: React Query Hooks

- [ ] Create `src/lib/hooks/use-dashboard.ts`
- [ ] Implement `useAllTimeTotals()` hook
- [ ] Implement `useMonthlyTotals()` hook (current month)
- [ ] Implement `useDashboardData()` combined hook

#### Step 5: Security Check

- [ ] Open Supabase console at `http://localhost:64323`
- [ ] Check Security Advisor (0 errors, 0 warnings)
- [ ] Check Performance Advisor (0 errors, 0 warnings)
- [ ] Create migration for any fixes

### Files Created/Modified

| Action   | File                                                      |
| -------- | --------------------------------------------------------- |
| Created  | `supabase/migrations/<timestamp>_dashboard_functions.sql` |
| Created  | `src/lib/api/dashboard.ts`                                |
| Created  | `src/lib/hooks/use-dashboard.ts`                          |
| Modified | `src/lib/query-keys.ts`                                   |

---

## Phase 3: Net Worth Snapshot System

### Goal

Create the infrastructure for daily net worth snapshots including database table, edge function, and cron job.

### Summary

[To be filled during implementation]

### Success Criteria

- [ ] `net_worth_snapshots` table created with proper schema
- [ ] RLS policies enforce user isolation
- [ ] Edge function calculates and stores snapshots
- [ ] Cron job triggers daily snapshot creation
- [ ] Manual snapshot trigger works for testing

### Implementation Steps

#### Step 1: Database Table

- [ ] Create migration for `net_worth_snapshots` table

  ```sql
  CREATE TABLE public.net_worth_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    bank_balance NUMERIC NOT NULL DEFAULT 0,
    crypto_value_vnd NUMERIC NOT NULL DEFAULT 0,
    total_net_worth NUMERIC NOT NULL DEFAULT 0,
    exchange_rate NUMERIC NOT NULL DEFAULT 25500,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, snapshot_date)
  );

  -- RLS Policies
  ALTER TABLE public.net_worth_snapshots ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "net_worth_snapshots_select_own"
    ON public.net_worth_snapshots FOR SELECT
    USING (user_id = (SELECT auth.uid()));

  CREATE POLICY "net_worth_snapshots_insert_own"
    ON public.net_worth_snapshots FOR INSERT
    WITH CHECK (user_id = (SELECT auth.uid()));

  -- Index for time range queries
  CREATE INDEX idx_net_worth_snapshots_user_date
    ON public.net_worth_snapshots(user_id, snapshot_date DESC);
  ```

- [ ] Run `pnpm db:migrate`
- [ ] Regenerate types with `pnpm db:types`

#### Step 2: Edge Function

- [ ] Create `supabase/functions/snapshot-net-worth/index.ts`
- [ ] Implement CRON_SECRET validation
- [ ] For each user:
  - [ ] Fetch all-time transaction totals
  - [ ] Fetch crypto portfolio value (call existing function or query)
  - [ ] Get current exchange rate
  - [ ] Calculate total net worth
  - [ ] Upsert snapshot for today

#### Step 3: Cron Job Setup

- [ ] Create migration to add cron job

  ```sql
  -- Add function to invoke edge function
  CREATE OR REPLACE FUNCTION public.invoke_net_worth_snapshot()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $$
  DECLARE
    supabase_url TEXT;
    cron_secret TEXT;
  BEGIN
    SELECT value INTO supabase_url FROM public.app_config WHERE key = 'supabase_url';
    SELECT value INTO cron_secret FROM public.app_config WHERE key = 'cron_secret';

    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/snapshot-net-worth',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || cron_secret
      ),
      body := '{}'::jsonb
    );
  END;
  $$;

  -- Schedule daily at midnight
  SELECT cron.schedule(
    'snapshot-net-worth-daily',
    '0 0 * * *',
    'SELECT public.invoke_net_worth_snapshot()'
  );
  ```

#### Step 4: API for Snapshots

- [ ] Add `fetchNetWorthSnapshots(range)` to `src/lib/api/dashboard.ts`
- [ ] Handle time range filtering (1m, 1y, all)
- [ ] Return sorted by date ascending

#### Step 5: Hook for Snapshots

- [ ] Add `useNetWorthHistory(range)` hook
- [ ] Transform data for chart format
- [ ] Handle loading and error states

#### Step 6: Deploy & Test

- [ ] Deploy edge function: `supabase functions deploy snapshot-net-worth --no-verify-jwt`
- [ ] Set CRON_SECRET in edge function secrets
- [ ] Test manual trigger via Supabase dashboard
- [ ] Verify snapshot created in database

### Files Created/Modified

| Action   | File                                                          |
| -------- | ------------------------------------------------------------- |
| Created  | `supabase/migrations/<timestamp>_net_worth_snapshots.sql`     |
| Created  | `supabase/migrations/<timestamp>_net_worth_snapshot_cron.sql` |
| Created  | `supabase/functions/snapshot-net-worth/index.ts`              |
| Modified | `src/lib/api/dashboard.ts`                                    |
| Modified | `src/lib/hooks/use-dashboard.ts`                              |

---

## Phase 4: Integration & State Management

### Goal

Connect all UI components to real data and ensure proper cache invalidation.

### Summary

[To be filled during implementation]

### Success Criteria

- [ ] All components use real data from hooks
- [ ] Data refreshes when transactions change
- [ ] Crypto value updates reflected in dashboard
- [ ] Loading states work correctly
- [ ] Empty states handled properly

### Implementation Steps

#### Step 1: Update Summary Cards

- [ ] Replace mock data with `useDashboardData()` hook
- [ ] Connect net worth to real calculation
- [ ] Connect monthly totals to real data
- [ ] Integrate crypto value from `useCryptoAssets()`

#### Step 2: Update Pie Chart

- [ ] Connect bank balance from `useAllTimeTotals()`
- [ ] Connect crypto value from crypto hooks
- [ ] Calculate percentages dynamically
- [ ] Handle edge cases (no crypto, negative balance)

#### Step 3: Update History Chart

- [ ] Connect to `useNetWorthHistory(range)` hook
- [ ] Wire up time range state to data fetching
- [ ] Handle empty history state

#### Step 4: Cache Invalidation

- [ ] Invalidate dashboard queries when transactions mutate
- [ ] Update `useCreateTransaction`, `useUpdateTransaction`, `useDeleteTransaction`
- [ ] Add dashboard query keys to invalidation list

#### Step 5: Cleanup

- [ ] Delete mock data file
- [ ] Remove unused imports
- [ ] Run `pnpm lint` to verify

### Files Created/Modified

| Action   | File                                                   |
| -------- | ------------------------------------------------------ |
| Modified | `src/routes/_authenticated/index.tsx`                  |
| Modified | `src/components/dashboard/dashboard-summary-cards.tsx` |
| Modified | `src/components/dashboard/net-worth-pie-chart.tsx`     |
| Modified | `src/components/dashboard/net-worth-history-chart.tsx` |
| Modified | `src/lib/hooks/use-transactions.ts`                    |
| Deleted  | `src/lib/dashboard/mock-data.ts`                       |

---

## Phase 5: Testing & Polish

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

### Implementation Steps

#### Step 1: UI/UX Testing

- [ ] Run through `dashboard-ui-checklist.md`
- [ ] Test visual consistency
- [ ] Test responsive design on all viewports
- [ ] Verify dark mode compatibility
- [ ] Test all interactive states

#### Step 2: Functional Testing

- [ ] Run through `dashboard-qa-checklist.md`
- [ ] Verify all calculations are correct
- [ ] Test with various data scenarios
- [ ] Test error handling

#### Step 3: Edge Case Testing

- [ ] Test with new user (no data)
- [ ] Test with only transactions (no crypto)
- [ ] Test with only crypto (no transactions)
- [ ] Test with large values
- [ ] Test with negative bank balance

#### Step 4: Accessibility Testing

- [ ] Test keyboard navigation
- [ ] Verify screen reader compatibility
- [ ] Check color contrast ratios
- [ ] Add missing ARIA labels

#### Step 5: Performance Check

- [ ] Verify page load time
- [ ] Check for unnecessary re-renders
- [ ] Verify query caching works

#### Step 6: Final Polish

- [ ] Fix any remaining bugs
- [ ] Improve error messages
- [ ] Polish animations/transitions

### Files Created/Modified

| Action   | File                     |
| -------- | ------------------------ |
| Modified | [List files as you work] |

---

## Dependencies Diagram

```
Phase 1 (UI + Mock Data)
    │
    ▼
Phase 2 (Database & API)
    │
    ▼
Phase 3 (Snapshot System)
    │
    ▼
Phase 4 (Integration)
    │
    ▼
Phase 5 (Testing & Polish)
    │
    ▼
Feature Complete ✅
```

---

## Notes

### Architecture Decisions

- **Snapshot vs On-the-fly**: Chose daily snapshots for historical accuracy, similar to crypto portfolio
- **RPC Functions**: Using database functions for totals to leverage SQL aggregation efficiency
- **Combined Hook**: `useDashboardData()` fetches both all-time and monthly totals for convenience

### Known Issues

[Track any known issues or limitations]

### Future Improvements

- Add weekly/monthly trend indicators (up/down arrows with percentage)
- Add "savings rate" card (income - expenses as percentage)
- Add goal tracking (e.g., "Save 10M by end of year")
- Add comparison with previous month/year
