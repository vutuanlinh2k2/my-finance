# Crypto Portfolio Feature - UI/UX Testing Checklist

This checklist covers all UI/UX testing requirements for the Crypto Portfolio feature (Assets, Storage, and Transactions pages). Each item should be manually verified during design review using Playwright MCP.

---

## 1. Visual Consistency

### Design System Adherence (shadcn/ui)

#### Global Components

- [ ] All buttons use shadcn/ui Button component with appropriate variants (default, outline, ghost, destructive)
- [ ] All modals use shadcn/ui Dialog component with proper header, content, and footer sections
- [ ] Cards use shadcn/ui Card component styling (summary cards, chart containers)
- [ ] Form inputs use shadcn/ui Input, Select, and DatePicker components
- [ ] Tabs use shadcn/ui Tabs component for chart tab switching
- [ ] Tables use consistent styling with sortable column headers
- [ ] Badges for transaction types use shadcn/ui Badge component with CVA variants
- [ ] All interactive elements have consistent border-radius values (following CSS variables)
- [ ] Scrollable areas use consistent scrollbar styling

#### Assets Page

- [ ] Summary cards (Portfolio Value, 24h Change, 7d Change, USD Rate) use Card component with consistent padding
- [ ] Each summary card has icon with colored background in header
- [ ] Pie chart container uses Card styling with proper shadow and border
- [ ] History charts container uses Card styling with tab navigation (placeholder for Phase 6)
- [ ] Assets table uses consistent table styling with proper cell alignment
- [ ] Time range selector buttons use toggle-group pattern (disabled until Phase 6)

#### Storage Page

- [ ] Two-panel layout matches existing Reports page pattern
- [ ] Storage list items use consistent list-item styling
- [ ] Storage pie chart container matches Assets page chart styling
- [ ] Right panel asset list uses consistent list styling

#### Transactions Page

- [ ] Filter bar uses consistent flex layout with proper spacing
- [ ] Transaction list uses consistent table/list styling
- [ ] Pagination controls use shadcn/ui pagination pattern
- [ ] Multi-step modal follows consistent modal patterns

### Spacing & Typography

#### Headers & Titles

- [ ] Page titles ("Crypto Assets", "Crypto Storage", "Crypto Transactions") use text-2xl font weight
- [ ] Section subheadings use text-lg with appropriate font weight
- [ ] Card titles use text-sm uppercase with muted color
- [ ] Table column headers use consistent typography (text-sm, font-medium)

#### Content Spacing

- [ ] Consistent gap between page header and content (gap-6 or similar)
- [ ] Summary cards have uniform gap spacing (gap-4)
- [ ] Chart sections have proper vertical spacing from summary cards
- [ ] Table rows have consistent padding (py-3 or similar)
- [ ] Modal sections have proper vertical spacing between form groups
- [ ] Filter bar elements have consistent horizontal spacing

#### Alignment

- [ ] Numeric values (prices, amounts, percentages) are right-aligned in tables
- [ ] Asset icons and symbols are left-aligned with proper icon-text spacing
- [ ] Percentage change values have consistent alignment with +/- prefix
- [ ] Modal form labels align consistently above inputs

### Colors (OKLCH Color System)

#### Price Change Indicators

- [ ] Positive changes (gains) use success/emerald color (green family)
- [ ] Negative changes (losses) use destructive/red color
- [ ] Zero change uses neutral/muted color
- [ ] Color intensity is consistent across 24h, 7d, 30d, 60d, 1y columns

#### Transaction Type Badges

- [ ] Buy badge uses a distinct color (e.g., emerald/green)
- [ ] Sell badge uses a distinct color (e.g., red)
- [ ] Transfer Between badge uses a distinct color (e.g., blue)
- [ ] Swap badge uses a distinct color (e.g., purple)
- [ ] Transfer In badge uses a distinct color (e.g., teal)
- [ ] Transfer Out badge uses a distinct color (e.g., orange)
- [ ] Badge colors are consistent throughout the app

#### Chart Colors

- [ ] Pie chart segments use distinct, harmonious colors
- [ ] Same asset always has same color across pie chart and area chart
- [ ] Area chart uses appropriate fill opacity for stacked visualization
- [ ] Line chart uses primary accent color for portfolio value line

#### Storage Type Indicators

- [ ] CEX storage type has distinct icon/color indicator
- [ ] Wallet storage type has distinct icon/color indicator
- [ ] Selected storage has visible highlight color

### Icon Usage (@phosphor-icons/react)

#### Navigation & Actions

- [ ] Add buttons use Plus/PlusCircle icon
- [ ] Edit actions use PencilSimple/Pencil icon
- [ ] Delete actions use Trash icon
- [ ] External links (TX explorer) use ArrowSquareOut/Link icon
- [ ] Sort indicators use CaretUp/CaretDown icons
- [ ] Filter dropdown uses Funnel icon
- [ ] Date picker uses Calendar icon

#### Asset & Storage Icons

