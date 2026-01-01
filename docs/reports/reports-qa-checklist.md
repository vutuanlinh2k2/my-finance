# Reports Feature - QA Testing Checklist

This checklist provides comprehensive quality assurance coverage for the Reports feature. Each item should be tested and verified before the feature is considered complete.

---

## 1. Functional Requirements

### FR-1: Page Header with Toggle Controls

- [ ] Page title "Reports" displays on the left side
- [ ] Subtitle "Detailed breakdown of your finances" displays below title
- [ ] Monthly/Yearly toggle displays on the right side
- [ ] Expense/Income toggle displays on the right side
- [ ] Monthly toggle shows active state when selected
- [ ] Yearly toggle shows active state when selected
- [ ] Expense toggle shows yellow highlight when active
- [ ] Income toggle shows active state when selected
- [ ] Clicking Monthly toggle immediately updates the view
- [ ] Clicking Yearly toggle immediately updates the view
- [ ] Clicking Expense toggle immediately updates the view
- [ ] Clicking Income toggle immediately updates the view
- [ ] Default state on page load: Monthly + Expense

### FR-2: Distribution Pie Chart

- [ ] Donut chart renders with correct segments
- [ ] Each tag has a distinct color segment
- [ ] Center of donut shows current period label (e.g., "Oct 23" for monthly)
- [ ] Center of donut shows year label for yearly mode (e.g., "2023")
- [ ] "TOTAL EXPENSES" label appears above chart when viewing expenses
- [ ] "TOTAL INCOME" label appears above chart when viewing income
- [ ] Total amount displays using formatCurrency() format
- [ ] Pie chart renders with smooth animations
- [ ] Pie chart segments are clickable to select the tag
- [ ] Hover on segment shows tooltip with tag name
- [ ] Hover on segment shows tooltip with amount
- [ ] Hover on segment shows tooltip with percentage
- [ ] Colors remain consistent for the same tag across page reloads

### FR-3: Time Period Navigation

#### Monthly Mode

- [ ] Current month and year display (e.g., "Oct 2023")
- [ ] Left arrow navigates to previous month
- [ ] Right arrow navigates to next month
- [ ] Can navigate through all available historical months
- [ ] Navigation arrows disabled at data boundaries (no earlier data)
- [ ] Period transitions are smooth without jarring UI

#### Yearly Mode

- [ ] Current year displays (e.g., "2023")
- [ ] Left arrow navigates to previous year
- [ ] Right arrow navigates to next year
- [ ] Can navigate through all available historical years
- [ ] Navigation arrows disabled at data boundaries

### FR-4: Tag List

- [ ] Tag list displays below the pie chart
- [ ] Tags sorted by amount (highest first)
- [ ] Each tag shows color indicator matching pie chart segment
- [ ] Each tag shows emoji
- [ ] Each tag shows name
- [ ] Each tag shows total amount using formatCurrency()
- [ ] Each tag shows percentage of total
- [ ] Clicking a tag selects it
- [ ] Selected tag has visual highlight (border or background)
- [ ] Tag list updates when time period changes
- [ ] Tag list updates when transaction type changes
- [ ] "Untagged" category appears when transactions without tags exist
- [ ] "Untagged" category uses neutral color
- [ ] Empty state shown when no transactions exist

### FR-5: Right Panel - Monthly Mode (Transaction List)

- [ ] Header shows "TRANSACTION LISTING"
- [ ] Displays all transactions for selected tag in selected month
- [ ] Each transaction shows tag emoji/icon
- [ ] Each transaction shows title
- [ ] Each transaction shows date (e.g., "OCT 29")
- [ ] Each transaction shows amount with +/- prefix
- [ ] Transactions sorted by date descending (most recent first)
- [ ] Click on transaction opens edit modal
- [ ] Transaction list updates when different tag selected
- [ ] "No transactions" message when tag has no transactions
- [ ] "No Tag Selected" with prompt when no tag selected

### FR-6: Right Panel - Yearly Mode (Monthly Totals)

