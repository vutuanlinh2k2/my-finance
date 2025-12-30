# Subscriptions Page UI/UX Testing Checklist

## General Page Layout

### Desktop (1440px)

- [ ] Page title "Subscriptions" is left-aligned in header
- [ ] "Add Subscription" button is right-aligned in header
- [ ] Summary cards are displayed in a horizontal row (3 cards)
- [ ] Subscriptions table spans full content width
- [ ] Consistent spacing between header, summary cards, and table
- [ ] No horizontal scrolling occurs

### Tablet (768px)

- [ ] Summary cards stack appropriately (2+1 or 3 in column)
- [ ] Table remains readable or converts to card layout
- [ ] Touch targets are at least 44x44px
- [ ] Header elements remain properly aligned

### Mobile (375px)

- [ ] Summary cards stack vertically (1 column)
- [ ] Table converts to mobile-friendly format (cards or horizontal scroll)
- [ ] "Add Subscription" button is accessible and properly sized
- [ ] No content overflow or horizontal scrolling
- [ ] Adequate spacing for touch interaction

## Header Section

### Visual Design

- [ ] "Subscriptions" title uses correct heading typography (font-size, font-weight)
- [ ] "Add Subscription" button follows shadcn/ui Button component styling
- [ ] Button includes appropriate icon (if designed with one)
- [ ] Proper vertical alignment between title and button
- [ ] Consistent padding/margins with other page headers in app

### Interactive States

- [ ] Button hover state shows visual feedback
- [ ] Button focus state has visible focus ring
- [ ] Button active/pressed state is distinguishable
- [ ] Button is keyboard accessible (Tab to focus, Enter/Space to activate)

## Summary Cards

### Visual Design

- [ ] All 3 cards have consistent dimensions and styling
- [ ] Card labels: "Average Monthly Cost", "Total Monthly Cost", "Total Yearly Cost"
- [ ] Currency values use `formatCompact()` display format
- [ ] Cards follow shadcn/ui Card component patterns
- [ ] Consistent spacing between cards (gap utility)
- [ ] Card shadows/borders match design system

### Currency Display

- [ ] VND amounts display correctly (e.g., "500d", "150K", "25M")
- [ ] USD amounts are converted to VND in summary calculations
- [ ] Hover tooltip shows full value via `formatCurrency()` (e.g., "25.000.000 d")
- [ ] Tooltip appears instantly (using `tooltip-fast` class)
- [ ] Large numbers format correctly (millions, billions)

### Accessibility

- [ ] Card content is screen reader accessible
- [ ] Tooltip content is accessible to assistive technologies
- [ ] Sufficient color contrast for text values (4.5:1 minimum)

## Subscriptions Table

### Table Structure

- [ ] Column headers: Title, Tag, Type, Price, Upcoming Due Date, Management Page, Actions
- [ ] Headers are properly aligned with content
- [ ] Table follows shadcn/ui Table component patterns
- [ ] Zebra striping or hover rows for readability (if designed)
- [ ] Proper column widths - no truncation of important content

### Title Column

- [ ] Text displays without truncation (or has tooltip for long titles)
- [ ] Consistent font styling

### Tag Column

- [ ] Emoji displays correctly before tag name
- [ ] Tag styling matches app's tag badge design
- [ ] Proper spacing between emoji and text

### Type Column

- [ ] "Monthly" and "Yearly" labels display correctly
- [ ] Consistent styling (badge or plain text as designed)

### Price Column

- [ ] VND amounts use `formatCompact()` format
- [ ] USD amounts display with "$" prefix as-is
- [ ] Hover tooltip shows full `formatCurrency()` value
- [ ] Currency indicator is clear (d vs $)

### Upcoming Due Date Column

- [ ] Dates format consistently (e.g., "Jan 15, 2025" or localized)
- [ ] Past due dates have visual indication (if designed)
- [ ] Near-term dates may have urgency styling (if designed)

### Management Page Column

- [ ] Link text or icon is clearly clickable
- [ ] Link opens in new tab (`target="_blank"`)
- [ ] Has `rel="noopener noreferrer"` for security
- [ ] Empty state if no URL provided (dash or "N/A")
- [ ] External link icon indicates new tab behavior

### Actions Column

- [ ] Edit button/icon is visible and recognizable
- [ ] Delete button/icon is visible and recognizable
- [ ] Actions are properly aligned (right-aligned or centered)
- [ ] Adequate spacing between Edit and Delete buttons
- [ ] Icons from @phosphor-icons/react

### Interactive States

- [ ] Row hover state provides visual feedback
- [ ] Edit button hover/focus states
- [ ] Delete button hover/focus states (potentially destructive color)
- [ ] Management link hover/focus states
- [ ] All interactive elements have visible focus rings

