# Reports Feature Specification

## Overview

The Reports page provides users with a visual breakdown of their spending and income distribution by tag/category. Users can view their financial data in monthly or yearly aggregations, switch between expense and income views, and drill down into specific tags to see individual transactions or monthly summaries.

## User Stories

- As a user, I want to see a pie chart showing how my expenses are distributed across different categories so I can understand where my money goes
- As a user, I want to switch between monthly and yearly views so I can analyze my spending patterns at different time scales
- As a user, I want to navigate between different months/years so I can compare my spending over time
- As a user, I want to switch between expense and income views so I can analyze both spending and earnings
- As a user, I want to click on a category to see the detailed transactions for that category
- As a user, I want to edit or delete transactions directly from the reports page so I can correct mistakes without leaving the page
- As a user, I want to see untagged transactions as a separate "Untagged" category so I know how much spending is uncategorized

## Functional Requirements

### FR-1: Page Header with Toggle Controls

- **Description**: Page title "Reports" with subtitle "Detailed breakdown of your finances" on the left, toggle controls on the right
- **Toggles**:
  - Time Mode: Monthly | Yearly (tab-style toggle)
  - Transaction Type: Expense | Income (tab-style toggle with Expense highlighted in yellow when active)
- **Acceptance Criteria**:
  - Toggles are visually distinct and clearly show active state
  - Clicking toggles immediately updates the view
  - Default state on page load: Monthly + Expense

### FR-2: Distribution Pie Chart

- **Description**: Donut chart showing percentage distribution of transactions by tag
- **Data Source**: Transactions filtered by selected time period and type (expense/income)
- **Display**:
  - Each tag represented as a segment with distinct color
  - Center of donut shows the current period label (e.g., "Oct 23" for monthly, "2023" for yearly)
  - Above chart: "TOTAL EXPENSES" or "TOTAL INCOME" label with total amount formatted using `formatCurrency()`
  - Time period selector next to total (e.g., "Oct 2023" button that allows navigation)
- **Calculation**:
  - Each tag's percentage = (sum of transactions with that tag) / (total of all transactions) * 100
  - Untagged transactions (tag_id = null) grouped as "Untagged" category
- **Acceptance Criteria**:
  - Pie chart renders smoothly with animations
  - Segments are clickable to select the tag
  - Hover shows tooltip with tag name, amount, and percentage
  - Colors are consistent for the same tag across sessions

### FR-3: Time Period Navigation

- **Description**: Allow users to navigate between different time periods
- **Monthly Mode**:
  - Show month and year (e.g., "Oct 2023")
  - Left/right arrows or buttons to go to previous/next month
  - Navigate through all available historical data
- **Yearly Mode**:
  - Show year (e.g., "2023")
  - Left/right arrows or buttons to go to previous/next year
  - Navigate through all available historical data