- [ ] Crypto asset icons load from CoinGecko URL
- [ ] Fallback icon shown when CoinGecko icon fails to load
- [ ] CEX storage uses appropriate exchange icon (Bank or similar)
- [ ] Wallet storage uses Wallet icon
- [ ] Storage type icons are consistent size (16px or 20px)

#### Transaction Type Icons

- [ ] Buy transaction uses appropriate icon (ShoppingCart/ArrowDown)
- [ ] Sell transaction uses appropriate icon (CurrencyDollar/ArrowUp)
- [ ] Transfer uses ArrowsLeftRight or similar icon
- [ ] Swap uses Swap/ArrowsClockwise icon
- [ ] Transfer In uses ArrowDownLeft/Download icon
- [ ] Transfer Out uses ArrowUpRight/Upload icon

---

## 2. Responsive Design

### Mobile (375px width)

#### Assets Page

- [ ] Summary cards stack in 2x2 grid or single column
- [ ] Pie chart scales to fit mobile width with readable labels
- [ ] History charts display in single column below pie chart
- [ ] Time range selector wraps or uses scrollable horizontal list
- [ ] Assets table becomes scrollable horizontally or switches to card view
- [ ] Table columns prioritize: Asset, Balance, Value (hide less critical columns)
- [ ] Add Asset button accessible (fixed or in header)

#### Storage Page

- [ ] Panels stack vertically (pie chart + storage list on top, asset details below)
- [ ] Storage pie chart scales appropriately
- [ ] Storage list takes full width
- [ ] Selected storage indicator clearly visible
- [ ] Asset list in right panel takes full width

#### Transactions Page

- [ ] Filter bar wraps to multiple rows if needed
- [ ] Date pickers use mobile-friendly date selection
- [ ] Transaction list uses card layout instead of table
- [ ] Each transaction card shows all essential info
- [ ] Pagination controls fit mobile width
- [ ] Add Transaction button accessible

#### Modal Behavior

- [ ] Modals take full screen or near-full screen on mobile
- [ ] Modal form inputs are full width
- [ ] Modal buttons stack vertically if needed
- [ ] Virtual keyboard does not obscure active input
- [ ] Modal can be scrolled if content exceeds viewport

#### General Mobile

- [ ] No horizontal scrolling on main content
- [ ] Touch targets are at least 44x44px
- [ ] Tap areas do not overlap
- [ ] Sidebar collapses to hamburger menu

### Tablet (768px width)

#### Assets Page

- [ ] Summary cards display in single row (4 cards)
- [ ] Charts section shows pie chart and history charts side by side or stacked
- [ ] Assets table displays key columns without horizontal scroll
- [ ] Time range selector displays all options inline

#### Storage Page

- [ ] Two-panel layout begins to show side-by-side
- [ ] Pie chart and storage list share left panel space
- [ ] Asset details panel visible on right

#### Transactions Page

- [ ] Filter bar displays inline without wrapping
- [ ] Transaction table shows most columns
- [ ] Actions column visible without hover

#### General Tablet

- [ ] Adequate spacing between elements
- [ ] Touch targets remain accessible
- [ ] Modals use centered overlay (not full screen)

### Desktop (1440px width)

#### Assets Page

- [ ] Summary cards display in single row with comfortable spacing
- [ ] Pie chart takes approximately 1/3 width
- [ ] History charts section takes approximately 2/3 width
- [ ] Assets table displays all columns without horizontal scroll
- [ ] Sortable column headers easily clickable
- [ ] Row hover effects visible

#### Storage Page

- [ ] Two-panel layout with 50/50 split (or similar)
- [ ] Left panel: pie chart (top) + storage list (bottom)
- [ ] Right panel: selected storage asset details
- [ ] Comfortable spacing between panels
- [ ] Storage list items have adequate height

#### Transactions Page

- [ ] Filter bar has comfortable spacing
- [ ] Transaction table displays all columns
- [ ] Actions always visible (no hover required)
- [ ] Pagination at comfortable position

#### General Desktop

- [ ] Maximum content width applied (max-w-7xl or similar)
- [ ] Content centered with side margins
- [ ] Hover states enhance interactivity

---

## 3. Interactive States

### Buttons (Add Asset, Add Storage, Add Transaction)

- [ ] Default state: appropriate background and text color
- [ ] Hover state: visible color/brightness change
- [ ] Active/pressed state: further visual feedback
- [ ] Focus state: visible outline ring
- [ ] Disabled state: reduced opacity, not-allowed cursor
- [ ] Loading state: spinner or disabled with loading text

### Table Rows (Assets Table, Transaction List)

- [ ] Default state: clean background
- [ ] Hover state: subtle background color change
- [ ] Selected state (if applicable): distinct highlight
- [ ] Focus state: visible outline for keyboard navigation
- [ ] Clickable rows show pointer cursor

### Sortable Column Headers

- [ ] Default state: neutral appearance
- [ ] Hover state: cursor pointer, subtle highlight
- [ ] Sorted ascending: CaretUp icon visible
- [ ] Sorted descending: CaretDown icon visible
- [ ] Click toggles sort direction
- [ ] Active sort column visually distinct