- [ ] Header shows "MONTHLY TOTALS"
- [ ] Shows all 12 months (January - December)
- [ ] Each month shows amount spent/earned for selected tag
- [ ] Months with zero show "0" or equivalent formatted value
- [ ] Months displayed in chronological order (January first)
- [ ] "No Tag Selected" message when no tag selected

### FR-7: Empty States

- [ ] "No Data" placeholder when no transactions exist for period
- [ ] "No tags to display" when no tagged transactions exist
- [ ] "No Activity - No financial activity for this period" in right panel when empty
- [ ] "No Tag Selected - Select a category tag from the list on the left..." when no selection
- [ ] Empty states are visually clear and helpful

### FR-8: Transaction Edit/Delete (Modal Reuse)

- [ ] Edit modal opens with transaction data pre-filled
- [ ] Edit modal allows editing all transaction fields
- [ ] Delete requires confirmation dialog
- [ ] After edit, modal closes and data refreshes
- [ ] After delete, modal closes and data refreshes
- [ ] Pie chart updates after edit/delete
- [ ] Tag list updates after edit/delete
- [ ] Selected tag remains selected after edit/delete (if still exists)

---

## 2. Data Accuracy

### Pie Chart Calculations

- [ ] All segment percentages sum to 100%
- [ ] Each segment percentage matches: (tag total / grand total) * 100
- [ ] Segment sizes visually proportional to percentages
- [ ] No rounding errors cause total to exceed 100%

### Tag Amount Calculations

- [ ] Each tag amount equals sum of all transactions with that tag
- [ ] Total displayed equals sum of all tag amounts
- [ ] Untagged amount equals sum of transactions with null tag_id
- [ ] Switching Expense/Income shows correct amounts for each type

### Monthly Totals (Yearly View)

- [ ] January total matches sum of tag transactions in January
- [ ] February total matches sum of tag transactions in February
- [ ] March total matches sum of tag transactions in March
- [ ] April total matches sum of tag transactions in April
- [ ] May total matches sum of tag transactions in May
- [ ] June total matches sum of tag transactions in June
- [ ] July total matches sum of tag transactions in July
- [ ] August total matches sum of tag transactions in August
- [ ] September total matches sum of tag transactions in September
- [ ] October total matches sum of tag transactions in October
- [ ] November total matches sum of tag transactions in November
- [ ] December total matches sum of tag transactions in December
- [ ] Sum of all monthly totals equals tag's yearly total

### Transaction Filtering

- [ ] Only expense transactions shown when Expense selected
- [ ] Only income transactions shown when Income selected
- [ ] Only transactions from selected month shown in monthly mode
- [ ] Only transactions from selected year shown in yearly mode

---

## 3. State Management

### Time Mode Toggle

- [ ] Switching Monthly to Yearly updates pie chart
- [ ] Switching Monthly to Yearly updates tag list
- [ ] Switching Monthly to Yearly updates right panel
- [ ] Switching Yearly to Monthly updates pie chart
- [ ] Switching Yearly to Monthly updates tag list
- [ ] Switching Yearly to Monthly updates right panel

### Transaction Type Toggle

- [ ] Switching Expense to Income updates pie chart
- [ ] Switching Expense to Income updates tag list
- [ ] Switching Expense to Income updates right panel
- [ ] Switching Income to Expense updates pie chart
- [ ] Switching Income to Expense updates tag list
- [ ] Switching Income to Expense updates right panel

### Period Navigation

- [ ] Navigating to previous period updates all data
- [ ] Navigating to next period updates all data
- [ ] Period label updates correctly

### Tag Selection

- [ ] Selecting a tag updates right panel
- [ ] Selecting different tag updates right panel
- [ ] Selected tag persists when changing time period (if tag still exists)
- [ ] Selected tag clears when it no longer exists in new period/type

### Cache Invalidation

- [ ] Editing a transaction invalidates reports cache
- [ ] Deleting a transaction invalidates reports cache
- [ ] Data refreshes without full page reload after mutations

