# Subscriptions Feature - QA/Logic Testing Checklist

This document provides a comprehensive QA checklist for testing the Subscriptions feature using Playwright E2E tests.

---

## 1. Page Layout and Navigation

### 1.1 Page Access
- [ ] User can navigate to the Subscriptions page from the app navigation
- [ ] Page loads successfully for authenticated users
- [ ] Unauthenticated users are redirected to login page
- [ ] Page URL is correct and bookmarkable
- [ ] Browser back/forward navigation works correctly

### 1.2 Header Section
- [ ] Page title "Subscriptions" is displayed correctly
- [ ] "Add Subscription" button is visible in the header (top-right)
- [ ] "Add Subscription" button has proper styling and is clickable
- [ ] Header layout is responsive on mobile/tablet/desktop

### 1.3 Summary Cards Display
- [ ] All three summary cards are displayed below the header
- [ ] Cards are properly aligned and spaced
- [ ] Cards display labels: "Average Monthly Cost", "Total Monthly Cost", "Total Yearly Cost"
- [ ] Cards show "0" or appropriate empty state when no subscriptions exist
- [ ] Cards use VND currency formatting (formatCurrency/formatCompact)
- [ ] Cards are responsive across different screen sizes

### 1.4 Table Section
- [ ] Subscriptions table is displayed below summary cards
- [ ] All required columns are present: Title, Tag, Type, Price, Upcoming Due Date, Management Page, Actions
- [ ] Table headers have proper styling
- [ ] Table is responsive (horizontal scroll on mobile if needed)
- [ ] Empty state message is shown when no subscriptions exist
- [ ] Empty state prompts user to add first subscription

---

## 2. Summary Card Calculations

### 2.1 Total Monthly Cost
- [ ] Correctly sums all subscriptions with type = "monthly"
- [ ] VND subscriptions are added directly
- [ ] USD subscriptions are converted to VND before summing
- [ ] Returns 0 when no monthly subscriptions exist
- [ ] Updates immediately after adding/editing/deleting a monthly subscription
- [ ] Handles large numbers correctly (overflow protection)

### 2.2 Total Yearly Cost
- [ ] Correctly sums all subscriptions with type = "yearly"
- [ ] VND subscriptions are added directly
- [ ] USD subscriptions are converted to VND before summing
- [ ] Returns 0 when no yearly subscriptions exist
- [ ] Updates immediately after adding/editing/deleting a yearly subscription
- [ ] Handles large numbers correctly

### 2.3 Average Monthly Cost
- [ ] Formula: Total Monthly Cost + (Total Yearly Cost / 12)
- [ ] Correctly calculates when only monthly subscriptions exist
- [ ] Correctly calculates when only yearly subscriptions exist
- [ ] Correctly calculates when both types exist
- [ ] Handles division correctly (no floating point errors visible)
- [ ] Returns 0 when no subscriptions exist

### 2.4 Currency Conversion
- [ ] Exchange rate is fetched from external API successfully
- [ ] USD to VND conversion is accurate
- [ ] Conversion is applied consistently across all cards
- [ ] Error handling when exchange rate API fails
- [ ] Fallback behavior when exchange rate is unavailable
- [ ] Exchange rate caching works correctly (no excessive API calls)

---

## 3. Subscriptions Table

### 3.1 Data Display
- [ ] Each subscription row displays all required data
- [ ] Title column shows subscription name correctly
- [ ] Tag column shows emoji + tag name (or empty if no tag)
- [ ] Type column shows "Monthly" or "Yearly"
- [ ] Price column shows amount with correct currency symbol (VND or USD)
- [ ] VND prices formatted as "150.000 d" or similar
- [ ] USD prices formatted as "$9.99" or similar
- [ ] Upcoming Due Date displays calculated next payment date
- [ ] Management Page column shows clickable link/icon if URL exists
- [ ] Management Page column shows nothing or disabled state if no URL
- [ ] Actions column shows Edit and Delete buttons