### Storage List Items

- [ ] Default state: neutral background
- [ ] Hover state: subtle background change, pointer cursor
- [ ] Selected state: visible highlight (background or border)
- [ ] Focus state: visible outline
- [ ] Click selects and updates right panel

### Time Range Selector (7d, 30d, 60d, 1y, All)

- [ ] Default/inactive state: muted styling
- [ ] Hover state: subtle highlight
- [ ] Active/selected state: prominent highlight (background change)
- [ ] Focus state: visible outline
- [ ] Click updates chart data range

### Chart Tab Selector (Allocation History / Total Value)

- [ ] Inactive tab: muted text, no underline/background
- [ ] Hover state: subtle text color change
- [ ] Active tab: prominent styling (underline, background, or bold text)
- [ ] Focus state: visible outline
- [ ] Tab switch animates chart content

### Filter Dropdowns (Transaction Type, Date Range)

- [ ] Closed state: shows current selection or placeholder
- [ ] Hover state: border or background change
- [ ] Open state: dropdown visible with options
- [ ] Option hover: background highlight
- [ ] Selected option: checkmark or highlight
- [ ] Multi-select: checkboxes for each option

### Pagination Controls

- [ ] Current page: highlighted/selected state
- [ ] Other pages: neutral clickable state
- [ ] Previous/Next buttons: enabled/disabled based on position
- [ ] Hover state on all clickable elements
- [ ] Focus state with visible outline

### Modal Interactions

- [ ] Backdrop click closes modal (if not prevented)
- [ ] Escape key closes modal
- [ ] Close button (X) has hover and focus states
- [ ] Form submit button states (default, hover, loading, disabled)
- [ ] Cancel button states

---

## 4. Loading States

### Initial Page Load

#### Assets Page

- [ ] Page skeleton shows while data loads
- [ ] Summary card skeletons match card dimensions
- [ ] Pie chart area shows loading skeleton (circle shape)
- [ ] History chart area shows loading skeleton
- [ ] Table shows skeleton rows (5-10 placeholder rows)
- [ ] Loading skeleton uses shimmer animation

#### Storage Page

- [ ] Left panel shows chart and list skeletons
- [ ] Right panel shows loading skeleton or empty state text
- [ ] Storage list shows skeleton items

#### Transactions Page

- [ ] Filter bar loads immediately (no skeleton needed)
- [ ] Transaction list shows skeleton rows
- [ ] Pagination shows skeleton or placeholder

### Data Fetching States

- [ ] CoinGecko price fetch shows loading indicator
- [ ] Exchange rate fetch shows loading indicator (if separate)
- [ ] Stale data indicator if prices are outdated
- [ ] "Price data may be delayed" warning if rate limited

### Action Loading States

- [ ] Add Asset modal: Create button shows loading spinner
- [ ] "Auto-fill Metadata" button shows loading while fetching from CoinGecko
- [ ] Add Storage modal: Create button shows loading spinner
- [ ] Add Transaction modal: Create button shows loading spinner
- [ ] Delete confirmation: Delete button shows loading spinner
- [ ] Period/filter change: Brief loading indicator or smooth transition

### Progressive Loading

- [ ] Summary cards can show partial data (total value first, then changes)
- [ ] Charts can load independently from table
- [ ] Table loads with available data, updates when prices arrive

---

## 5. Empty States

### Assets Page

#### No Assets Added

- [ ] Clear empty state message: "Add your first crypto asset to start tracking"
- [ ] Prominent Add Asset button or call-to-action
- [ ] Empty state icon (e.g., Coins, CurrencyCircleDollar from Phosphor)
- [ ] Summary cards show placeholder values (0 or dashes)
- [ ] Pie chart shows "No Data" placeholder
- [ ] Table shows empty state message

#### No Price Data Available

- [ ] Assets listed but prices show "Loading" or placeholder
- [ ] Clear indication that price fetch failed (if applicable)
- [ ] Retry option available

### Storage Page

#### No Storage Created

- [ ] Clear empty state: "Add a storage location to organize your assets"
- [ ] Prominent Add Storage button
- [ ] Empty state icon (Wallet or Vault from Phosphor)
- [ ] Pie chart shows "No Data" placeholder
- [ ] Storage list shows empty state

#### No Storage Selected

- [ ] Right panel shows: "Select a storage location from the list"
- [ ] Visual indication to guide user to left panel
- [ ] Empty state styled consistently

#### Storage with No Assets

- [ ] Storage appears in list with 0 value
- [ ] When selected, right panel shows: "No assets in this storage yet"
- [ ] Helpful suggestion to record transactions

### Transactions Page

#### No Transactions Recorded

- [ ] Clear empty state: "Record your first transaction"
- [ ] Prominent Add Transaction button
- [ ] Empty state icon (Receipt, ListBullets from Phosphor)
- [ ] Filter bar still visible and functional

