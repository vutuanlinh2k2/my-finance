# Dashboard UI/UX Testing Checklist

This checklist covers all UI/UX requirements for the Dashboard feature. Each item should be verified during implementation review and before marking the feature as complete.

---

## 1. Visual Consistency

### Design System Compliance (shadcn/ui)

- [x] Cards use `rounded-lg border border-border bg-sidebar p-4` pattern (matches PortfolioSummaryCards and SubscriptionSummaryCards)
- [x] Card headers use icon + label + optional info tooltip pattern
- [x] Icon containers use `size-8 rounded-lg` with semantic background colors (emerald-100, rose-100, blue-100, etc.)
- [x] All icons are from `@phosphor-icons/react` with `weight="duotone"` for primary icons
- [x] Info icons use `weight="fill"` with `size-3.5 text-muted-foreground/50` class
- [x] Labels use `text-xs font-medium uppercase tracking-wide text-muted-foreground`
- [x] Values use `text-xl font-semibold` typography

### Spacing and Typography

- [x] Page title uses `h1` with consistent heading style from existing pages
- [x] Card grid uses `gap-4` between cards (matches crypto/subscriptions pages)
- [x] Chart sections use `gap-4` or `gap-6` consistent with other layouts
- [x] Inner card padding is `p-4`
- [x] Section spacing between cards and charts is consistent (typically `mt-4` or `mt-6`)

### Color Usage (OKLCH Color Space)

- [x] Net Worth card: Uses appropriate icon color (e.g., emerald or primary)
- [x] Monthly Income: Uses `text-emerald-600` for positive amounts, `bg-emerald-100` for icon container
- [x] Monthly Expense: Uses `text-rose-600` for expense amounts, `bg-rose-100` for icon container
- [x] Pie chart segment for Bank: Uses emerald/green color from chart tokens
- [x] Pie chart segment for Crypto: Uses blue color from chart tokens
- [x] Line chart uses primary brand color (from `--chart-*` variables)
- [x] All colors use CSS variables from `styles.css` (no hardcoded colors except chart segments)

### Icon Usage

- [x] Icons are from `@phosphor-icons/react` library
- [x] Net Worth card uses appropriate financial icon (e.g., `Wallet`, `Bank`, or `CurrencyCircleDollar`)
- [x] Monthly Income uses income-related icon (e.g., `ArrowUp`, `TrendUp`)
- [x] Monthly Expense uses expense-related icon (e.g., `ArrowDown`, `TrendDown`)
- [x] Info tooltips use `Info` icon with `weight="fill"`
- [x] Chart components use appropriate icons for empty states

---

## 2. Responsive Design

### Mobile Viewport (< 640px)

- [x] Summary cards stack vertically (single column)
- [x] Pie chart maintains readable size (min 200px width)
- [x] Line chart adapts to full width with appropriate height
- [x] Time range selector buttons remain tappable (min 44px touch target)
- [x] No horizontal scrolling occurs
- [x] Page title is left-aligned and appropriately sized
- [x] Charts section stacks vertically (pie chart above line chart)

### Tablet Viewport (640px - 1024px)

- [x] Cards display in 2-column or 3-column grid depending on width
- [x] Charts may display side-by-side or stacked based on available width
- [x] Pie chart and line chart have appropriate proportions
- [x] Time range selector remains usable without overflow

### Desktop Viewport (> 1024px)

- [x] Summary cards display in 3-column grid (`grid-cols-3`)
- [x] Pie chart and line chart display side-by-side (`grid-cols-2` or flex layout)
- [x] Charts maintain optimal aspect ratios
- [x] Consistent spacing with other pages (crypto, reports)
- [x] No excessive whitespace or cramped elements

---

## 3. Interactive States

### Hover States

- [x] Cards have subtle hover effect if clickable, or maintain static appearance if informational only
- [x] Pie chart segments highlight on hover (slight opacity change or scale)
- [x] Line chart shows tooltip on data point hover
- [x] Time range selector buttons show hover state (`hover:text-foreground` from muted)
- [x] `tooltip-fast` elements show tooltip immediately on hover

### Focus States (Keyboard Navigation)

- [x] Time range selector buttons have visible focus ring (`focus:ring-2 focus:ring-ring`)
- [x] Tab order follows logical reading order (cards, then charts, then time selector)
- [x] Focus indicators use `--ring` color from theme
- [x] Focus states are visible in both light and dark modes

### Active/Pressed States