### 3.2 Upcoming Due Date Calculation - Monthly
- [ ] If today is before the specified day, shows current month's date
- [ ] If today is after the specified day, shows next month's date
- [ ] If today equals the specified day, shows today's date (or next month based on spec)
- [ ] Handles day 31 in months with fewer days (e.g., February)
- [ ] Handles day 30 in February correctly
- [ ] Handles day 29 in non-leap year February
- [ ] Handles year transition (December to January)

### 3.3 Upcoming Due Date Calculation - Yearly
- [ ] If the date hasn't occurred this year, shows this year's date
- [ ] If the date has passed this year, shows next year's date
- [ ] If today equals the specified date, shows today (or next year based on spec)
- [ ] Handles February 29 in non-leap years correctly
- [ ] Handles day overflow for months with fewer days

### 3.4 Management URL
- [ ] Link opens in new tab when clicked
- [ ] Link uses correct URL from subscription data
- [ ] Visual indicator distinguishes clickable vs non-clickable states
- [ ] Invalid URLs are handled gracefully (or validated on input)

### 3.5 Sorting and Filtering (if implemented)
- [ ] Table can be sorted by each column
- [ ] Sort direction toggles on repeated clicks
- [ ] Default sort order is logical (e.g., by due date or title)
- [ ] Filtering by type (Monthly/Yearly) works correctly
- [ ] Filtering by tag works correctly
- [ ] Clear filter option exists

---

## 4. Add Subscription Modal

### 4.1 Modal Opening
- [ ] Modal opens when "Add Subscription" button is clicked
- [ ] Modal has proper overlay/backdrop
- [ ] Modal is centered on screen
- [ ] Focus is trapped within modal
- [ ] Modal can be closed by clicking outside (or not, based on design)
- [ ] Modal can be closed by pressing Escape key
- [ ] Page scroll is locked when modal is open

### 4.2 Form Fields - Initial State
- [ ] All form fields are empty/default on open
- [ ] Title field has placeholder text
- [ ] Tag dropdown shows "None" or similar as default
- [ ] Currency selector defaults to VND
- [ ] Amount field is empty
- [ ] Type selector defaults to "Monthly"
- [ ] Day of Month selector shows default or placeholder
- [ ] Month selector is hidden when Type is "Monthly"
- [ ] Management URL field is empty with placeholder

### 4.3 Title Field Validation
- [ ] Title is required - shows error when empty on submit
- [ ] Title accepts alphanumeric characters
- [ ] Title accepts special characters
- [ ] Title accepts spaces
- [ ] Title trims leading/trailing whitespace
- [ ] Title has maximum length limit (if defined)
- [ ] Title minimum length validation (if defined)

### 4.4 Tag Dropdown
- [ ] Dropdown loads expense tags from database
- [ ] Only tags with type = 'expense' are shown
- [ ] Income tags are not displayed in dropdown
- [ ] Tags show emoji + name format
- [ ] "None" or empty option is available
- [ ] Tag selection is optional (form submits without tag)
- [ ] Selected tag displays correctly in dropdown

### 4.5 Currency Selector
- [ ] Currency is required
- [ ] Options include VND and USD only
- [ ] Default is VND
- [ ] Selection is mutually exclusive
- [ ] Visual indication of selected currency

### 4.6 Amount Field Validation
- [ ] Amount is required - shows error when empty
- [ ] Amount accepts positive numbers only
- [ ] Amount rejects 0 (based on transaction constraint amount > 0)
- [ ] Amount rejects negative numbers
- [ ] Amount accepts decimal values for USD
- [ ] Amount accepts whole numbers for VND
- [ ] Amount has reasonable maximum limit
- [ ] Amount field has number input type
- [ ] Amount shows appropriate placeholder

### 4.7 Type Selector
- [ ] Type is required
- [ ] Options are "Monthly" and "Yearly"
- [ ] Default is "Monthly"
- [ ] Selection is mutually exclusive

### 4.8 Day of Month Selector
- [ ] Day is required
- [ ] Options range from 1 to 31
- [ ] All 31 days are selectable
- [ ] Selection works correctly
- [ ] Default value or placeholder is shown

### 4.9 Month Selector (Conditional)
- [ ] Month selector is HIDDEN when Type = "Monthly"
- [ ] Month selector APPEARS when Type = "Yearly"
- [ ] Options range from 1 to 12 (or January-December)
- [ ] Month is required when Type = "Yearly"
- [ ] Month validation error shows when Type = "Yearly" and no month selected
- [ ] Month value is cleared when switching from Yearly to Monthly