---

## 4. API Integration

### Data Fetching

- [ ] Transactions fetched for correct time period
- [ ] Transactions fetched for correct type (expense/income)
- [ ] Tags loaded correctly on page load
- [ ] No duplicate API calls on toggle changes

### Error Handling

- [ ] Network error displays appropriate error message
- [ ] Failed transaction edit shows error notification
- [ ] Failed transaction delete shows error notification
- [ ] Page handles API timeout gracefully

### Loading States

- [ ] Loading indicator shown while fetching data
- [ ] Pie chart shows loading state during fetch
- [ ] Tag list shows loading state during fetch
- [ ] Right panel shows loading state during fetch

---

## 5. User Flows

### Default View Flow

- [ ] Page loads with current month selected
- [ ] Page loads with Expense type selected
- [ ] Pie chart shows current month's expense distribution
- [ ] Tag list shows current month's expense tags

### Toggle Combination Flow

- [ ] Monthly + Expense shows monthly expense data
- [ ] Monthly + Income shows monthly income data
- [ ] Yearly + Expense shows yearly expense data
- [ ] Yearly + Income shows yearly income data

### State Preservation Flow

- [ ] Switch Monthly to Yearly: transaction type (Expense/Income) preserved
- [ ] Switch Yearly to Monthly: transaction type (Expense/Income) preserved
- [ ] Switch Expense to Income: time mode (Monthly/Yearly) preserved
- [ ] Switch Income to Expense: time mode (Monthly/Yearly) preserved

### Complete User Flow

- [ ] Load page (default: current month, expenses)
- [ ] Navigate to previous month
- [ ] Select a tag from the list
- [ ] View transactions for that tag
- [ ] Click on a transaction to edit
- [ ] Save edit and verify data updates
- [ ] Switch to Yearly mode
- [ ] Verify monthly totals display for selected tag
- [ ] Switch to Income type
- [ ] Verify income data displays correctly

### Edit Transaction Flow

- [ ] Click transaction in list
- [ ] Edit modal opens with correct data
- [ ] Modify transaction fields
- [ ] Save changes
- [ ] Modal closes
- [ ] Pie chart updates
- [ ] Tag list updates
- [ ] Transaction list updates

### Delete Transaction Flow

- [ ] Click delete on transaction
- [ ] Confirmation dialog appears
- [ ] Confirm delete
- [ ] Modal/dialog closes
- [ ] Transaction removed from list
- [ ] Pie chart updates
- [ ] Tag totals update
- [ ] Cancel delete keeps transaction

---

## 6. Edge Cases

### Zero Transactions

- [ ] Empty pie chart with "No Data" message
- [ ] Empty tag list with appropriate message
- [ ] Right panel shows "No Activity" message

### Single Transaction

- [ ] Pie chart shows single 100% segment
- [ ] Tag list shows single tag at 100%
- [ ] Transaction appears in right panel

### All Transactions Untagged

- [ ] Pie chart shows single "Untagged" segment at 100%
- [ ] Tag list shows only "Untagged" entry
- [ ] "Untagged" uses neutral color

### Only One Tag with Transactions

- [ ] Pie chart shows 100% for that tag
- [ ] Tag list shows single entry
- [ ] Percentage displays as 100%

### Very Small Percentages (< 1%)

- [ ] Tags with < 1% show "< 1%" not "0%"
- [ ] Small segments still visible in pie chart
- [ ] Hover tooltip shows actual percentage

### Large Number of Tags

- [ ] Tag list is scrollable
- [ ] All tags accessible via scrolling
- [ ] Pie chart handles many colors distinctly
- [ ] Performance remains acceptable

### Editing Transaction Changes Tag

- [ ] Transaction moves to new tag's list
- [ ] Old tag total decreases
- [ ] New tag total increases
- [ ] If tag becomes empty, it disappears from list

### Deleting Last Transaction for Tag

