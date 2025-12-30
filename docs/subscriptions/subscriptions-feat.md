# Subscription Page - Feature Specification

This document outlines the features for the Subscription page. Each feature will be implemented incrementally with accompanying design references.

---

## Layout Overview

The page consists of:

- **Header**: Page title (left) and "Add Subscription" button (right)
- **Summary Cards**: Three cards displaying cost summaries
- **Body**: Table listing all subscriptions

---

## Features

### 1. Page Header

**Page Title**

- Position: Top-left
- Display: "Subscriptions" or similar heading

**Action Button** (Top-right)

- "Add Subscription" button - opens the Add Subscription modal

---

### 2. Summary Cards

Position: Below header, above the table

**Card 1: Average Monthly Cost**

- Calculation: Total Monthly Cost + (Total Yearly Cost / 12)
- All amounts converted to VND before calculation

**Card 2: Total Monthly Cost**

- Calculation: Sum of all subscriptions with "monthly" type
- USD subscriptions converted to VND using current exchange rate

**Card 3: Total Yearly Cost**

- Calculation: Sum of all subscriptions with "yearly" type
- USD subscriptions converted to VND using current exchange rate

**Currency Conversion:**

- Exchange rate fetched from external API
- All card values displayed in VND

---

### 3. Subscriptions Table

Position: Below summary cards

**Table Columns:**

| Column            | Description                                                   |
| ----------------- | ------------------------------------------------------------- |
| Title             | Subscription name                                             |
| Tag               | Associated expense tag (emoji + name)                         |
| Type              | "Monthly" or "Yearly"                                         |
| Price             | Amount with currency indicator (e.g., "150,000 ₫" or "$9.99") |
| Upcoming Due Date | Next payment date calculated from today                       |
| Management Page   | Link to external subscription management (icon/button)        |
| Actions           | Edit and Delete icon buttons                                  |

**Upcoming Due Date Calculation:**

- For monthly: Next occurrence of the specified day from today
- For yearly: Next occurrence of the specified day and month from today

**Actions:**

- Edit: Opens Edit Subscription modal with current data
- Delete: Removes subscription (related expense items are preserved)

**Empty State:**

- Centered message when no subscriptions exist
- Prompt to add first subscription

---

### 4. Add Subscription Modal

Triggered by clicking the "Add Subscription" button.

**Form Fields:**

| Field          | Type          | Required    | Notes                                  |
| -------------- | ------------- | ----------- | -------------------------------------- |
| Title          | Text input    | Yes         | Subscription name                      |
| Tag            | Dropdown      | No          | Expense tags only                      |
| Currency       | Select        | Yes         | VND or USD                             |
| Amount         | Number input  | Yes         | Cost per billing cycle                 |
| Type           | Select        | Yes         | Monthly or Yearly                      |
| Day of Month   | Select (1-31) | Yes         | Recurring payment day                  |
| Month          | Select (1-12) | Conditional | Only shown when Type is "Yearly"       |
| Management URL | Text input    | No          | Link to manage subscription externally |

**Conditional Logic:**

- When Type = "Monthly": Show only Day of Month field
- When Type = "Yearly": Show both Day of Month and Month fields

**Actions:**

- Submit: Creates new subscription
- Cancel: Closes modal without saving

---

### 5. Edit Subscription Modal

Triggered by clicking the Edit button on a subscription row.

**Form Fields:**

- Same fields as Add Subscription modal
- Pre-populated with existing subscription data

**Actions:**

- Save Changes: Updates subscription
- Cancel: Closes modal without saving

---

### 6. Auto-Create Expense (Background Process)

**Note:** This feature is already implemented.

**Behavior:**

- On the due date of a subscription, system automatically creates a new expense transaction
- For USD subscriptions, amount is converted to VND using current exchange rate
- The expense transaction includes:
  - Title: Subscription title
  - Amount: Converted to VND if necessary
  - Date: Due date
  - Type: Expense
  - Tag: Same as subscription tag (if set)

**Important:** Deleting a subscription does NOT delete previously created expense items.

---

## Database Schema (Reference)

**New Table: `subscriptions`**

| Column            | Type        | Notes                                       |
| ----------------- | ----------- | ------------------------------------------- |
| id                | UUID        | Primary key                                 |
| title             | TEXT        | Required                                    |
| tag_id            | UUID        | Nullable, FK to tags table                  |
| currency          | TEXT        | 'VND' or 'USD'                              |
| amount            | NUMERIC     | Cost per billing cycle                      |
| type              | TEXT        | 'monthly' or 'yearly'                       |
| day_of_month      | INTEGER     | 1-31                                        |
| month_of_year     | INTEGER     | 1-12, nullable (only for yearly)            |
| management_url    | TEXT        | Nullable                                    |
| user_id           | UUID        | FK to auth.users                            |
| created_at        | TIMESTAMPTZ | Auto-generated                              |
| last_payment_date | DATE        | Nullable, updated when auto-expense created |

**Existing Table Reference: `transactions`**

- Used for auto-created expense items
- Schema already exists from Calendar feature

**Existing Table Reference: `tags`**

- Subscriptions can only reference tags with type = 'expense'

---

## Currency Conversion

**Exchange Rate Source:**

- Fetched from external API (e.g., exchangerate-api.com, fixer.io)
- Used for:
  - Summary card calculations
  - Auto-creating expense transactions

**Implementation Considerations:**

- Cache exchange rate to avoid excessive API calls
- Handle API failures gracefully (show error or use last known rate)
- Consider storing the exchange rate used when creating expense items for historical accuracy

---

## Implementation Order (Suggested)

1. Database schema and Supabase migration
2. Exchange rate API integration and utility functions
3. Page layout and routing
4. Summary cards (with mock data initially)
5. Subscriptions table with empty state
6. Add Subscription modal and functionality
7. Edit Subscription modal and functionality
8. Delete subscription functionality
9. Connect summary cards to real data with currency conversion
10. Verify auto-expense creation works with USD conversion

---

## Notes

- All monetary values should be formatted using the app's currency utilities (`formatCompact`, `formatCurrency`)
- USD amounts displayed as-is in table, but converted for card calculations
- Management URL should open in new tab when clicked
- Consider adding visual indicator for USD vs VND subscriptions in the table
- Design references will be provided for each feature before implementation