### 4.10 Management URL Field
- [ ] URL field is optional
- [ ] URL accepts valid URLs (http/https)
- [ ] URL validation for format (if implemented)
- [ ] Invalid URL format shows error (if validated)
- [ ] Empty URL is acceptable
- [ ] URL has appropriate placeholder

### 4.11 Form Actions
- [ ] Cancel button closes modal without saving
- [ ] Cancel button discards all entered data
- [ ] Submit button is disabled when form is invalid (if implemented)
- [ ] Submit button shows loading state during submission
- [ ] Submit button text is appropriate ("Add Subscription", "Create", etc.)

---

## 5. Edit Subscription Modal

### 5.1 Modal Opening
- [ ] Modal opens when Edit action is clicked on a subscription row
- [ ] Correct subscription data is loaded
- [ ] All fields are pre-populated with existing values

### 5.2 Pre-populated Data
- [ ] Title shows existing subscription title
- [ ] Tag dropdown shows existing tag (or empty if none)
- [ ] Currency shows existing currency (VND or USD)
- [ ] Amount shows existing amount
- [ ] Type shows existing type (Monthly or Yearly)
- [ ] Day of Month shows existing day
- [ ] Month shows existing month (if yearly subscription)
- [ ] Month field is hidden (if monthly subscription)
- [ ] Management URL shows existing URL (or empty)

### 5.3 Edit Validation
- [ ] All validation rules from Add modal apply
- [ ] Changing Type from Monthly to Yearly shows Month selector
- [ ] Changing Type from Yearly to Monthly hides Month selector
- [ ] Saving with unchanged data works correctly
- [ ] Partial edits (changing only some fields) work correctly

### 5.4 Edit Actions
- [ ] Save/Update button saves changes
- [ ] Cancel button discards changes
- [ ] Modal closes after successful save
- [ ] Table updates to reflect changes immediately
- [ ] Summary cards update if amount/currency/type changed

---

## 6. Delete Subscription

### 6.1 Delete Action
- [ ] Delete button/icon is visible for each subscription
- [ ] Clicking Delete shows confirmation dialog
- [ ] Confirmation dialog explains consequences
- [ ] Confirmation mentions that expense items are preserved
- [ ] Cancel in confirmation returns to table without deleting
- [ ] Confirm actually deletes the subscription

### 6.2 Post-Delete Behavior
- [ ] Subscription is removed from table immediately
- [ ] Summary cards update to reflect deletion
- [ ] Empty state shows if last subscription was deleted
- [ ] Related expense transactions are NOT deleted (verify in DB)
- [ ] Success message/toast is shown

---

## 7. CRUD Operations - Database Integration

### 7.1 Create (Add Subscription)
- [ ] New subscription is saved to database
- [ ] All fields are saved correctly
- [ ] user_id is set to current authenticated user
- [ ] created_at timestamp is set automatically
- [ ] UUID is generated for id
- [ ] Subscription appears in table after creation
- [ ] Database constraints are enforced

### 7.2 Read (List Subscriptions)
- [ ] Only current user's subscriptions are displayed
- [ ] Other users' subscriptions are not visible (RLS)
- [ ] All subscription fields are retrieved correctly
- [ ] Tag relationship is resolved (join with tags table)
- [ ] Data loads on page mount
- [ ] Loading state is shown while fetching

### 7.3 Update (Edit Subscription)
- [ ] Changes are persisted to database
- [ ] Only specified fields are updated
- [ ] Other users cannot update (RLS)
- [ ] Optimistic updates work correctly (if implemented)
- [ ] Concurrent edit handling (if relevant)

### 7.4 Delete
- [ ] Subscription is removed from database
- [ ] Cascading deletes do NOT affect expense transactions
- [ ] Only owner can delete (RLS)
- [ ] Hard delete (not soft delete)

---

## 8. API and Error Handling

### 8.1 API Success Scenarios
- [ ] Successful API calls show appropriate feedback
- [ ] Data refreshes after successful operations
- [ ] No duplicate submissions on slow networks

