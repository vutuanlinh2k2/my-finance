# Dashboard UI/UX Testing Checklist

This checklist covers all UI/UX requirements for the Dashboard feature. Each item should be verified during implementation review and before marking the feature as complete.

---

## 1. Visual Consistency

### Design System Compliance (shadcn/ui)

- [ ] Cards use `rounded-lg border border-border bg-sidebar p-4` pattern (matches PortfolioSummaryCards and SubscriptionSummaryCards)
- [ ] Card headers use icon + label + optional info tooltip pattern
- [ ] Icon containers use `size-8 rounded-lg` with semantic background colors (emerald-100, rose-100, blue-100, etc.)
- [ ] All icons are from `@phosphor-icons/react` with `weight="duotone"` for primary icons
- [ ] Info icons use `weight="fill"` with `size-3.5 text-muted-foreground/50` class
- [ ] Labels use `text-xs font-medium uppercase tracking-wide text-muted-foreground`
- [ ] Values use `text-xl font-semibold` typography

### Spacing and Typography

- [ ] Page title uses `h1` with consistent heading style from existing pages
- [ ] Card grid uses `gap-4` between cards (matches crypto/subscriptions pages)
- [ ] Chart sections use `gap-4` or `gap-6` consistent with other layouts
- [ ] Inner card padding is `p-4`
- [ ] Section spacing between cards and charts is consistent (typically `mt-4` or `mt-6`)

### Color Usage (OKLCH Color Space)

- [ ] Net Worth card: Uses appropriate icon color (e.g., emerald or primary)
- [ ] Monthly Income: Uses `text-emerald-600` for positive amounts, `bg-emerald-100` for icon container
- [ ] Monthly Expense: Uses `text-rose-600` for expense amounts, `bg-rose-100` for icon container
- [ ] Pie chart segment for Bank: Uses emerald/green color from chart tokens
- [ ] Pie chart segment for Crypto: Uses blue color from chart tokens
- [ ] Line chart uses primary brand color (from `--chart-*` variables)
- [ ] All colors use CSS variables from `styles.css` (no hardcoded colors except chart segments)

### Icon Usage

- [ ] Icons are from `@phosphor-icons/react` library
- [ ] Net Worth card uses appropriate financial icon (e.g., `Wallet`, `Bank`, or `CurrencyCircleDollar`)
- [ ] Monthly Income uses income-related icon (e.g., `ArrowUp`, `TrendUp`)
- [ ] Monthly Expense uses expense-related icon (e.g., `ArrowDown`, `TrendDown`)
- [ ] Info tooltips use `Info` icon with `weight="fill"`
- [ ] Chart components use appropriate icons for empty states

---

## 2. Responsive Design

### Mobile Viewport (< 640px)

- [ ] Summary cards stack vertically (single column)
- [ ] Pie chart maintains readable size (min 200px width)
- [ ] Line chart adapts to full width with appropriate height
- [ ] Time range selector buttons remain tappable (min 44px touch target)
- [ ] No horizontal scrolling occurs
- [ ] Page title is left-aligned and appropriately sized
- [ ] Charts section stacks vertically (pie chart above line chart)

### Tablet Viewport (640px - 1024px)

- [ ] Cards display in 2-column or 3-column grid depending on width
- [ ] Charts may display side-by-side or stacked based on available width
- [ ] Pie chart and line chart have appropriate proportions
- [ ] Time range selector remains usable without overflow

### Desktop Viewport (> 1024px)

- [ ] Summary cards display in 3-column grid (`grid-cols-3`)
- [ ] Pie chart and line chart display side-by-side (`grid-cols-2` or flex layout)
- [ ] Charts maintain optimal aspect ratios
- [ ] Consistent spacing with other pages (crypto, reports)
- [ ] No excessive whitespace or cramped elements

---

## 3. Interactive States

### Hover States

- [ ] Cards have subtle hover effect if clickable, or maintain static appearance if informational only
- [ ] Pie chart segments highlight on hover (slight opacity change or scale)
- [ ] Line chart shows tooltip on data point hover
- [ ] Time range selector buttons show hover state (`hover:text-foreground` from muted)
- [ ] `tooltip-fast` elements show tooltip immediately on hover

### Focus States (Keyboard Navigation)

- [ ] Time range selector buttons have visible focus ring (`focus:ring-2 focus:ring-ring`)
- [ ] Tab order follows logical reading order (cards, then charts, then time selector)
- [ ] Focus indicators use `--ring` color from theme
- [ ] Focus states are visible in both light and dark modes

