# Reports Feature - UI/UX Testing Checklist

This checklist covers all UI/UX testing requirements for the Reports page feature. Each item should be manually verified during design review using Playwright MCP.

## 1. Visual Consistency

### Design System Adherence (shadcn/ui)
- [ ] All buttons use shadcn/ui Button component with appropriate variants
- [ ] Toggle controls use shadcn/ui Tabs or toggle-group pattern
- [ ] Cards and panels use shadcn/ui Card component styling
- [ ] Scrollable areas use consistent scrollbar styling
- [ ] Modal dialogs (edit transaction) use shadcn/ui Dialog component
- [ ] All interactive elements have consistent border-radius values

### Spacing & Typography
- [ ] Page title "Reports" uses correct heading typography (text-2xl or larger)
- [ ] Subtitle "Detailed breakdown of your finances" uses muted text color
- [ ] Consistent spacing between header and content sections
- [ ] Tag list items have uniform padding and margins
- [ ] Transaction list items maintain consistent vertical rhythm
- [ ] Percentage values have proper alignment in tag list
- [ ] Amount values are right-aligned where appropriate

### Colors (OKLCH Color System)
- [ ] Toggle active states use correct accent colors from styles.css
- [ ] Expense toggle uses appropriate highlight color (yellow as specified)
- [ ] Income amounts use success color (emerald/green)
- [ ] Expense amounts use expense color (red)
- [ ] Pie chart segments use distinct, harmonious colors
- [ ] "Untagged" category uses neutral gray color
- [ ] Background colors follow light/dark theme variables

### Icon Usage (@phosphor-icons/react)
- [ ] Navigation arrows use Phosphor icons (CaretLeft, CaretRight)
- [ ] Tag list uses tag emoji correctly displayed
- [ ] Transaction list items show tag emoji as icon
- [ ] Empty state icons use Phosphor icons if applicable
- [ ] Edit/delete actions use appropriate Phosphor icons

## 2. Responsive Design

### Mobile (< 640px)
- [ ] Panels stack vertically (pie chart on top, details below)
- [ ] Toggle controls wrap or resize appropriately
- [ ] Pie chart scales to fit mobile width
- [ ] Tag list takes full width
- [ ] Transaction list takes full width
- [ ] Touch targets are at least 44x44px
- [ ] No horizontal scrolling occurs
- [ ] Period navigation is easily tappable

### Tablet (640px - 1024px)
- [ ] Two-panel layout begins to show side-by-side
- [ ] Pie chart maintains readable size
- [ ] Tag list scrollable if needed
- [ ] Spacing adjusts for medium screens
- [ ] Toggle controls fit without wrapping

### Desktop (> 1024px)
- [ ] Side-by-side layout with left panel (chart + tags) and right panel (details)
- [ ] Left panel takes approximately half the screen
- [ ] Right panel takes approximately half the screen
- [ ] Comfortable spacing between panels
- [ ] Tag list has adequate height before scrolling
- [ ] Transaction list has adequate height before scrolling

## 3. Interactive States

### Toggle Buttons (Monthly/Yearly)
- [ ] Default state shows "Monthly" as selected
- [ ] Hover state on unselected option shows visual feedback
- [ ] Active/selected state is clearly distinguishable
- [ ] Focus state has visible outline for keyboard users
- [ ] Click transition is smooth
- [ ] State persists during data loading

### Toggle Buttons (Expense/Income)
- [ ] Default state shows "Expense" as selected
- [ ] Expense toggle uses yellow highlight when active (as specified)
- [ ] Income toggle uses appropriate color when active
- [ ] Hover state on unselected option shows visual feedback
- [ ] Transition between states is smooth

### Tag List Item States
- [ ] Default state: neutral background, readable text
- [ ] Hover state: subtle background change, cursor pointer
- [ ] Selected state: visible highlight (border or background color change)
- [ ] Focus state: visible outline for keyboard navigation
- [ ] Color indicator matches pie chart segment color
- [ ] Percentage and amount remain visible in all states

### Transaction List Item Hover
- [ ] Hover shows clickable indication (cursor, background change)
- [ ] Hover reveals edit/delete actions if applicable
- [ ] Transition is smooth and not jarring
- [ ] Click opens edit modal correctly

### Navigation Arrow States
- [ ] Enabled state: visible, clickable cursor
- [ ] Hover state: color/opacity change
- [ ] Disabled state: reduced opacity, not-allowed cursor
- [ ] Left arrow disabled at earliest data boundary
- [ ] Right arrow disabled at latest data boundary (current month/year)
- [ ] Click triggers navigation without delay

## 4. Loading States

### Initial Page Load
- [ ] Skeleton loader shows while data fetches
- [ ] Pie chart area shows loading placeholder
- [ ] Tag list shows skeleton rows
- [ ] Right panel shows loading state
- [ ] Loading state is visually consistent with rest of app