### 8.2 API Error Scenarios
- [ ] Network error shows user-friendly message
- [ ] Server error (500) shows appropriate message
- [ ] Validation error (400) shows field-specific errors
- [ ] Authentication error (401) redirects to login
- [ ] Authorization error (403) shows access denied message
- [ ] Timeout error is handled gracefully
- [ ] Error messages can be dismissed

### 8.3 Loading States
- [ ] Page shows loading indicator while fetching subscriptions
- [ ] Modal shows loading state during save
- [ ] Delete shows loading state during operation
- [ ] Summary cards show loading while calculating

### 8.4 Exchange Rate API
- [ ] Exchange rate loads successfully
- [ ] Cached rate is used when appropriate
- [ ] API failure doesn't break the page
- [ ] Fallback rate or error message is shown on failure
- [ ] Rate refresh mechanism works (if implemented)

---

## 9. Edge Cases and Boundary Conditions

### 9.1 Empty States
- [ ] No subscriptions - shows empty state with CTA
- [ ] No expense tags exist - dropdown shows empty or disabled
- [ ] Exchange rate unavailable - cards show appropriate state

### 9.2 Large Data Sets
- [ ] Page performs well with 100+ subscriptions
- [ ] Pagination works correctly (if implemented)
- [ ] Infinite scroll works correctly (if implemented)
- [ ] Summary calculations remain accurate with many items

### 9.3 Extreme Values
- [ ] Very large amounts (billions) display correctly
- [ ] Very small amounts (decimals for USD) display correctly
- [ ] Very long subscription titles truncate or wrap
- [ ] Very long management URLs are handled

### 9.4 Date Edge Cases
- [ ] Day 31 subscription in February - correct next date
- [ ] Leap year handling for February 29
- [ ] Year boundary (December 31 to January 1)
- [ ] Subscription created on edge days (1st, 28th, 29th, 30th, 31st)

### 9.5 Concurrent Operations
- [ ] Creating subscription while another is being deleted
- [ ] Multiple browser tabs showing subscription page
- [ ] Rapid successive add/edit operations

### 9.6 Special Characters
- [ ] Title with emojis saves and displays correctly
- [ ] Title with HTML entities is escaped properly
- [ ] Title with SQL injection attempts is safe
- [ ] URL with special characters is handled

---

## 10. Authentication and Authorization

### 10.1 Authentication
- [ ] Page requires authentication
- [ ] Session expiry during use is handled
- [ ] Login redirect returns to subscription page after auth
- [ ] Auth token is included in all API requests

### 10.2 Authorization (RLS)
- [ ] User can only see own subscriptions
- [ ] User cannot access other users' subscriptions via URL manipulation
- [ ] User cannot edit other users' subscriptions via API
- [ ] User cannot delete other users' subscriptions via API
- [ ] Tag dropdown only shows user's own expense tags

---

## 11. Data Persistence and Integrity

### 11.1 Data Persistence
- [ ] Added subscription persists after page refresh
- [ ] Edited subscription persists after page refresh
- [ ] Deleted subscription stays deleted after refresh
- [ ] Data persists across browser sessions

### 11.2 Data Integrity
- [ ] Foreign key to tags table is valid
- [ ] Null tag_id is handled correctly
- [ ] Currency values are limited to VND/USD
- [ ] Type values are limited to monthly/yearly
- [ ] day_of_month is between 1-31
- [ ] month_of_year is between 1-12 (when applicable)
- [ ] month_of_year is null for monthly subscriptions

### 11.3 Referential Integrity
- [ ] Deleting a tag sets subscription's tag_id to null
- [ ] Deleting a subscription does not delete related expenses
- [ ] User deletion cascades subscription deletion (if applicable)

---

## 12. UI/UX Quality

### 12.1 Visual Consistency
- [ ] Colors match application theme
- [ ] Typography is consistent with app
- [ ] Spacing follows design system
- [ ] Icons are consistent style
- [ ] Dark mode support (if applicable)