### Active/Pressed States

- [ ] Active time range button shows selected state (`bg-foreground text-background`)
- [ ] Non-selected time range buttons use muted style (`text-muted-foreground`)
- [ ] Transitions are smooth (`transition-colors` applied)

### Tooltip Behavior

- [ ] `formatCurrency()` values appear in tooltips on hover for compact values
- [ ] Pie chart tooltip shows segment name, amount (compact), and percentage
- [ ] Line chart tooltip shows date and exact value
- [ ] Tooltips use consistent styling from `tooltip-fast` class
- [ ] Tooltips position correctly (above element, centered)

---

## 4. Loading States

### Skeleton Screens for Cards

- [ ] Each card shows skeleton placeholder while loading
- [ ] Skeleton uses `h-7 w-24 animate-pulse rounded bg-muted` pattern (from existing cards)
- [ ] Card structure (icon, label) remains visible during loading
- [ ] Skeleton animation is subtle and not distracting

### Chart Loading Placeholders

- [ ] Pie chart shows loading skeleton (circular placeholder or centered spinner)
- [ ] Line chart shows loading skeleton (horizontal lines or chart outline)
- [ ] Loading state matches patterns from `ValueHistoryChart` and `AllocationHistoryChart`
- [ ] Charts don't jump or shift when data loads

### Progressive Loading