#### No Transactions Match Filters

- [ ] Message: "No transactions match your filters"
- [ ] Clear Filters button prominently displayed
- [ ] Suggestion to adjust filter criteria

#### No Transactions for Date Range

- [ ] Message indicating no activity in selected period
- [ ] Suggestion to expand date range

---

## 6. Error States

### Form Validation Errors

#### Add Asset Modal

- [ ] No coin selected: "Please select a cryptocurrency" (toast)
- [ ] Empty name after selection: "Please enter a name" (toast)
- [ ] Empty symbol after selection: "Please enter a symbol" (toast)
- [ ] Search returns no results: "No results found" message in dropdown
- [ ] Search API error: Error message displayed in dropdown
- [ ] Duplicate asset: "This asset has already been added to your portfolio" (toast)
- [ ] Input borders show validation state appropriately

#### Add Storage Modal

- [ ] Empty name: "Storage name is required"
- [ ] Empty address for wallet type: "Wallet address is required"
- [ ] Invalid explorer URL: "Please enter a valid URL"
- [ ] Duplicate storage name: "A storage with this name already exists"
- [ ] Error styling consistent with Add Asset modal

#### Add Transaction Modal

- [ ] Missing required fields: Clear error for each
- [ ] Invalid amount (negative, zero, non-numeric): "Please enter a valid amount"
- [ ] Amount exceeds balance (for Sell, Transfer Out): "Insufficient balance"
- [ ] Missing "Investing" tag (for Buy/Sell): "Please create an 'Investing' tag for [expenses/income] first"
- [ ] Investing tag error is prominent and actionable
- [ ] Invalid TX ID format (if validated): Clear error message
- [ ] Invalid explorer URL: "Please enter a valid URL"

### API Error Handling

#### CoinGecko Errors

- [ ] Rate limit exceeded: "Price data temporarily unavailable. Showing cached prices."
- [ ] Network error: "Unable to fetch price data. Please check your connection."
- [ ] Invalid asset response: "Unable to load asset details"
- [ ] Retry button available for failed requests

#### Supabase Errors

- [ ] Failed to load assets: "Unable to load your assets. Please try again."
- [ ] Failed to load storages: "Unable to load storage locations. Please try again."
- [ ] Failed to load transactions: "Unable to load transactions. Please try again."
- [ ] Failed to create/update/delete: Toast notification with error message
- [ ] Network unavailable: "You appear to be offline. Please check your connection."

### Error Recovery

- [ ] Retry buttons available for recoverable errors
- [ ] Error states do not break page layout
- [ ] Partial data shown when available (e.g., assets without prices)
- [ ] User can dismiss error notifications
- [ ] Automatic retry after network restoration

---

## 7. Accessibility (WCAG 2.1 AA)

### ARIA Labels

#### Charts

- [ ] Pie charts have aria-label describing the chart purpose
- [ ] Each pie segment has aria-label with asset name, value, percentage
- [ ] Area chart has descriptive aria-label
- [ ] Line chart has descriptive aria-label
- [ ] Alternative text representation available (data table)

#### Forms

- [ ] All form inputs have associated labels (visible or aria-label)
- [ ] Required fields indicated with aria-required="true"
- [ ] Error messages linked with aria-describedby
- [ ] Form groups use fieldset and legend where appropriate

#### Tables

- [ ] Tables have caption or aria-label describing content
- [ ] Sortable columns have aria-sort attribute
- [ ] Table headers use scope="col"
- [ ] Action buttons have descriptive aria-labels

#### Modals

- [ ] Modals have aria-modal="true"
- [ ] Modal titles linked with aria-labelledby
- [ ] Close buttons have aria-label="Close"
- [ ] Focus trapped within modal

### Keyboard Navigation

#### Tab Order

- [ ] Logical tab order through page elements
- [ ] Tab order: Header actions -> Summary cards -> Charts -> Table -> Pagination
- [ ] Modals: Tab cycles through modal elements only
- [ ] No tab stops on decorative elements

#### Keyboard Operability

- [ ] Enter/Space activates buttons and links
- [ ] Arrow keys navigate within toggle groups and tabs
- [ ] Escape closes modals and dropdowns
- [ ] Arrow keys navigate table rows (if implemented)
- [ ] Enter opens edit modal on focused table row (if applicable)

#### Focus Management

- [ ] Visible focus indicator on all interactive elements
- [ ] Focus ring uses accessible colors (meets 3:1 contrast)
- [ ] Focus moves to modal when opened
- [ ] Focus returns to trigger when modal closes
- [ ] Focus does not get lost during dynamic updates

### Screen Reader Support

- [ ] Page landmarks properly defined (main, nav, header)
- [ ] Heading hierarchy is logical (h1 -> h2 -> h3)
- [ ] Currency amounts include "VND" when read
- [ ] Percentages announced correctly (e.g., "positive five percent")
- [ ] Loading states announced with aria-live regions
- [ ] Error messages announced immediately
- [ ] Success notifications announced

