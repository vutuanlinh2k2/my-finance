# Subscriptions Feature - Implementation Progress

## Overview

| Phase   | Description                 | Status      |
| ------- | --------------------------- | ----------- |
| Phase 1 | UI + localStorage mock data | Complete    |
| Phase 2 | Supabase CRUD               | Complete    |
| Phase 3 | Exchange Rate API           | Not Started |
| Phase 4 | Auto-Create Expense         | Not Started |

---

## Phase 1: UI with Mock Data (Complete)

### Summary

All Phase 1 functionality has been implemented and tested:

- Adding, editing, and deleting subscriptions
- localStorage persistence for mock data
- Summary calculations with hardcoded VND conversion (25,000 VND/USD)
- Urgency indicators for upcoming due dates
- Edge case handling (Feb 31 → Feb 28, etc.)

### Files Created

- `src/lib/subscriptions/types.ts`
- `src/lib/subscriptions/utils.ts`
- `src/lib/subscriptions/mock-data.ts`
- `src/components/subscriptions/*.tsx` (9 components)
- `src/routes/_authenticated/subscriptions.tsx`

---

## Phase 2: Supabase CRUD (Complete)

### Goal

Replace localStorage with real Supabase database persistence.

### Summary

All Phase 2 functionality has been implemented and tested:

- Database migration with RLS policies
- API layer with CRUD operations
- React Query hooks for data fetching/mutations
- USD amounts stored as cents (BIGINT-safe)
- Loading states and error handling with toast notifications

### Success Criteria

- [x] Subscriptions persist in Supabase database
- [x] Data survives browser clear/different devices
- [x] RLS ensures users only see their own subscriptions
- [x] All CRUD operations work with real database
- [x] Loading states shown during data fetching
- [x] Error handling for API failures

### Implementation Steps

#### Step 1: Database Migration

- [x] Create `supabase/migrations/20251230092329_create_subscriptions_table.sql`
- [x] Run `pnpm db:migrate`
- [x] Regenerate types with `pnpm db:types`
- [x] Check Security Advisor (0 errors, 0 warnings)
- [x] Check Performance Advisor (0 errors, 0 warnings)

**Schema:**

```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE SET NULL,
  currency TEXT NOT NULL CHECK (currency IN ('VND', 'USD')),
  amount BIGINT NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('monthly', 'yearly')),
  day_of_month INTEGER NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
  month_of_year INTEGER CHECK (month_of_year >= 1 AND month_of_year <= 12),
  management_url TEXT,
  last_payment_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT subscriptions_yearly_month_required
    CHECK (type = 'monthly' OR (type = 'yearly' AND month_of_year IS NOT NULL))
);
```

#### Step 2: API Layer

- [x] Create `src/lib/api/subscriptions.ts`
- [x] Implement `fetchSubscriptions()`
- [x] Implement `createSubscription()`
- [x] Implement `updateSubscription()`
- [x] Implement `deleteSubscription()`

#### Step 3: React Query Hooks

- [x] Add subscription keys to `src/lib/query-keys.ts`
- [x] Create `src/lib/hooks/use-subscriptions.ts`
- [x] Implement `useSubscriptions()`
- [x] Implement `useCreateSubscription()`
- [x] Implement `useUpdateSubscription()`
- [x] Implement `useDeleteSubscription()`

#### Step 4: Update UI Components

- [x] Update `src/routes/_authenticated/subscriptions.tsx` to use real hooks
- [x] Update `src/components/subscriptions/add-subscription-modal.tsx`
- [x] Update `src/components/subscriptions/edit-subscription-modal.tsx`
- [x] Add loading states to summary cards
- [x] Add loading states to table
- [x] Add error handling with toast notifications

#### Step 5: Cleanup

- [x] Delete `src/lib/subscriptions/mock-data.ts`
- [x] Update `src/lib/subscriptions/index.ts`
- [x] Update types to use database types

#### Step 6: Testing

