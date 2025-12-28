# Calendar Page - Feature Specification

This document outlines the features for the Calendar page. Each feature will be implemented incrementally with accompanying design references.

---

## Layout Overview

The page consists of:
- **Header**: Page title (left) and action buttons (right)
- **Body**: Two-column layout with calendar (left, 2/3 width) and transaction list (right, 1/3 width)

---

## Features

### 1. Page Header

**Page Title**
- Position: Top-left
- Display: "Calendar" or similar heading

**Action Buttons** (Top-right, left to right)
- "Manage Tags" button
- "Add Transaction" button

---

### 2. Manage Tags Modal

Triggered by clicking the "Manage Tags" button.

**Modal Content:**
- List of all tags, separated by category:
  - Expense tags
  - Income tags
- Each tag displays:
  - Emoji icon
  - Tag name
- Actions per tag:
  - Edit (modify name and/or emoji)
  - Delete
- Modal footer:
  - "Cancel" button - discards changes and closes modal
  - "Save Changes" button - persists changes and closes modal

---

### 3. Add Transaction Modal

Triggered by clicking the "Add Transaction" button.

**Form Fields:**
- Transaction type selector (Expense / Income)
- Title (text input, required)
- Date (date picker, required)
- Amount (number input, required)
- Tag (dropdown, optional) - options filtered based on selected transaction type

**Actions:**
- Submit to create transaction
- Cancel to close modal

---

### 4. Calendar Section

Position: Left side of body (2/3 width)

**Month Navigator**
- Position: Top of calendar section
- Controls: Previous/Next month buttons with current month/year display
- Allows navigation month by month

**Monthly Summary**
- Position: Below month navigator
- Displays three values for the selected month:
  - Total Income
  - Total Expenses
  - Balance (Income - Expenses)

**Calendar Grid**
- Displays all days of the selected month
- Each day cell shows:
  - Date number
  - Daily totals (if transactions exist):
    - Total income for that day
    - Total expenses for that day
- Click behavior: Selecting a date updates the transaction list panel

---

### 5. Date Transaction List

Position: Right side of body (1/3 width)

**Header:**
- Display selected date

**Transaction List:**
- Shows all transactions for the selected date
- Each transaction item displays:
  - Transaction type indicator (expense/income)
  - Title
  - Amount
  - Tag (if assigned)
  - Action buttons:
    - Edit - opens edit modal
    - Delete - removes transaction

**Edit Transaction Modal:**
- Same fields as Add Transaction modal
- Pre-populated with existing transaction data
- Save/Cancel actions

**Layout Behavior:**
- Height matches calendar section
- Scrollable when content overflows
- Empty state: Centered message when no transactions exist for selected date

---

## Database Schema (Reference)

Tables needed:
- `tags` - id, name, emoji, type (expense/income), user_id, created_at
- `transactions` - id, title, amount, date, type (expense/income), tag_id (nullable), user_id, created_at

---

## Implementation Order (Suggested)

1. Database schema and Supabase setup
2. Page layout and routing
3. Calendar component with month navigation
4. Monthly summary display
5. Transaction list panel with empty state
6. Add Transaction modal and functionality
7. Edit/Delete transaction functionality
8. Manage Tags modal and functionality
9. Calendar day indicators (income/expense totals)

---

## Notes

- Design references will be provided for each feature before implementation
- All monetary values should be formatted consistently
- Consider timezone handling for date operations