### Color Independence

- [ ] Price changes indicated by icon or text, not just color
- [ ] Transaction types distinguishable without color (use icons + text)
- [ ] Chart segments distinguishable with patterns (if possible) or legend
- [ ] Error states have icon + text, not just red color
- [ ] Selected states have border/background change, not just color

### Contrast Requirements

- [ ] Body text meets 4.5:1 contrast ratio
- [ ] Large text (18pt+) meets 3:1 contrast ratio
- [ ] Interactive element boundaries meet 3:1 contrast ratio
- [ ] Focus indicators meet 3:1 contrast ratio
- [ ] Placeholder text meets 4.5:1 contrast ratio
- [ ] Disabled state text remains readable (though muted)

---

## 8. Dark Mode

### Summary Cards

- [ ] Card backgrounds use dark theme card color
- [ ] Card text uses appropriate light colors
- [ ] Card borders visible in dark mode
- [ ] Positive/negative change colors visible and distinct

### Charts

#### Pie Chart

- [ ] Segment colors visible and distinct in dark mode
- [ ] Chart background uses dark theme color
- [ ] Center label (if any) readable
- [ ] Tooltips styled for dark mode
- [ ] Legend text readable

#### Area Chart

- [ ] Stacked areas use appropriate opacity for dark mode
- [ ] Grid lines visible but subtle
- [ ] Axis labels readable
- [ ] Tooltip background uses dark surface color

#### Line Chart

- [ ] Line color visible against dark background
- [ ] Grid lines subtle but visible
- [ ] Axis labels readable
- [ ] Tooltip styled for dark mode

### Tables

- [ ] Table background uses dark theme color
- [ ] Row hover uses appropriate dark hover color
- [ ] Text colors provide sufficient contrast
- [ ] Sort icons visible
- [ ] Borders/dividers visible but subtle

### Forms & Modals

- [ ] Modal background uses dark surface color
- [ ] Input backgrounds use dark input color
- [ ] Input borders visible
- [ ] Input text readable
- [ ] Placeholder text visible but muted
- [ ] Button variants correct in dark mode
- [ ] Focus rings visible

### Transaction Badges

- [ ] All 6 transaction type badges readable in dark mode
- [ ] Badge background colors appropriate
- [ ] Badge text has sufficient contrast

### Storage List

- [ ] List item backgrounds appropriate
- [ ] Selected state visible in dark mode
- [ ] Hover state visible
- [ ] Storage type icons visible

### General Dark Mode

- [ ] No elements "disappear" in dark mode
- [ ] Consistent use of dark theme CSS variables
- [ ] Transitions smooth when switching themes
- [ ] Icons visible (use currentColor or appropriate colors)

---

## 9. Charts

### Pie Chart (Assets Page - Allocation)

#### Rendering

- [ ] Chart renders without visual artifacts
- [ ] Segments sized proportionally to allocation percentages
- [ ] Very small segments (< 1%) visible or grouped into "Other"
- [ ] Single asset case (100%) renders as full circle
- [ ] Animation on initial render (smooth entry)
- [ ] Animation when data updates

#### Center Label

- [ ] Shows total portfolio value (formatCompact)
- [ ] Tooltip shows full value (formatCurrency)
- [ ] Text centered and readable at all viewport sizes

#### Tooltips

- [ ] Hover shows asset name
- [ ] Tooltip shows value (formatCurrency)
- [ ] Tooltip shows percentage
- [ ] Tooltip positioned without clipping viewport
- [ ] Tooltip appears instantly (tooltip-fast behavior)
- [ ] Tooltip disappears on mouse leave

#### Interactivity

- [ ] Segment hover highlights segment (slight lift or brightness)
- [ ] Click on segment could filter table (if implemented)
- [ ] Hover does not cause layout shift

### Pie Chart (Storage Page - Distribution)

- [ ] Same rendering quality as Assets page pie chart
- [ ] Shows storage name in tooltip (not asset name)
- [ ] Center shows total value or storage count
- [ ] Click on segment selects corresponding storage

### Area Chart (Allocation History)

#### Rendering

- [ ] Stacked areas render correctly
- [ ] Areas do not overlap incorrectly
- [ ] Y-axis shows 0-100% scale
- [ ] X-axis shows time labels appropriately for selected range
- [ ] Smooth curves between data points

#### Interactivity

- [ ] Hover shows vertical crosshair line
- [ ] Tooltip shows date and allocation breakdown
- [ ] Tooltip shows all assets with percentages
- [ ] Hover interaction smooth (no flicker)

#### Time Range

- [ ] 7d range shows appropriate granularity
- [ ] 30d range shows appropriate granularity
- [ ] 60d range shows appropriate granularity
- [ ] 1y range shows monthly or weekly granularity
- [ ] All range shows yearly or quarterly granularity
- [ ] Transitions smooth when changing range

### Line Chart (Total Value History)

#### Rendering