- [x] Test create subscription
- [x] Test edit subscription
- [x] Test delete subscription
- [x] Test page reload persistence
- [x] Test RLS (cannot see other users' data)
- [x] Test empty state for new users
- [x] Playwright testing

### Files Created/Modified

| Action  | File                                                                |
| ------- | ------------------------------------------------------------------- |
| Created | `supabase/migrations/20251230092329_create_subscriptions_table.sql` |
| Created | `src/lib/api/subscriptions.ts`                                      |
| Created | `src/lib/hooks/use-subscriptions.ts`                                |
| Modified | `src/lib/query-keys.ts`                                            |
| Modified | `src/lib/subscriptions/utils.ts` (USD cents conversion)           |
| Modified | `src/lib/subscriptions/index.ts`                                   |
| Modified | `src/routes/_authenticated/subscriptions.tsx`                      |
| Modified | `src/components/subscriptions/add-subscription-modal.tsx`          |
| Modified | `src/components/subscriptions/edit-subscription-modal.tsx`         |
| Deleted | `src/lib/subscriptions/mock-data.ts`                                |

---

## Phase 3: Exchange Rate API (Accurate Calculations)

### Goal

Real-time USD to VND conversion for accurate summary card calculations.

### Success Criteria

- [ ] Exchange rate fetched from reliable API
- [ ] Rate cached to avoid excessive API calls
- [ ] Graceful fallback when API fails
- [ ] Summary cards show accurate converted amounts
- [ ] Rate refreshed periodically (e.g., daily)

### Implementation Steps

#### Step 1: Exchange Rate Service

- [ ] Create `src/lib/api/exchange-rate.ts`
- [ ] Choose API provider (exchangerate-api.com, fixer.io, or free alternative)
- [ ] Implement `fetchExchangeRate()`
- [ ] Implement caching strategy (localStorage with TTL)

#### Step 2: Integration

- [ ] Create `src/lib/hooks/use-exchange-rate.ts`
- [ ] Update summary card calculations to use real rate
- [ ] Add loading state while fetching rate
- [ ] Add error handling with fallback to last known rate

#### Step 3: Testing

- [ ] Test rate fetching
- [ ] Test cache hit/miss scenarios
- [ ] Test fallback when API fails
- [ ] Test summary card accuracy

### Files to Create/Modify

| Action | File                                                          |
| ------ | ------------------------------------------------------------- |
| Create | `src/lib/api/exchange-rate.ts`                                |
| Create | `src/lib/hooks/use-exchange-rate.ts`                          |
| Modify | `src/components/subscriptions/subscription-summary-cards.tsx` |
| Modify | `src/lib/subscriptions/utils.ts`                              |

### API Options

| Provider             | Free Tier            | Notes                      |
| -------------------- | -------------------- | -------------------------- |
| exchangerate-api.com | 1,500 requests/month | Simple, reliable           |
| fixer.io             | 100 requests/month   | Popular, limited free      |
| frankfurter.app      | Unlimited            | Open source, EUR base only |
| Open Exchange Rates  | 1,000 requests/month | Good documentation         |

---

## Phase 4: Auto-Create Expense (Background Automation)

### Goal

Automatically create expense transactions when subscriptions are due.

### Success Criteria

- [ ] Expense transactions created automatically on due dates
- [ ] USD subscriptions converted to VND using exchange rate
- [ ] `last_payment_date` updated to prevent duplicates
- [ ] Works even if user doesn't visit the app
- [ ] Handles edge cases (missed days, timezone issues)

### Implementation Steps

#### Step 1: Enable pg_cron Extension

- [ ] Enable pg_cron in Supabase project settings
- [ ] Verify extension is active

#### Step 2: Database Function

- [ ] Create `process_subscription_payments()` function
- [ ] Handle monthly vs yearly logic
- [ ] Handle day overflow (e.g., Feb 31 → Feb 28)
- [ ] Convert USD to VND using stored/cached rate
- [ ] Update `last_payment_date` after creating transaction

```sql
CREATE OR REPLACE FUNCTION process_subscription_payments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
-- Implementation here
$$;
```

#### Step 3: Schedule Cron Job

- [ ] Create cron job to run daily
- [ ] Choose appropriate time (e.g., 00:05 UTC)

```sql
SELECT cron.schedule(
  'process-subscription-payments',
  '5 0 * * *',
  'SELECT process_subscription_payments()'
);
```

#### Step 4: Exchange Rate for Auto-Expense

- [ ] Store exchange rate in database table for cron access
- [ ] Or use Edge Function to fetch rate during processing

#### Step 5: Testing

- [ ] Test with monthly subscription
- [ ] Test with yearly subscription
- [ ] Test USD → VND conversion
- [ ] Test missed payment catchup
- [ ] Test duplicate prevention
- [ ] Verify transactions appear in calendar

### Files to Create/Modify

| Action | File                                                                         |
| ------ | ---------------------------------------------------------------------------- |
| Create | `supabase/migrations/YYYYMMDDHHMMSS_add_subscription_payment_processing.sql` |
| Create | `supabase/migrations/YYYYMMDDHHMMSS_schedule_payment_cron.sql`               |
| Modify | Database (via SQL editor for cron setup)                                     |

### Edge Cases to Handle

- Subscription created mid-month (don't create expense for past date)
- User deletes subscription (stop future auto-expenses)
- Day 31 subscriptions in months with fewer days
- Timezone considerations (use UTC consistently)
- Exchange rate unavailable (use fallback rate)

---

## Dependencies Diagram

```
Phase 1 (Complete)
    │
    ▼
Phase 2: Supabase CRUD
    │
    ├──────────────────┐
    ▼                  ▼
Phase 3: Exchange   Phase 4: Auto-Expense
Rate API            (can start after Phase 2,
    │                but needs Phase 3 for
    │                accurate USD conversion)
    └───────┬─────────┘
            ▼
      Feature Complete
```

**Note:** Phase 3 and 4 can be developed in parallel after Phase 2, but Phase 4 should integrate the exchange rate from Phase 3 for accurate USD → VND conversion in auto-created expenses.