- **Acceptance Criteria**:
  - Navigation arrows are disabled at data boundaries (can't go to months/years with no data)
  - URL reflects current time period for shareability/bookmarking (optional)
  - Transitions between periods are smooth

### FR-4: Tag List (Below Pie Chart)

- **Description**: Sorted list of tags showing their contribution to the total
- **Display per tag**:
  - Tag color indicator (matches pie chart segment)
  - Tag emoji and name
  - Total amount for the period (using `formatCurrency()`)
  - Percentage of total
- **Sorting**: Descending by amount (highest spender first)
- **Interaction**: Clicking a tag selects it and updates the right panel
- **Selected State**: Visual highlight (border or background) to show which tag is selected
- **Untagged Category**: Shown as "Untagged" with a neutral color if transactions without tags exist
- **Acceptance Criteria**:
  - List updates when time period or type changes
  - Selected tag is visually highlighted
  - Empty state shown when no transactions exist

### FR-5: Right Panel - Monthly Mode (Transaction List)

- **Description**: When in monthly mode and a tag is selected, show all transactions for that tag in the selected month
- **Display per transaction**:
  - Tag emoji (icon representation)
  - Transaction title
  - Transaction date (e.g., "OCT 29")
  - Amount with +/- prefix based on type
- **Interaction**:
  - Click on transaction to edit (opens edit modal same as calendar page)
  - Delete transaction (with confirmation)
- **Sorting**: By date descending (most recent first)
- **Empty State**: "No transactions" message when tag has no transactions
- **No Selection State**: "No Tag Selected" with prompt to select a tag from the left
- **Acceptance Criteria**:
  - Transaction list updates when different tag is selected
  - Edit/delete functionality works correctly
  - Changes reflect immediately in pie chart and tag list

### FR-6: Right Panel - Yearly Mode (Monthly Totals)

- **Description**: When in yearly mode and a tag is selected, show monthly totals for that tag across the year
- **Display**:
  - List of all 12 months (January - December)
  - Amount spent/earned on that tag for each month
  - Months with $0 still shown (displays "$0.00" or equivalent)
- **Sorting**: Chronological (January first)
- **No Selection State**: Same as monthly mode - "No Tag Selected"
- **Acceptance Criteria**:
  - All 12 months displayed even if some have no data
  - Amounts correctly aggregated per month

### FR-7: Empty States

- **No Data (Pie Chart)**: Show "No Data" placeholder when no transactions exist for the period
- **No Tags**: Show "No tags to display" when all transactions are either untagged or no transactions exist
- **No Activity (Right Panel)**: Show "No Activity - No financial activity for this period" when period has no transactions
- **No Tag Selected (Right Panel)**: Show "No Tag Selected - Select a category tag from the list on the left..."
- **Acceptance Criteria**:
  - Empty states are visually clear and helpful
  - Match the design shown in mockups

### FR-8: Transaction Edit/Delete (Modal Reuse)

- **Description**: Reuse existing transaction edit modal from calendar page
- **Edit Modal**: Opens with transaction data pre-filled, allows editing all fields
- **Delete**: Confirmation dialog before deletion
- **After Action**:
  - Close modal
  - Refresh data to update pie chart and totals
  - Keep same tag selected
- **Acceptance Criteria**:
  - Modal behavior matches calendar page
  - Data refreshes without full page reload

## Data Models

### Existing Models Used

#### Transaction (from `src/lib/api/transactions.ts`)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner reference |
| title | string | Transaction description |
| amount | number | Amount in VND |
| date | string | ISO date (YYYY-MM-DD) |
| type | 'expense' \| 'income' | Transaction type |
| tag_id | uuid \| null | Reference to tag (nullable) |
| created_at | string | Creation timestamp |
| updated_at | string | Last update timestamp |

#### Tag (from `src/lib/api/tags.ts`)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner reference |
| name | string | Tag name (max 50 chars) |
| emoji | string | Tag emoji |
| type | 'expense' \| 'income' | Tag type |
| created_at | string | Creation timestamp |
| updated_at | string | Last update timestamp |

### Derived Types (New)

#### TagDistribution
| Field | Type | Description |
|-------|------|-------------|
| tagId | string \| null | Tag ID (null for untagged) |
| tagName | string | Tag name or "Untagged" |
| tagEmoji | string | Tag emoji or default icon |
| amount | number | Total amount for period |
| percentage | number | Percentage of total (0-100) |
| color | string | Chart segment color |

#### MonthlyTagTotal
| Field | Type | Description |
|-------|------|-------------|
| month | number | Month number (0-11) |
| monthName | string | Month name (January, February, etc.) |
| amount | number | Total amount for that month |

## UI Components

### ReportsPage (`src/routes/_authenticated/reports.tsx`)
- Main page component
- Manages state for: time mode, transaction type, selected period, selected tag
- Two-column layout (left: chart + tags, right: details)

### ReportsHeader
- Page title and subtitle
- Toggle controls for Monthly/Yearly and Expense/Income

### DistributionPieChart
- Donut chart using recharts library
- Period label in center
- Interactive segments (hover, click)
- Total display above chart

### PeriodNavigator
- Current period display
- Previous/next navigation buttons
- Disabled states at boundaries

### TagList
- Scrollable list of tags
- Each item shows: color, emoji, name, amount, percentage
- Click to select
- Selected state styling

### TransactionListPanel (Monthly Mode)
- Header: "TRANSACTION LISTING"
- List of transactions for selected tag
- Each item clickable to edit
- Empty/no-selection states

### MonthlyTotalsPanel (Yearly Mode)
- Header: "MONTHLY TOTALS"
- List of all 12 months with amounts
- Empty/no-selection states

### EditTransactionModal (Reused)
- Import from existing calendar components
- Same functionality

## State Management

### Query Keys
```typescript
// Add to src/lib/query-keys.ts
reports: {
  byPeriod: (year: number, month?: number, type?: 'expense' | 'income') =>
    ['reports', year, month, type] as const,
}
```

### Local State (Page Level)
- `timeMode`: 'monthly' | 'yearly'
- `transactionType`: 'expense' | 'income'
- `year`: number (current year default)
- `month`: number (current month default, 0-11)
- `selectedTagId`: string | null

### Mutations
- Reuse existing `useUpdateTransaction` and `useDeleteTransaction` hooks
- Cache invalidation should update reports queries

## Edge Cases

- [ ] Empty state: User has no transactions at all
- [ ] Empty period: Selected month/year has no transactions
- [ ] All untagged: All transactions in period have no tag
- [ ] Single tag: Only one tag exists (pie chart shows 100%)
- [ ] Very small percentages: Tags with < 1% (show "< 1%" not "0%")
- [ ] Large number of tags: Scrollable tag list, limited chart colors
- [ ] Editing changes tag: Transaction moved out of selected tag view
- [ ] Deleting last transaction: Tag disappears from list
- [ ] Currency formatting: All amounts in VND using formatCompact/formatCurrency

## Security Considerations

- RLS policies ensure users only see their own transactions
- No new database tables needed (uses existing transactions/tags)
- Transaction mutations reuse existing secure API functions

## Dependencies

### External Libraries
- `recharts` - Pie chart visualization

### Internal Modules
- `src/lib/api/transactions.ts` - Transaction CRUD
- `src/lib/api/tags.ts` - Tag fetching
- `src/lib/hooks/use-transactions.ts` - Transaction query hooks
- `src/lib/hooks/use-tags.ts` - Tag query hooks
- `src/lib/currency.ts` - formatCompact, formatCurrency
- `src/components/calendar/edit-transaction-modal.tsx` - Reuse for editing

## Technical Notes

### Chart Colors
- Generate consistent colors for tags based on tag ID hash
- Ensure sufficient contrast between adjacent segments
- "Untagged" uses a neutral gray color

### Performance Considerations
- Fetch all transactions for period at once, compute distribution client-side
- Avoid re-fetching when only selected tag changes
- Consider virtualization if tag list becomes very long

### Responsive Design
- Mobile: Stack panels vertically (chart on top, details below)
- Tablet+: Side-by-side layout as shown in mockups