- [ ] Cards can load independently (don't wait for all data)
- [ ] Charts can show individual loading states
- [ ] Page remains usable while parts are loading
- [ ] No layout shift when transitioning from loading to loaded

---

## 5. Empty States

### Zero Values Display

- [ ] Net Worth shows "0" or formatted "0d" when no data exists
- [ ] Monthly Income shows "0" or "0d" when no income for current month
- [ ] Monthly Expense shows "0" or "0d" when no expenses for current month
- [ ] Values still display with `tooltip-fast` showing "0 d" in tooltip

### Pie Chart Empty State

- [ ] Shows empty ring visual (like `NoDataState` from reports)
- [ ] Displays "No Data" message in center
- [ ] Uses muted border color for empty ring
- [ ] Maintains chart dimensions to prevent layout shift

### Line Chart Empty State

- [ ] Displays appropriate empty state message ("No history available")
- [ ] Shows chart area with placeholder visual
- [ ] Uses icon + message pattern from reports empty states
- [ ] Time range selector remains functional

### Edge Cases

- [ ] Handles 100% bank balance (crypto = 0) gracefully in pie chart
- [ ] Handles 100% crypto (bank = 0) gracefully in pie chart
- [ ] Handles negative bank balance display appropriately
- [ ] Line chart handles single data point

---

## 6. Accessibility

### ARIA Labels and Roles

- [ ] Page has appropriate heading hierarchy (`h1` for page title)
- [ ] Cards use semantic HTML (no unnecessary divs)
- [ ] Charts have `role="img"` with `aria-label` describing the visualization
- [ ] Time range selector buttons have clear accessible names
- [ ] Tooltips are accessible via keyboard focus (not just hover)

### Keyboard Navigation

- [ ] All interactive elements are reachable via Tab key
- [ ] Time range buttons can be activated with Enter/Space
- [ ] Tab order is logical (left-to-right, top-to-bottom)
- [ ] No keyboard traps exist in chart interactions
- [ ] Skip links work if page has complex structure

### Screen Reader Compatibility

- [ ] Card values are announced with context (e.g., "Net Worth: 25.5M VND")
- [ ] Chart data is available in text form or via accessible data table
- [ ] Dynamic content changes are announced (loading states, value updates)
- [ ] Pie chart percentages are available to screen readers

### Color Contrast Ratios (WCAG 2.1 AA)

- [ ] Text on cards meets 4.5:1 contrast ratio
- [ ] Labels (muted-foreground) meet 4.5:1 against background
- [ ] Interactive elements have 3:1 contrast for focus indicators
- [ ] Pie chart segments are distinguishable beyond color (pattern or label)
- [ ] Income (emerald) and expense (rose) colors meet contrast requirements

---

## 7. Dashboard-Specific Items

### Summary Cards

- [ ] Net Worth card displays `formatCompact()` value with `tooltip-fast` showing `formatCurrency()`
- [ ] Monthly Income shows value with `+` prefix and emerald color
- [ ] Monthly Expense shows value with `-` prefix and rose color
- [ ] All cards use consistent icon + label + info tooltip pattern
- [ ] Cards match the visual style of `PortfolioSummaryCards` and `SubscriptionSummaryCards`

### Net Worth Pie Chart

- [ ] Shows two segments: Bank Account (emerald) and Crypto Investment (blue)
- [ ] Center label shows "Net Worth" text
- [ ] Hover tooltip displays segment name, `formatCompact()` amount, and percentage
- [ ] Percentages sum to 100%
- [ ] Segment stroke uses `var(--card)` for clean separation
- [ ] Uses `ResponsiveContainer` for proper sizing

### Net Worth History Line Chart

- [ ] Smooth line connects data points
- [ ] X-axis shows formatted dates (responsive to time range)
- [ ] Y-axis shows VND values with appropriate tick formatting
- [ ] Hover shows exact date and `formatCurrency()` value
- [ ] Area under line has subtle fill for visual appeal
- [ ] Responsive to container width

### Time Range Selector

- [ ] Displays 3 options: 1m, 1y, All
- [ ] Uses tab-style button group (matches `PortfolioHistoryChart` pattern)
- [ ] Selected state uses `bg-foreground text-background`
- [ ] Unselected uses `text-muted-foreground hover:text-foreground`
- [ ] Buttons are wrapped in `rounded-lg border border-border bg-card p-1` container
- [ ] Default selection is "1m"
- [ ] Switching ranges triggers chart data refetch with loading state

### Currency Formatting

- [ ] All monetary values use `formatCompact()` from `@/lib/currency`
- [ ] Tooltips show full value via `formatCurrency()`
- [ ] Compact format correctly shows: `500d`, `150K`, `25M`, `1.5B`
- [ ] Full format shows VND with proper thousands separators

---

## 8. Dark Mode

### Component Theme Support

- [ ] Cards background uses `bg-sidebar` (adapts to dark theme)
- [ ] Card borders use `border-border` (adapts to dark theme)
- [ ] All text colors use semantic tokens (foreground, muted-foreground)
- [ ] Icons use semantic colors that work in both modes

### Chart Colors in Dark Mode

- [ ] Pie chart segment colors remain visible and distinguishable
- [ ] Line chart uses appropriate stroke color for dark background
- [ ] Chart grid lines (if any) use `--border` color
- [ ] Tooltip backgrounds use `--popover` color
- [ ] Chart axis labels use `--muted-foreground`

### Tooltip Dark Mode

- [ ] `tooltip-fast` pseudo-element correctly switches colors in dark mode
- [ ] Chart custom tooltips use `bg-popover` and `text-popover-foreground`
- [ ] Borders use `border-border`

### Contrast in Dark Mode

- [ ] All text remains readable in dark mode
- [ ] Emerald/green and rose/red colors have sufficient contrast
- [ ] Blue segment in pie chart is visible against dark background
- [ ] Focus rings are visible in dark mode

---

## 9. Performance and Polish

### Animation Quality

- [ ] Skeleton loading uses smooth `animate-pulse`
- [ ] Chart transitions are smooth (no jarring movements)
- [ ] Pie chart segments animate on initial load (if using recharts default)
- [ ] Line chart draws smoothly
- [ ] Tab switching in time range selector feels responsive

### Visual Polish

- [ ] Consistent border radius (`rounded-lg`) across all elements
- [ ] No visual glitches or overflow issues
- [ ] Shadows and elevation match design system
- [ ] Typography is crisp and readable at all sizes
- [ ] Icons are properly aligned with text

### Cross-Browser Consistency

- [ ] Renders correctly in Chrome
- [ ] Renders correctly in Safari
- [ ] Renders correctly in Firefox
- [ ] No layout issues in Edge

---

## Testing Sign-off

| Viewport | Tested | Notes |
|----------|--------|-------|
| Desktop (1440px) | [ ] | |
| Tablet (768px) | [ ] | |
| Mobile (375px) | [ ] | |

| Theme | Tested | Notes |
|-------|--------|-------|
| Light Mode | [ ] | |
| Dark Mode | [ ] | |

**Reviewer:** _________________
**Date:** _________________
**Status:** [ ] Pass / [ ] Fail / [ ] Partial

---

## References

- Design patterns from: `src/components/crypto/portfolio-summary-cards.tsx`
- Pie chart pattern from: `src/components/reports/distribution-pie-chart.tsx`
- Time range selector pattern from: `src/components/crypto/portfolio-history-chart.tsx`
- Empty states pattern from: `src/components/reports/reports-empty-states.tsx`
- Currency formatting: `src/lib/currency.ts`
- CSS variables: `src/styles.css`