- [x] Active time range button shows selected state (`bg-foreground text-background`)
- [x] Non-selected time range buttons use muted style (`text-muted-foreground`)
- [x] Transitions are smooth (`transition-colors` applied)

### Tooltip Behavior

- [x] `formatCurrency()` values appear in tooltips on hover for compact values
- [x] Pie chart tooltip shows segment name, amount (compact), and percentage
- [x] Line chart tooltip shows date and exact value
- [x] Tooltips use consistent styling from `tooltip-fast` class
- [x] Tooltips position correctly (above element, centered)

---

## 4. Loading States

### Skeleton Screens for Cards

- [x] Each card shows skeleton placeholder while loading
- [x] Skeleton uses `h-7 w-24 animate-pulse rounded bg-muted` pattern (from existing cards)
- [x] Card structure (icon, label) remains visible during loading
- [x] Skeleton animation is subtle and not distracting

### Chart Loading Placeholders

- [x] Pie chart shows loading skeleton (circular placeholder or centered spinner)
- [x] Line chart shows loading skeleton (horizontal lines or chart outline)
- [x] Loading state matches patterns from `ValueHistoryChart` and `AllocationHistoryChart`
- [x] Charts don't jump or shift when data loads

### Progressive Loading

- [x] Cards can load independently (don't wait for all data)
- [x] Charts can show individual loading states
- [x] Page remains usable while parts are loading
- [x] No layout shift when transitioning from loading to loaded

---

## 5. Empty States

### Zero Values Display

- [x] Net Worth shows "0" or formatted "0d" when no data exists
- [x] Monthly Income shows "0" or "0d" when no income for current month
- [x] Monthly Expense shows "0" or "0d" when no expenses for current month
- [x] Values still display with `tooltip-fast` showing "0 d" in tooltip

### Pie Chart Empty State

- [x] Shows empty ring visual (like `NoDataState` from reports)
- [x] Displays "No Data" message in center
- [x] Uses muted border color for empty ring
- [x] Maintains chart dimensions to prevent layout shift

### Line Chart Empty State

- [x] Displays appropriate empty state message ("No history available")
- [x] Shows chart area with placeholder visual
- [x] Uses icon + message pattern from reports empty states
- [x] Time range selector remains functional

### Edge Cases

- [x] Handles 100% bank balance (crypto = 0) gracefully in pie chart
- [x] Handles 100% crypto (bank = 0) gracefully in pie chart
- [x] Handles negative bank balance display appropriately
- [x] Line chart handles single data point

---

## 6. Accessibility

### ARIA Labels and Roles

- [x] Page has appropriate heading hierarchy (`h1` for page title)
- [x] Cards use semantic HTML (no unnecessary divs)
- [x] Charts have `role="img"` with `aria-label` describing the visualization
- [x] Time range selector buttons have clear accessible names
- [x] Tooltips are accessible via keyboard focus (not just hover)

### Keyboard Navigation

- [x] All interactive elements are reachable via Tab key
- [x] Time range buttons can be activated with Enter/Space
- [x] Tab order is logical (left-to-right, top-to-bottom)
- [x] No keyboard traps exist in chart interactions
- [x] Skip links work if page has complex structure

### Screen Reader Compatibility

- [x] Card values are announced with context (e.g., "Net Worth: 25.5M VND")
- [x] Chart data is available in text form or via accessible data table
- [x] Dynamic content changes are announced (loading states, value updates)
- [x] Pie chart percentages are available to screen readers

### Color Contrast Ratios (WCAG 2.1 AA)

- [x] Text on cards meets 4.5:1 contrast ratio
- [x] Labels (muted-foreground) meet 4.5:1 against background
- [x] Interactive elements have 3:1 contrast for focus indicators
- [x] Pie chart segments are distinguishable beyond color (pattern or label)
- [x] Income (emerald) and expense (rose) colors meet contrast requirements

---

## 7. Dashboard-Specific Items

### Summary Cards

- [x] Net Worth card displays `formatCompact()` value with `tooltip-fast` showing `formatCurrency()`
- [x] Monthly Income shows value with `+` prefix and emerald color
- [x] Monthly Expense shows value with `-` prefix and rose color
- [x] All cards use consistent icon + label + info tooltip pattern
- [x] Cards match the visual style of `PortfolioSummaryCards` and `SubscriptionSummaryCards`

### Net Worth Pie Chart

- [x] Shows two segments: Bank Account (emerald) and Crypto Investment (blue)
- [x] Center label shows "Net Worth" text
- [x] Hover tooltip displays segment name, `formatCompact()` amount, and percentage
- [x] Percentages sum to 100%
- [x] Segment stroke uses `var(--card)` for clean separation
- [x] Uses `ResponsiveContainer` for proper sizing

### Net Worth History Line Chart

- [x] Smooth line connects data points
- [x] X-axis shows formatted dates (responsive to time range)
- [x] Y-axis shows VND values with appropriate tick formatting
- [x] Hover shows exact date and `formatCurrency()` value
- [x] Area under line has subtle fill for visual appeal
- [x] Responsive to container width

### Time Range Selector

- [x] Displays 3 options: 1m, 1y, All
- [x] Uses tab-style button group (matches `PortfolioHistoryChart` pattern)
- [x] Selected state uses `bg-foreground text-background`
- [x] Unselected uses `text-muted-foreground hover:text-foreground`
- [x] Buttons are wrapped in `rounded-lg border border-border bg-card p-1` container
- [x] Default selection is "1m"
- [x] Switching ranges triggers chart data refetch with loading state

### Currency Formatting

- [x] All monetary values use `formatCompact()` from `@/lib/currency`
- [x] Tooltips show full value via `formatCurrency()`
- [x] Compact format correctly shows: `500d`, `150K`, `25M`, `1.5B`
- [x] Full format shows VND with proper thousands separators

---

## 8. Dark Mode

### Component Theme Support

- [x] Cards background uses `bg-sidebar` (adapts to dark theme)
- [x] Card borders use `border-border` (adapts to dark theme)
- [x] All text colors use semantic tokens (foreground, muted-foreground)
- [x] Icons use semantic colors that work in both modes

### Chart Colors in Dark Mode

- [x] Pie chart segment colors remain visible and distinguishable
- [x] Line chart uses appropriate stroke color for dark background
- [x] Chart grid lines (if any) use `--border` color
- [x] Tooltip backgrounds use `--popover` color
- [x] Chart axis labels use `--muted-foreground`

### Tooltip Dark Mode

- [x] `tooltip-fast` pseudo-element correctly switches colors in dark mode
- [x] Chart custom tooltips use `bg-popover` and `text-popover-foreground`
- [x] Borders use `border-border`

### Contrast in Dark Mode

- [x] All text remains readable in dark mode
- [x] Emerald/green and rose/red colors have sufficient contrast
- [x] Blue segment in pie chart is visible against dark background
- [x] Focus rings are visible in dark mode

---

## 9. Performance and Polish

### Animation Quality

- [x] Skeleton loading uses smooth `animate-pulse`
- [x] Chart transitions are smooth (no jarring movements)
- [x] Pie chart segments animate on initial load (if using recharts default)
- [x] Line chart draws smoothly
- [x] Tab switching in time range selector feels responsive

### Visual Polish

- [x] Consistent border radius (`rounded-lg`) across all elements
- [x] No visual glitches or overflow issues
- [x] Shadows and elevation match design system
- [x] Typography is crisp and readable at all sizes
- [x] Icons are properly aligned with text

### Cross-Browser Consistency

- [x] Renders correctly in Chrome
- [x] Renders correctly in Safari
- [x] Renders correctly in Firefox
- [x] No layout issues in Edge

---

## Testing Sign-off

| Viewport         | Tested | Notes |
| ---------------- | ------ | ----- |
| Desktop (1440px) | [x]    | All elements display correctly side-by-side |
| Tablet (768px)   | [x]    | Cards in 3-column, charts stacked |
| Mobile (375px)   | [x]    | Single column layout, all elements accessible |

| Theme      | Tested | Notes |
| ---------- | ------ | ----- |
| Light Mode | [x]    | All colors visible and readable |
| Dark Mode  | [x]    | Proper contrast, semantic colors work |

**Reviewer:** Claude Code (Playwright MCP)
**Date:** 2026-01-03
**Status:** [x] Pass / [ ] Fail / [ ] Partial

---

## References

- Design patterns from: `src/components/crypto/portfolio-summary-cards.tsx`
- Pie chart pattern from: `src/components/reports/distribution-pie-chart.tsx`
- Time range selector pattern from: `src/components/crypto/portfolio-history-chart.tsx`
- Empty states pattern from: `src/components/reports/reports-empty-states.tsx`
- Currency formatting: `src/lib/currency.ts`
- CSS variables: `src/styles.css`