### Period Navigation Loading
- [ ] Brief loading indicator when navigating months/years
- [ ] Previous data clears or fades during transition
- [ ] New data appears smoothly
- [ ] Selected tag resets or persists appropriately

### Data Refresh Loading
- [ ] After transaction edit/delete, data refreshes
- [ ] Loading indicator appears during refresh
- [ ] UI remains responsive during refresh
- [ ] Pie chart updates smoothly

## 5. Empty States

### No Data in Pie Chart
- [ ] "No Data" placeholder shown in pie chart area
- [ ] Placeholder is centered and visually clear
- [ ] Helpful message explains the empty state
- [ ] Period navigation still works to find data

### No Tags to Display
- [ ] "No tags to display" message shown in tag list area
- [ ] Message is styled consistently with other empty states
- [ ] Untagged category still shows if untagged transactions exist

### No Tag Selected (Right Panel)
- [ ] "No Tag Selected" header displayed
- [ ] Subtext: "Select a category tag from the list on the left..."
- [ ] Visual treatment is distinct but not alarming
- [ ] Empty state icon if applicable (from Phosphor)

### No Activity for Period
- [ ] "No Activity" message in right panel
- [ ] Subtext: "No financial activity for this period"
- [ ] Shown when selected tag has no transactions
- [ ] Styled consistently with other empty states

### No Transactions for Selected Tag
- [ ] "No transactions" message in transaction list
- [ ] Clear indication that the tag exists but has no data
- [ ] Suggestion to navigate to different period if applicable

## 6. Error States

### API Error Handling
- [ ] Error message displayed if data fetch fails
- [ ] Retry button available
- [ ] Error message is user-friendly, not technical
- [ ] Error state does not break layout

### Network Failure Display
- [ ] Graceful degradation if network unavailable
- [ ] Cached data shown if available
- [ ] Clear indication of connectivity issue
- [ ] Retry option available

## 7. Accessibility (WCAG 2.1 AA)

### ARIA Labels for Chart Segments
- [ ] Each pie chart segment has aria-label with tag name and percentage
- [ ] Chart has overall accessible name
- [ ] Screen readers can navigate chart data
- [ ] Alternative data representation available (tag list)

### Keyboard Navigation
- [ ] Tab key navigates through all interactive elements
- [ ] Tab order is logical (header toggles -> chart -> tag list -> details)
- [ ] Arrow keys navigate within toggle groups
- [ ] Enter/Space activates focused element
- [ ] Escape closes modals

### Screen Reader Support
- [ ] Percentages read correctly (e.g., "forty percent")
- [ ] Currency amounts read with currency name
- [ ] Tag names and amounts announced together
- [ ] State changes announced (loading, selection)

### Focus Management
- [ ] Focus visible on all interactive elements
- [ ] Focus returns to trigger after modal close
- [ ] Focus trapped within open modals
- [ ] No focus loss during data updates
- [ ] Skip link available for repetitive content

### Color Contrast
- [ ] Text meets 4.5:1 contrast ratio minimum
- [ ] Interactive elements meet 3:1 contrast ratio
- [ ] Pie chart segments distinguishable without color alone
- [ ] Selected states visible to color-blind users

## 8. Animations & Transitions

### Pie Chart Segment Animations
- [ ] Chart renders with smooth entry animation
- [ ] Segments animate when data changes
- [ ] Animation duration is appropriate (200-300ms)
- [ ] Reduced motion preference respected

### Panel Content Transitions
- [ ] Content fades or slides when switching tabs
- [ ] Transaction list updates smoothly when tag changes
- [ ] No jarring layout shifts during transitions
- [ ] Loading states transition smoothly to content

### Toggle Switch Animations
- [ ] Toggle indicator slides smoothly
- [ ] Background color transitions smoothly
- [ ] Animation completes before data fetch visual

## 9. Dark Mode

### Chart Colors in Dark Mode
- [ ] Pie chart colors visible and distinct in dark mode
- [ ] Chart background adapts to dark theme
- [ ] Segment borders visible if applicable
- [ ] Hover/tooltip styling adapts to dark mode

### Panel Backgrounds
- [ ] Left panel uses appropriate dark background
- [ ] Right panel uses appropriate dark background
- [ ] Divider between panels visible in dark mode
- [ ] Card backgrounds use dark theme variables

### Tag List Contrast
- [ ] Tag names readable in dark mode
- [ ] Color indicators visible against dark background
- [ ] Percentages and amounts have sufficient contrast
- [ ] Selected state visible in dark mode

### Text and Icons
- [ ] All text uses appropriate light colors for dark mode
- [ ] Icons visible and not washed out
- [ ] Placeholder text has sufficient contrast

## 10. Chart-Specific Items