- [ ] Single line renders smoothly
- [ ] Y-axis shows VND values (formatCompact)
- [ ] X-axis shows time labels
- [ ] Area fill below line (optional)
- [ ] Starting point and ending point clear

#### Interactivity

- [ ] Hover shows data point highlight
- [ ] Tooltip shows date and value (formatCurrency)
- [ ] Crosshair or point indicator on hover

#### Visual Polish

- [ ] Grid lines subtle but helpful
- [ ] Axis labels readable
- [ ] Chart title clear (if shown)
- [ ] Responsive sizing at different viewports

### Chart Legends

- [ ] Legend items show asset colors
- [ ] Legend items clickable to toggle visibility (if implemented)
- [ ] Legend positioned without obscuring chart
- [ ] Legend wraps appropriately on smaller viewports

---

## 10. Tables

### Assets Table

#### Column Alignment

- [ ] Asset column (Icon + Symbol): left-aligned
- [ ] Price column: right-aligned
- [ ] Change columns (24h, 7d, 30d, 60d, 1y): right-aligned with +/- prefix
- [ ] Market Cap column: right-aligned
- [ ] Balance column: right-aligned
- [ ] Value column: right-aligned
- [ ] % Portfolio column: right-aligned

#### Sorting

- [ ] All columns sortable
- [ ] Default sort: Value descending
- [ ] Sort icon visible on sorted column
- [ ] Click toggles ascending/descending
- [ ] Stable sort (equal values maintain relative order)

#### Content Display

- [ ] Asset icons load and display correctly
- [ ] Fallback icon for failed image loads
- [ ] Prices use formatCompact with tooltip
- [ ] Change percentages colored (green/red/neutral)
- [ ] Balance shows appropriate decimal places
- [ ] Very small balances handled (scientific notation or threshold)

#### Row States

- [ ] Hover state visible
- [ ] Row click behavior defined (expand, modal, or none)
- [ ] Keyboard navigable rows (if interactive)

### Transaction List/Table

#### Column Display

- [ ] Date column: formatted consistently (e.g., "Jan 5, 2024")
- [ ] Type column: colored badge
- [ ] Details column: type-specific summary text
- [ ] TX ID column: truncated with copy/link functionality
- [ ] Actions column: Edit, Delete buttons

#### Type-Specific Details

- [ ] Buy: "Bought [amount] [symbol] for [fiat]" + storage icon
- [ ] Sell: "Sold [amount] [symbol] for [fiat]" + storage icon
- [ ] Transfer Between: "[amount] [symbol]: [from] -> [to]"
- [ ] Swap: "[from_amount] [from_symbol] -> [to_amount] [to_symbol]" + storage
- [ ] Transfer In: "Received [amount] [symbol]" + storage icon
- [ ] Transfer Out: "Sent [amount] [symbol]" + storage icon

#### Actions

- [ ] Edit button opens edit modal
- [ ] Delete button shows confirmation dialog
- [ ] Actions visible on hover (desktop) or always visible (mobile)
- [ ] Action buttons have appropriate icons

#### Pagination

- [ ] Page numbers displayed
- [ ] Current page highlighted
- [ ] Previous/Next arrows functional
- [ ] First/Last page navigation (if implemented)
- [ ] Disabled states at boundaries
- [ ] Page size indicator (showing 20 items)

### Storage Asset List (Right Panel)

- [ ] Asset icon + symbol displayed
- [ ] Balance displayed
- [ ] Current price displayed
- [ ] Value (balance x price) displayed
- [ ] Sorted by value descending
- [ ] Scrollable if many assets

---

## 11. Modals

### Add Asset Modal (Search-Based)

#### Structure

- [ ] Modal title: "Add Crypto Asset"
- [ ] Search input with magnifying glass icon
- [ ] Search results list (appears when query >= 2 characters)
- [ ] Selected coin preview with icon, name, symbol, and "Change" button
- [ ] Name input (editable, shown after selection)
- [ ] Symbol input (editable, shown after selection)
- [ ] Footer: Cancel and "Add Asset" buttons

#### Behavior

- [ ] Modal opens with focus on search input
- [ ] Search debounces input by 300ms
- [ ] Loading spinner shows during search
- [ ] Search results show coin icons, names, and symbols
- [ ] Click on result selects coin and auto-fills form
- [ ] Selected coin preview replaces search results
- [ ] "Change" button clears selection and shows search again
- [ ] Name and Symbol editable after selection
- [ ] Cancel closes modal without action
- [ ] "Add Asset" button disabled until coin selected
- [ ] Success closes modal and refreshes data
- [ ] Error shows toast message, keeps modal open

#### Animation

- [ ] Fade-in backdrop
- [ ] Scale/slide-in modal content
- [ ] Smooth close animation

### Add Storage Modal

#### Structure

- [ ] Modal title: "Add Storage Location"
- [ ] Storage type toggle: CEX / Wallet
- [ ] CEX fields: Name only
- [ ] Wallet fields: Address (required), Name (optional), Explorer URL (optional)
- [ ] Footer: Cancel and Create buttons