- [ ] Tag disappears from tag list
- [ ] Tag segment removed from pie chart
- [ ] Percentages recalculate for remaining tags
- [ ] If deleted tag was selected, selection clears

### Transaction at Month Boundary

- [ ] Transaction on first day of month appears in correct month
- [ ] Transaction on last day of month appears in correct month

### Year Boundary in Yearly View

- [ ] December transactions count toward correct year
- [ ] January transactions count toward correct year

---

## 7. Currency Handling

### Format Usage

- [ ] Tag list amounts use formatCompact() for display
- [ ] Total amount uses formatCurrency() for full format
- [ ] Transaction amounts in list use formatCompact()
- [ ] Monthly totals (yearly view) use formatCurrency()

### VND Formatting

- [ ] Amounts display with correct VND format
- [ ] Thousands separator used correctly
- [ ] Currency symbol/suffix displays correctly
- [ ] Negative amounts display with minus sign

### Compact Format

- [ ] Small amounts show as "500d"
- [ ] Thousands show as "150K"
- [ ] Millions show as "25M"
- [ ] Billions show as "1.5B"

---

## 8. Transaction Operations

### Edit Modal

- [ ] Modal opens centered on screen
- [ ] All transaction fields editable (title, amount, date, tag, type)
- [ ] Current values pre-populated
- [ ] Cancel button closes modal without saving
- [ ] Save button disabled if no changes
- [ ] Save button enabled when changes made
- [ ] Validation errors display for invalid input

### Edit Save

- [ ] Changes persist after save
- [ ] Success notification/feedback shown
- [ ] View refreshes with updated data
- [ ] Modal closes after successful save

### Delete Confirmation

- [ ] Confirmation dialog appears before delete
- [ ] Dialog shows transaction details
- [ ] Cancel button returns without deleting
- [ ] Confirm button proceeds with delete

### Delete Execution

- [ ] Transaction removed from database
- [ ] Transaction removed from list immediately
- [ ] Totals recalculate correctly
- [ ] Pie chart updates without page refresh

---

## 9. Cross-Feature Integration

### Calendar Page Consistency

- [ ] Transaction amounts match calendar page
- [ ] Transaction dates match calendar page
- [ ] Edit modal behaves same as calendar page
- [ ] Delete confirmation same as calendar page

### Tag Manager Consistency

- [ ] Tag names match tag manager
- [ ] Tag emojis match tag manager
- [ ] Tag colors consistent with system
- [ ] New tags (created elsewhere) appear in reports

### Data Synchronization

- [ ] Changes in reports reflect in calendar
- [ ] Changes in calendar reflect in reports
- [ ] No stale data between pages

---

## 10. Performance

### Page Load

- [ ] Initial page load under 2 seconds
- [ ] Time to interactive under 3 seconds
- [ ] No layout shift after load

### Interactions

- [ ] Toggle switches respond under 100ms
- [ ] Period navigation responds under 200ms
- [ ] Tag selection responds under 100ms
- [ ] Pie chart animations smooth (60fps)

### Large Datasets

- [ ] 100+ transactions per month loads acceptably
- [ ] 50+ tags renders without lag
- [ ] Scrolling tag list is smooth
- [ ] No memory leaks on navigation

### Caching

- [ ] Returning to same period uses cached data
- [ ] Cache invalidation works correctly
- [ ] No unnecessary API calls

---

## Test Sign-off

| Category | Tested By | Date | Pass/Fail |
|----------|-----------|------|-----------|
| Functional Requirements | | | |
| Data Accuracy | | | |
| State Management | | | |
| API Integration | | | |
| User Flows | | | |
| Edge Cases | | | |
| Currency Handling | | | |
| Transaction Operations | | | |
| Cross-Feature Integration | | | |
| Performance | | | |

---

**Notes:**
- All tests should be performed on the latest build
- Test on multiple browsers (Chrome, Firefox, Safari)
- Test on mobile viewport sizes for responsive behavior
- Document any bugs found with steps to reproduce