### Pie Chart Rendering
- [ ] Chart renders without visual artifacts
- [ ] Segments are properly sized based on data
- [ ] Very small segments (< 1%) still visible
- [ ] Chart handles single-segment case (100%)

### Donut Center
- [ ] Center shows current period label
- [ ] Monthly: "Oct 23" format
- [ ] Yearly: "2023" format
- [ ] Label updates when period changes
- [ ] Text is centered and readable

### Segment Tooltips
- [ ] Hover shows tooltip with tag name
- [ ] Tooltip shows amount (formatted with formatCurrency)
- [ ] Tooltip shows percentage
- [ ] Tooltip positioned without clipping
- [ ] Tooltip disappears on mouse leave

### Segment Click to Select
- [ ] Clicking segment selects corresponding tag
- [ ] Tag list scrolls to show selected tag if needed
- [ ] Right panel updates with tag details
- [ ] Visual feedback on segment click

### Color Consistency
- [ ] Same tag always has same color
- [ ] Colors persist across sessions
- [ ] Adjacent segments have distinct colors
- [ ] "Untagged" always uses neutral gray

### Legend/Tag List Color Match
- [ ] Color indicator in tag list matches chart segment
- [ ] Colors remain synchronized during updates
- [ ] Hover on tag highlights corresponding segment (if implemented)

## 11. Panel Layout Items

### Two-Panel Layout Balance
- [ ] Left and right panels visually balanced
- [ ] No excessive whitespace in either panel
- [ ] Panels resize proportionally on window resize
- [ ] Minimum widths respected to prevent content cramping

### Right Panel Header
- [ ] "TRANSACTION LISTING" header in monthly mode
- [ ] "MONTHLY TOTALS" header in yearly mode
- [ ] Header styled consistently (caps, spacing)
- [ ] Header changes when mode toggles

### Transaction/Monthly List Scrollable
- [ ] List scrolls when content exceeds height
- [ ] Scroll indicator visible when scrollable
- [ ] Scrollbar styled consistently with app
- [ ] Smooth scroll behavior

### Item Spacing
- [ ] Consistent vertical spacing between list items
- [ ] Adequate padding within each item
- [ ] Dividers between items if applicable
- [ ] Last item has appropriate bottom spacing

## 12. Navigation Items

### Period Selector Styling
- [ ] Current period prominently displayed
- [ ] "Oct 2023" format for monthly
- [ ] "2023" format for yearly
- [ ] Clickable area is clearly defined

### Navigation Arrows Visibility
- [ ] Left arrow positioned before period text
- [ ] Right arrow positioned after period text
- [ ] Arrows appropriately sized (not too small)
- [ ] Arrows aligned vertically with period text

### Disabled State for Boundaries
- [ ] Cannot navigate before first data month/year
- [ ] Cannot navigate beyond current month/year
- [ ] Disabled arrows have visual indication (opacity, color)
- [ ] Disabled arrows do not respond to clicks
- [ ] Appropriate cursor on disabled arrows

## 13. Currency Formatting

- [ ] All amounts use `formatCompact()` for display
- [ ] Tooltips use `formatCurrency()` for full values
- [ ] `tooltip-fast` class applied for instant tooltip display
- [ ] Income amounts prefixed with "+"
- [ ] Expense amounts prefixed with "-"
- [ ] Total amounts formatted consistently

## 14. Data Integrity Display

- [ ] Percentages sum to 100% (or display rounding note)
- [ ] Tag totals match pie chart representation
- [ ] Transaction counts accurate in listing
- [ ] Monthly totals in yearly view sum to yearly total
- [ ] "Untagged" correctly aggregates null tag transactions

## 15. Interaction Feedback

- [ ] Button clicks provide immediate visual feedback
- [ ] Tag selection highlights immediately
- [ ] Period navigation shows immediate response
- [ ] Transaction click opens modal promptly
- [ ] Delete confirmation modal appears quickly
- [ ] Success feedback after transaction edit/delete

---

## Testing Notes

### Viewport Sizes to Test
- Mobile: 375px width
- Tablet: 768px width
- Desktop: 1440px width

### Browsers to Test
- Chrome (latest)
- Firefox (latest)
- Safari (latest)

### Test Data Scenarios
- [ ] Account with many transactions across multiple tags
- [ ] Account with single tag only
- [ ] Account with only untagged transactions
- [ ] Empty account (no transactions)
- [ ] Month/year with no data
- [ ] Tag with single transaction
- [ ] Tag with many transactions (scrolling test)

### Accessibility Testing Tools
- [ ] Run axe-core accessibility audit
- [ ] Test with VoiceOver (macOS)
- [ ] Test keyboard-only navigation
- [ ] Verify color contrast with contrast checker

---

**Checklist Version:** 1.0
**Feature:** Reports Page
**Last Updated:** 2026-01-01