#### Conditional Fields

- [ ] CEX selected: Only Name field shown
- [ ] Wallet selected: Address, Name, Explorer URL fields shown
- [ ] Smooth transition between field sets
- [ ] Required indicator on Address when Wallet selected

#### Behavior

- [ ] Type toggle accessible via keyboard
- [ ] Fields clear when switching type (or preserve, based on design)
- [ ] Create validates based on selected type
- [ ] Wallet name defaults to truncated address if empty

### Add Transaction Modal (Multi-Step)

#### Step 1: Type Selection

- [ ] 6 transaction type buttons displayed
- [ ] Each button has icon + label
- [ ] Buttons have hover and focus states
- [ ] Click advances to Step 2 with selected type

#### Step 2: Type-Specific Form

##### Buy Form

- [ ] Asset dropdown (from user's assets)
- [ ] Amount input (number)
- [ ] Storage dropdown
- [ ] Fiat Amount input (VND)
- [ ] Date picker
- [ ] TX ID input (optional)
- [ ] TX Explorer URL input (optional)

##### Sell Form

- [ ] Same fields as Buy
- [ ] Balance indicator for selected asset (max available)

##### Transfer Between Form

- [ ] Asset dropdown
- [ ] Amount input
- [ ] From Storage dropdown
- [ ] To Storage dropdown
- [ ] Date picker
- [ ] TX ID/URL inputs

##### Swap Form

- [ ] From Asset dropdown
- [ ] From Amount input
- [ ] To Asset dropdown
- [ ] To Amount input
- [ ] Storage dropdown
- [ ] Date picker
- [ ] TX ID/URL inputs

##### Transfer In Form

- [ ] Asset dropdown
- [ ] Amount input
- [ ] Storage dropdown
- [ ] Date picker
- [ ] TX ID/URL inputs

##### Transfer Out Form

- [ ] Same as Transfer In
- [ ] Balance indicator for max available

#### Navigation

- [ ] Back button to return to Step 1
- [ ] Type indicator shows current selection
- [ ] Cancel closes entire modal
- [ ] Create submits form

#### Focus Management

- [ ] Focus moves to first form field in Step 2
- [ ] Focus trapped within modal
- [ ] Tab order logical through form fields

### Edit Transaction Modal

- [ ] Same form as Add, pre-filled with existing data
- [ ] Type cannot be changed (or requires deletion)
- [ ] Delete button (with confirmation)
- [ ] Save and Cancel buttons
- [ ] Confirmation dialog for delete: "Are you sure? This cannot be undone."

### Delete Confirmation Dialog

- [ ] Clear warning message
- [ ] Transaction details shown for confirmation
- [ ] Cancel and Delete buttons
- [ ] Delete button uses destructive variant
- [ ] Loading state on Delete button during action

---

## 12. Forms

### Input Labels

- [ ] All inputs have visible labels
- [ ] Labels positioned above inputs (consistent with project)
- [ ] Required fields marked with asterisk or "(required)"
- [ ] Labels associated with inputs (htmlFor/id)

### Validation Feedback

- [ ] Real-time validation on blur or submit
- [ ] Error messages appear below inputs
- [ ] Error messages use consistent styling (text-sm text-destructive)
- [ ] Input borders change to red on error
- [ ] Success state (green border) if applicable
- [ ] Errors clear when user starts correcting

### Input Types

- [ ] Text inputs use type="text"
- [ ] Number inputs use type="number" with appropriate step
- [ ] Date inputs use DatePicker component
- [ ] URL inputs use type="url" with validation
- [ ] Select dropdowns use Select component

### Form States

- [ ] Empty form state: placeholders visible
- [ ] Filled form state: values displayed
- [ ] Invalid form state: errors visible, submit disabled
- [ ] Submitting state: button loading, inputs disabled
- [ ] Success state: form clears or modal closes

### Dropdown Selects

- [ ] Asset dropdown shows icon + symbol for each option
- [ ] Storage dropdown shows type icon + name for each option
- [ ] Selected value clearly displayed
- [ ] Searchable/filterable for many options (if implemented)
- [ ] Empty state if no options available

### Amount Inputs

- [ ] Accept decimal numbers
- [ ] Appropriate step value (0.00000001 for crypto)
- [ ] Prevent negative numbers
- [ ] Format display after blur (if applicable)
- [ ] VND inputs may use integer-only (no decimals)

---

## 13. Navigation

### Sidebar Navigation

#### Crypto Section

- [ ] "Crypto" parent item in sidebar
- [ ] Collapsible/expandable with click
- [ ] Expand icon rotates on toggle
- [ ] Child items: Assets, Storage, Transactions
- [ ] Child items indented appropriately

#### Active States

- [ ] Active page highlighted in sidebar
- [ ] Active indicator (background, border, or icon)
- [ ] Parent "Crypto" highlighted when any child active
- [ ] Section expands automatically when child is active

#### Hover States

- [ ] Hover state on all nav items
- [ ] Cursor pointer on clickable items
- [ ] Subtle background change on hover

#### Keyboard Navigation

- [ ] Tab through sidebar items
- [ ] Enter activates/expands items
- [ ] Arrow keys navigate within expanded section

### Page-Level Navigation

- [ ] Breadcrumbs (if implemented): Home > Crypto > Assets
- [ ] Back navigation works correctly
- [ ] URL updates reflect current page
- [ ] Browser back/forward buttons work

### Cross-Page Links

- [ ] Asset clicks could link to detailed view (if implemented)
- [ ] Storage clicks navigate correctly
- [ ] Transaction details may link to related pages

---

## 14. Currency Display

### formatCompact Usage

- [ ] Total Value card uses formatCompact
- [ ] 24h/7d/30d Change cards use formatCompact for values
- [ ] Asset table Price column uses formatCompact
- [ ] Asset table Value column uses formatCompact
- [ ] Asset table Market Cap uses formatCompact
- [ ] Storage totals use formatCompact
- [ ] Transaction fiat amounts use formatCompact
- [ ] Pie chart center value uses formatCompact

### formatCurrency Tooltips

- [ ] All formatCompact values have tooltip-fast class
- [ ] Tooltips show full value with formatCurrency
- [ ] Tooltip appears instantly (no delay)
- [ ] Tooltip positioned correctly (not clipped)
- [ ] Tooltip shows VND with proper thousands separators

### Positive/Negative Indicators

- [ ] Income/positive gains show + prefix
- [ ] Expense/negative losses show - prefix
- [ ] Buy transactions show fiat as expense (-)
- [ ] Sell transactions show fiat as income (+)
- [ ] Price changes show +/- with percentage

### Color Coding

- [ ] Positive changes use emerald/green color
- [ ] Negative changes use red color
- [ ] Zero/neutral uses muted color
- [ ] Colors consistent across all pages

### Edge Cases

- [ ] Very small values (< 1 VND): Show as "< 1" or "0"
- [ ] Very large values (trillions): formatCompact handles (T suffix)
- [ ] Zero values: Show as "0" or appropriate placeholder
- [ ] Null/undefined values: Show dash or loading state

### Exchange Rate Indicator

- [ ] Exchange rate source shown if using fallback
- [ ] "Prices in VND (via CoinGecko + Exchange Rate)" indicator
- [ ] Warning if exchange rate is stale

---

## 15. Interaction Feedback

### Button Clicks

- [ ] Immediate visual feedback on click (pressed state)
- [ ] Loading state for async operations
- [ ] Success feedback (toast, modal close, data update)
- [ ] Error feedback (toast, inline error)

### Data Updates

- [ ] After create: List updates to show new item
- [ ] After edit: List updates with changes
- [ ] After delete: Item removed from list
- [ ] Optimistic updates where appropriate
- [ ] Rollback on error with notification

### Toast Notifications

- [ ] Success toast for successful operations
- [ ] Error toast for failed operations
- [ ] Toast positioned consistently (bottom-right or top-right)
- [ ] Toast auto-dismisses after delay
- [ ] Toast dismissible with close button

### Confirmations

- [ ] Delete actions require confirmation
- [ ] Destructive actions have clear warning
- [ ] Confirmation dialogs are focused
- [ ] Cancel is easily accessible
- [ ] Actions complete after confirmation

### Selection Feedback

- [ ] Tag/storage selection updates immediately
- [ ] Related panels update to reflect selection
- [ ] Visual indication of current selection
- [ ] Selection persists during data refresh

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

#### Assets Page

- [ ] Portfolio with many assets (10+)
- [ ] Portfolio with single asset
- [ ] Portfolio with zero total value
- [ ] Asset with very small balance (< 0.00001)
- [ ] Asset with very large value (billions VND)
- [ ] Assets with mixed positive/negative price changes
- [ ] Historical data available for all time ranges

#### Storage Page

- [ ] Multiple storages (5+)
- [ ] Single storage only
- [ ] Storage with many assets
- [ ] Storage with no assets
- [ ] Mix of CEX and Wallet types
- [ ] Wallet with explorer URL

#### Transactions Page

- [ ] Many transactions (100+) for pagination testing
- [ ] Single transaction only
- [ ] All 6 transaction types present
- [ ] Transactions spanning multiple months
- [ ] Filter combinations that return no results

### Accessibility Testing Tools

- [ ] Run axe-core accessibility audit
- [ ] Test with VoiceOver (macOS)
- [ ] Test keyboard-only navigation
- [ ] Verify color contrast with contrast checker
- [ ] Test with high contrast mode

### Performance Considerations

- [ ] Page loads within 3 seconds
- [ ] Charts render within 1 second
- [ ] Table sorting is instant
- [ ] Filter changes respond within 500ms
- [ ] Modal open/close is smooth (< 300ms)

---

**Checklist Version:** 1.0
**Feature:** Crypto Portfolio (Assets, Storage, Transactions)
**Last Updated:** 2026-01-02