### 12.2 Responsiveness
- [ ] Page renders correctly on mobile (320px width)
- [ ] Page renders correctly on tablet (768px width)
- [ ] Page renders correctly on desktop (1024px+ width)
- [ ] Modal is usable on mobile
- [ ] Table is scrollable on narrow screens

### 12.3 Accessibility
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Form labels are associated with inputs
- [ ] Error messages are announced to screen readers
- [ ] Color contrast meets WCAG AA standards
- [ ] ARIA labels are present where needed

### 12.4 User Feedback
- [ ] Form validation errors are clear and specific
- [ ] Success messages are shown after operations
- [ ] Loading states are visible
- [ ] Disabled states are visually distinct

---

## 13. Performance

### 13.1 Page Load
- [ ] Initial page load under 3 seconds
- [ ] Time to interactive is reasonable
- [ ] No unnecessary re-renders
- [ ] API calls are efficient (no N+1 queries)

### 13.2 Operation Performance
- [ ] Add subscription completes in under 2 seconds
- [ ] Edit subscription completes in under 2 seconds
- [ ] Delete subscription completes in under 2 seconds
- [ ] Summary card calculations are fast

### 13.3 Memory and Resources
- [ ] No memory leaks on repeated modal open/close
- [ ] No memory leaks on page navigation
- [ ] Exchange rate caching reduces API calls

---

## 14. Auto-Create Expense (Background Process)

Note: This is a background feature that may need separate testing approach.

### 14.1 Expense Creation
- [ ] Expense is created on subscription due date
- [ ] Expense title matches subscription title
- [ ] Expense amount is correct (converted to VND if USD)
- [ ] Expense date is the due date
- [ ] Expense type is 'expense'
- [ ] Expense tag_id matches subscription tag_id
- [ ] Expense is attributed to correct user

### 14.2 Currency Conversion for Auto-Expense
- [ ] USD subscriptions are converted to VND
- [ ] VND subscriptions use original amount
- [ ] Exchange rate at time of creation is used
- [ ] Conversion is accurate

### 14.3 last_payment_date Update
- [ ] last_payment_date is updated after expense creation
- [ ] Duplicate expenses are not created on same day
- [ ] Missed payments are handled appropriately

### 14.4 Edge Cases for Auto-Expense
- [ ] Subscription deleted before due date - no expense created
- [ ] Subscription edited on due date - correct data used
- [ ] Server downtime on due date - recovery mechanism

---

## 15. Integration Tests

### 15.1 End-to-End User Flows
- [ ] New user adds first subscription successfully
- [ ] User adds multiple subscriptions of different types
- [ ] User edits subscription and verifies changes
- [ ] User deletes subscription and verifies removal
- [ ] User adds subscription, navigates away, returns - data persists

### 15.2 Cross-Feature Integration
- [ ] Subscription with expense tag - tag displays correctly
- [ ] Tag deleted - subscription shows no tag
- [ ] Auto-created expense appears on calendar page
- [ ] Auto-created expense appears in transaction list

---

## 16. Browser Compatibility

### 16.1 Supported Browsers
- [ ] Chrome (latest) - all features work
- [ ] Firefox (latest) - all features work
- [ ] Safari (latest) - all features work
- [ ] Edge (latest) - all features work

### 16.2 Browser-Specific Issues
- [ ] Date picker works consistently across browsers
- [ ] Number input behavior is consistent
- [ ] Modal positioning is correct in all browsers
- [ ] CSS renders correctly in all browsers

---

## Test Data Requirements

### Sample Subscriptions for Testing
1. Monthly VND subscription (e.g., "Netflix", 150000 VND, day 15)
2. Monthly USD subscription (e.g., "Spotify", $9.99, day 1)
3. Yearly VND subscription (e.g., "Adobe", 3000000 VND, day 1, month 6)
4. Yearly USD subscription (e.g., "GitHub Pro", $48, day 15, month 3)
5. Subscription with tag (expense tag)
6. Subscription without tag
7. Subscription with management URL
8. Subscription without management URL
9. Subscription with day 31 (edge case)
10. Subscription with day 29, month 2 (leap year edge case)

### Required Setup
- [ ] Test user account created
- [ ] Expense tags exist for testing
- [ ] Exchange rate API is accessible
- [ ] Database is in clean state before each test run