### Keyboard Navigation

- [ ] Tab navigates through interactive elements in logical order
- [ ] Management links are keyboard accessible
- [ ] Edit buttons are keyboard accessible
- [ ] Delete buttons are keyboard accessible
- [ ] Focus is visible on each element

### Accessibility

- [ ] Table uses semantic HTML (`<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>`)
- [ ] Column headers have proper scope attributes
- [ ] Action buttons have accessible labels (aria-label or visible text)
- [ ] Screen reader announces table structure correctly

## Empty State

### Visual Design

- [ ] Centered message displays when no subscriptions exist
- [ ] Message text is clear and helpful
- [ ] Illustration or icon (if designed)
- [ ] Call-to-action to add first subscription (if designed)
- [ ] Proper vertical centering in available space

### Accessibility

- [ ] Empty state message is screen reader accessible
- [ ] Any CTA is keyboard accessible

## Add Subscription Modal

### Modal Behavior

- [ ] Modal opens when "Add Subscription" button is clicked
- [ ] Modal has visible backdrop overlay
- [ ] Modal is centered on screen
- [ ] Click outside modal closes it (or doesn't, per design)
- [ ] Escape key closes modal
- [ ] Focus is trapped within modal while open
- [ ] Focus moves to first focusable element on open
- [ ] Focus returns to trigger button on close
- [ ] Smooth open/close animation

### Modal Header

- [ ] Title "Add Subscription" is clearly visible
- [ ] Close button (X) is present and functional
- [ ] Close button has hover/focus states

### Form Fields

#### Title Field

- [ ] Text input with proper label
- [ ] Placeholder text (if designed)
- [ ] Required field indication
- [ ] Validation error message for empty field
- [ ] Focus state with visible ring

#### Tag Dropdown

- [ ] Dropdown shows expense tags only (not income tags)
- [ ] Each option displays emoji + tag name
- [ ] Dropdown follows shadcn/ui Select component patterns
- [ ] Searchable/filterable (if designed)
- [ ] Keyboard navigable (Arrow keys, Enter to select)
- [ ] Optional field (no required indicator)

#### Currency Field

- [ ] Radio buttons or dropdown for VND/USD
- [ ] Default selection (VND)
- [ ] Clear visual distinction of selected option
- [ ] Keyboard accessible

#### Amount Field

- [ ] Number input with proper label
- [ ] Appropriate input type (number)
- [ ] Currency prefix/suffix indication
- [ ] Required field indication
- [ ] Validation for non-numeric input
- [ ] Validation for negative numbers (if not allowed)
- [ ] Validation for zero (if not allowed)
- [ ] Minimum/maximum value constraints

#### Type Field

- [ ] Radio buttons or dropdown for Monthly/Yearly
- [ ] Default selection (Monthly)
- [ ] Clear visual distinction of selected option
- [ ] Keyboard accessible

#### Day of Month Field

- [ ] Number input or dropdown (1-31)
- [ ] Required field indication
- [ ] Validation for out-of-range values
- [ ] Clear label explaining purpose

#### Month Field (Conditional)

- [ ] Only visible when Type is "Yearly"
- [ ] Smooth show/hide animation
- [ ] Dropdown with months 1-12 (or January-December)
- [ ] Required when visible
- [ ] Validation error when Yearly selected but no month chosen

#### Management URL Field

- [ ] Text input with proper label
- [ ] Optional field indication (or no asterisk)
- [ ] URL validation (if implemented)
- [ ] Placeholder showing expected format (e.g., "https://...")

### Form Validation

- [ ] Real-time validation feedback (or on blur)
- [ ] Error messages are clear and specific
- [ ] Error messages use appropriate color (destructive/red)
- [ ] Error messages are associated with fields (aria-describedby)
- [ ] Form cannot be submitted with validation errors
- [ ] Submit button disabled state when form invalid (if designed)

### Form Actions

- [ ] Cancel button present and functional
- [ ] Submit button with clear label ("Add Subscription" or "Save")
- [ ] Button hover/focus states
- [ ] Loading state on submit (spinner, disabled)
- [ ] Success feedback (modal closes, toast notification)
- [ ] Error feedback if submission fails

### Accessibility

- [ ] All form fields have associated labels
- [ ] Required fields indicated to screen readers
- [ ] Error messages announced by screen readers
- [ ] Modal announced as dialog to screen readers
- [ ] Focus management follows ARIA dialog patterns

## Edit Subscription Modal

### Pre-population

- [ ] Title field pre-filled with existing value
- [ ] Tag dropdown pre-selected with existing tag
- [ ] Currency pre-selected (VND or USD)
- [ ] Amount field pre-filled with existing value
- [ ] Type pre-selected (Monthly or Yearly)
- [ ] Day of Month pre-filled with existing value
- [ ] Month pre-selected if Type is Yearly
- [ ] Management URL pre-filled (if exists)

### Modal Behavior

- [ ] Modal title shows "Edit Subscription"
- [ ] All modal behaviors from Add modal apply
- [ ] Changes are saveable
- [ ] Cancel discards changes

### Form Validation

- [ ] Same validation rules as Add modal
- [ ] Existing valid data passes validation

## Delete Confirmation

### Confirmation Dialog

- [ ] Confirmation dialog appears before deletion
- [ ] Clear warning message about destructive action
- [ ] Subscription title mentioned in confirmation
- [ ] Cancel button to abort deletion
- [ ] Confirm/Delete button with destructive styling
- [ ] Confirm button requires explicit click (no auto-submit)

### Interactive States

- [ ] Delete button has destructive hover state
- [ ] Focus states on both buttons
- [ ] Loading state during deletion
- [ ] Success feedback after deletion (toast, table update)
- [ ] Error handling if deletion fails

### Accessibility

- [ ] Dialog announced to screen readers
- [ ] Focus trapped in dialog
- [ ] Keyboard accessible (Tab, Enter, Escape)

## Loading States

### Initial Page Load

- [ ] Skeleton loaders for summary cards
- [ ] Skeleton loaders or spinner for table
- [ ] Loading state is visually consistent with design system

### Form Submission

- [ ] Button shows loading spinner during API call
- [ ] Button is disabled during submission
- [ ] Form fields are disabled during submission

### Table Operations

- [ ] Optimistic UI update or loading indicator for delete
- [ ] Loading indicator for edit save

## Error States

### API Error Handling

- [ ] Error message displayed if subscription fetch fails
- [ ] Retry mechanism available
- [ ] Error message is user-friendly (not technical)

### Form Errors

- [ ] Network error handling for form submission
- [ ] Error toast/message for failed save
- [ ] Form remains populated after error (no data loss)

## Dark Mode

### Color Consistency

- [ ] Summary cards adapt to dark mode
- [ ] Table adapts to dark mode (backgrounds, borders)
- [ ] Modal adapts to dark mode
- [ ] Form fields adapt to dark mode
- [ ] All text remains readable in dark mode
- [ ] Focus rings visible in dark mode
- [ ] Destructive colors (delete) visible in dark mode

### Contrast

- [ ] All text meets 4.5:1 contrast ratio in dark mode
- [ ] Interactive element states distinguishable
- [ ] Icons remain visible

## Typography

### Hierarchy

- [ ] Page title uses appropriate heading level (h1 or h2)
- [ ] Card labels use consistent font styling
- [ ] Card values use prominent font styling
- [ ] Table headers use appropriate font weight
- [ ] Table content uses readable font size
- [ ] Modal title uses appropriate heading level

### Consistency

- [ ] Font family matches design system
- [ ] Font sizes follow design tokens
- [ ] Line heights are appropriate for readability

## Spacing and Alignment

### Consistency

- [ ] Margins and padding use design system spacing scale
- [ ] No magic numbers in spacing (use Tailwind utilities)
- [ ] Consistent gap between repeated elements
- [ ] Proper alignment of form labels and inputs
- [ ] Table cell padding is consistent

### Visual Balance

- [ ] Page has appropriate whitespace
- [ ] Content doesn't feel cramped
- [ ] Modal has balanced internal spacing

## Animations and Transitions

### Micro-interactions

- [ ] Button hover transitions are smooth
- [ ] Focus transitions are smooth
- [ ] Dropdown open/close animations
- [ ] Modal open/close animations
- [ ] Conditional field (Month) show/hide animation

### Performance

- [ ] Animations don't cause layout shift
- [ ] Animations respect reduced motion preferences
- [ ] No janky or stuttering animations

## Browser Console

- [ ] No JavaScript errors in console
- [ ] No React warnings
- [ ] No accessibility warnings
- [ ] No network errors (for valid operations)

## Cross-browser Testing

- [ ] Chrome rendering correct
- [ ] Firefox rendering correct
- [ ] Safari rendering correct (if applicable)
- [ ] Edge rendering correct

## Data Edge Cases

### Content Overflow

- [ ] Very long subscription titles handled (truncate with tooltip)
- [ ] Very long tag names handled
- [ ] Very long URLs handled in Management column
- [ ] Very large currency amounts display correctly

### Boundary Values

- [ ] Day 31 works correctly
- [ ] Month 12 works correctly
- [ ] Zero amount handling (if allowed)
- [ ] Maximum amount handling

### Table Stress

- [ ] Table performs well with 50+ subscriptions
- [ ] Pagination or virtual scrolling (if implemented)
- [ ] Sort functionality works (if implemented)
- [ ] Filter functionality works (if implemented)
