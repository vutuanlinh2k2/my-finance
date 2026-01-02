# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm dev              # Dev server on port 3000
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm test             # Run tests once (vitest run)
pnpm lint             # Check linting issues
pnpm format           # Check formatting
pnpm check            # Auto-fix linting + formatting
```

## Architecture Overview

**Stack**: TanStack Start (full-stack React framework) + shadcn/ui + TailwindCSS 4 + Vite + Supabase

### File-Based Routing

- Routes live in `src/routes/` and are auto-generated into `src/routeTree.gen.ts`
- **Never edit `routeTree.gen.ts`** - it regenerates automatically when route files change
- `__root.tsx` is the root layout shell (HTML structure, devtools, global head)
- Route components export a `Route` object created with `createFileRoute()`
- Authenticated routes live in `src/routes/_authenticated/`

### Component System

- UI components in `src/components/ui/` follow shadcn/ui patterns
- Feature components in `src/components/<feature>/` (e.g., `subscriptions/`)
- Uses Radix UI primitives under the hood
- Icons from `@phosphor-icons/react`
- Component variants managed with CVA (Class Variance Authority)

### Data Layer (TanStack Query)

The app uses a structured API/hooks architecture:

```
src/lib/
├── api/              # Supabase API functions
│   ├── transactions.ts
│   ├── tags.ts
│   ├── subscriptions.ts
│   └── exchange-rate.ts
├── hooks/            # TanStack Query hooks
│   ├── use-transactions.ts
│   ├── use-tags.ts
│   ├── use-subscriptions.ts
│   └── use-exchange-rate.ts
├── query-keys.ts     # Centralized query key definitions
└── query-client.ts   # Query client configuration
```

**Query Keys Pattern:**

```tsx
// src/lib/query-keys.ts
export const queryKeys = {
  transactions: {
    all: ['transactions'] as const,
    byMonth: (year: number, month: number) =>
      ['transactions', year, month] as const,
  },
  subscriptions: {
    all: ['subscriptions'] as const,
  },
  exchangeRate: {
    current: ['exchange-rate'] as const,
  },
}
```

### Styling

- TailwindCSS 4 with Vite plugin
- CSS variables for theming defined in `src/styles.css` (`:root` and `.dark`)
- Uses OKLCH color space for all colors
- Use `cn()` from `@/lib/utils` to merge Tailwind classes
- Components use `data-slot` attributes for styling hooks

### Path Aliases

- `@/*` maps to `./src/*` (configured in tsconfig.json)

### Currency Formatting (VND)

All money amounts must use the utilities from `@/lib/currency`:

- `formatCompact(amount)` - Compact display: `500đ`, `150K`, `25M`, `1.5B`
- `formatCurrency(amount)` - Full format: `25.000.000 ₫`

**Rules:**

- Always display amounts using `formatCompact()` for clean UI
- Add fast tooltip with `formatCurrency()` to show full value on hover
- Use `+` prefix for income, `-` prefix for expenses
- No dot indicators for amounts in calendar cells

**Example:**

```tsx
import { formatCurrency, formatCompact } from '@/lib/currency'
;<span
  className="tooltip-fast text-emerald-600"
  data-tooltip={formatCurrency(amount)}
>
  +{formatCompact(amount)}
</span>
```

The `tooltip-fast` CSS class (defined in `src/styles.css`) shows tooltips instantly on hover.

## Key Patterns

**Component with variants (CVA pattern):**

```tsx
const variants = cva('base-classes', {
  variants: {
    variant: { default: '...', outline: '...' },
    size: { default: '...', sm: '...', lg: '...' },
  },
})

function Component({ className, variant, size, ...props }) {
  return (
    <div className={cn(variants({ variant, size, className }))} {...props} />
  )
}
```

**Route definition:**

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/path')({
  component: RouteComponent,
})
```

## Feature Documentation Workflow

For each new feature implementation, follow this documentation workflow to ensure high-quality deliverables:

### 1. Create Feature Documentation

- Create a folder inside `docs/` named after the feature (e.g., `docs/calendar/`, `docs/subscriptions/`)
- Create `<feature-name>-feat.md` file with complete feature specifications:
  - Feature overview and purpose
  - User stories and use cases
  - Detailed functional requirements
  - Data models and state management
  - API endpoints (if applicable)
  - Edge cases and error handling

### 2. Generate Testing Checklists

After completing the feature specification, generate two comprehensive checklists:

#### UI/UX Checklist (via `design-review` agent)

Use the `design-review` sub-agent to create `<feature-name>-ui-checklist.md`:

- Visual consistency with design system
- Responsive design across viewports (mobile, tablet, desktop)
- Accessibility compliance (WCAG guidelines)
- Interactive states (hover, focus, active, disabled)
- Loading states and skeleton screens
- Empty states and placeholder content
- Error state displays
- Animation and transition smoothness
- Typography and spacing consistency
- Color contrast and readability
- Icon usage and alignment
- Form field validation feedback
- Modal and dialog behavior
- Navigation and breadcrumb accuracy
- Dark mode compatibility (if applicable)

#### Logic/QA Checklist (via `qa-expert` agent)

Use the `qa-expert` sub-agent to create `<feature-name>-qa-checklist.md`:

- All functional requirements work as specified
- Data validation (input boundaries, required fields, formats)
- State management correctness
- API integration and error handling
- Edge cases and boundary conditions
- User flow completeness (happy path + error paths)
- Data persistence and retrieval
- Authentication/authorization checks
- Form submission behavior
- Pagination and infinite scroll (if applicable)
- Search and filter functionality
- Sorting behavior
- CRUD operations completeness
- Undo/redo functionality (if applicable)
- Concurrent user scenarios
- Performance under load
- Browser compatibility
- Offline behavior (if applicable)

### 3. Testing with Playwright MCP

Once implementation is complete, use Playwright MCP to rigorously test against both checklists:

1. Navigate through every screen and component
2. Systematically verify each item in the UI/UX checklist
3. Execute test scenarios from the QA checklist
4. Document any failures and fix them
5. Re-test until all checklist items pass
6. Only mark the feature complete when 100% of checklist items are verified

**File Structure Example:**

```
docs/
├── calendar/
│   ├── calendar-feat.md
│   ├── calendar-ui-checklist.md
│   └── calendar-qa-checklist.md
├── subscriptions/
│   ├── subscriptions-feat.md
│   ├── subscriptions-ui-checklist.md
│   └── subscriptions-qa-checklist.md
```

## MCP Tools

### Playwright

Use Playwright MCP for browser automation and testing:

- Visual testing and verification of UI changes
- E2E testing workflows
- Debugging UI issues by taking snapshots and screenshots
- Interacting with the running app (click, type, navigate)

**CRITICAL - Prevent Empty Tabs:**

- NEVER use `browser_close` followed by `browser_navigate` - this creates empty `about:blank` tabs
- When browser errors occur, use `browser_tabs` with `action: "list"` to check tab state first
- To refresh a page, use `browser_navigate` to the same URL (it reuses the current tab)
- Only close tabs explicitly with `browser_tabs` action `close` when needed
- If you see "Browser is already in use" error, wait and retry instead of closing

**Required Testing Workflow for New Components/Pages:**
When creating new components or pages, you MUST:

1. Open the browser using Playwright after implementation
2. Perform rigorous testing to verify UI matches expectations
3. Test all interactive elements (buttons, forms, modals, etc.)
4. Verify all logic runs correctly (state changes, data flow, etc.)
5. Make iterations to fix any issues discovered
6. Only consider the task complete after verifying everything works in the browser

### Context7

Use Context7 MCP to fetch up-to-date documentation:

- Look up TanStack Router/Start docs for routing questions
- Fetch shadcn/ui component documentation and examples
- Get latest Tailwind CSS 4 syntax and utilities
- Reference Radix UI primitive APIs

Always prefer Context7 over outdated training data when implementing features with these libraries.

### Supabase

After making any database changes (migrations, RLS policies, functions, triggers), you MUST:

1. Open the Supabase local console at `http://localhost:64323/project/default`
2. Navigate to **Advisors > Security Advisor**
3. Check all tabs: Errors, Warnings, and Info
4. Fix all issues until you have **0 errors, 0 warnings, 0 suggestions**
5. Navigate to **Advisors > Performance Advisor** and repeat the process
6. Create a migration file to persist any fixes made via the SQL Editor

**Common fixes:**

- **Function Search Path Mutable**: Add `SET search_path = ''` to function definitions
- **Auth RLS Initialization Plan**: Change `auth.uid()` to `(SELECT auth.uid())` in RLS policies for better performance

## Supabase Edge Functions

Edge Functions live in `supabase/functions/` and run on Deno runtime.

### Development Setup

VS Code is configured with Deno support for edge functions (see `.vscode/settings.json`). The Deno extension activates only for files in `supabase/functions/`.

### Creating Edge Functions

```bash
supabase functions new <function-name>
```

### Cron Jobs

Cron jobs are configured in `supabase/config.toml` and call edge functions via HTTP:

```toml
[functions.process-subscription-payments]
enabled = true

[[analytics.cron]]
name = "process-subscription-payments"
schedule = "0 0 * * *"  # Daily at midnight
command = "SELECT net.http_post(...)"
```

**Security:** Always validate the `Authorization` header in cron job handlers:

```typescript
const authHeader = req.headers.get('Authorization')
if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
  return new Response('Unauthorized', { status: 401 })
}
```

## Claude Code Customization

### Custom Agents

Custom agents live in `.claude/agents/` and extend Claude Code's capabilities:

- `code-reviewer.md` - Expert code review agent
- `design-review.md` - UI/UX design review agent
- `qa-expert.md` - Quality assurance testing agent

### Custom Commands (Slash Commands)

Custom slash commands live in `.claude/commands/`:

- `/smart-commit` - Analyze changes and create focused atomic commits
- `/code-review` - Review code changes against a remote branch
- `/update-claude-md` - Update CLAUDE.md based on recent git changes

**Creating a new command:**

```markdown
---
description: Short description of the command
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Command Name

Instructions for the command...
```

## Security Patterns

### URL Sanitization

Always sanitize user-provided URLs to prevent XSS attacks:

```tsx
import { sanitizeUrl } from '@/lib/subscriptions/utils'

// Returns sanitized URL or empty string if invalid
const safeUrl = sanitizeUrl(userInput)
```

### Input Validation

Use strict TypeScript types for data from external sources:

```tsx
// Define strict literal types
type Currency = 'VND' | 'USD'
type BillingType = 'monthly' | 'yearly'

// Validate at API boundary
function validateCurrency(value: string): Currency {
  if (value !== 'VND' && value !== 'USD') {
    throw new Error('Invalid currency')
  }
  return value
}
```

## Dependency Management

- **Always confirm with the user before installing new dependencies** - Do not run `pnpm add`, `pnpm install <package>`, or similar commands without explicit user approval first.

## Code Style

- No semicolons
- Single quotes
- Trailing commas on all
- Strict TypeScript with no unused locals/parameters

## Code Cleanup

**After making changes to any file or adding a new file, you MUST:**

1. Review the file for unused variables, imports, and parameters
2. Remove any unused code artifacts immediately
3. Run `pnpm lint` to verify no unused variables remain
4. Fix any lint errors related to unused code before considering the task complete

**This applies to:**

- Unused imports (including removed component imports)
- Unused local variables and constants
- Unused function parameters (prefix with `_` only if intentionally unused)
- Unused type definitions
- Dead code from refactoring

**Never leave unused code in the codebase** - clean as you go.

## Git Commit Convention

### Pre-Commit Cleanup

- **Before committing, delete all images inside `.playwright-mcp/`** - Remove any screenshots or image files generated by Playwright MCP before staging changes.

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring (no feature or bug fix)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependency changes
- `ci`: CI/CD configuration changes
- `chore`: Maintenance tasks (e.g., updating dependencies)

### Rules

- Use lowercase for type and description
- Keep the subject line under 72 characters
- Use imperative mood ("add feature" not "added feature")
- Scope is optional but recommended (e.g., `feat(auth):`, `fix(ui):`)
- Add `!` after type/scope for breaking changes: `feat!:` or `feat(api)!:`

### Examples

```bash
feat(dashboard): add transaction summary widget
fix(auth): resolve token refresh race condition
docs: update README with setup instructions
refactor(components): extract shared button styles
chore(deps): upgrade TanStack Router to v1.95
feat(api)!: change response format for transactions endpoint
```

## Features

### Calendar (Transaction Tracking)

The calendar page (`/calendar`) displays daily income/expenses with:

- Monthly calendar view with transaction summaries per day
- Add/edit/delete transactions via modals
- Tag management for categorizing transactions
- Income (green) and expense (red) color coding

### Subscriptions

The subscriptions page (`/subscriptions`) tracks recurring payments:

**Components:** `src/components/subscriptions/`

- `add-subscription-modal.tsx` - Create new subscriptions
- `edit-subscription-modal.tsx` - Edit/delete subscriptions
- `subscriptions-table.tsx` - Display all subscriptions
- `subscription-summary-cards.tsx` - Monthly/yearly totals with exchange rate

**Data Layer:** `src/lib/subscriptions/`

- `types.ts` - TypeScript interfaces (Subscription, Currency, BillingType)
- `utils.ts` - Formatting, calculations, URL sanitization

**Exchange Rate Integration:**

```tsx
import { useExchangeRate } from '@/lib/hooks/use-exchange-rate'

const { data: rate, isLoading } = useExchangeRate()
// Converts USD subscriptions to VND for total calculations
```

**Automated Payment Processing:**

- Cron job runs daily to process due subscriptions
- Creates expense transactions automatically
- Edge function: `supabase/functions/process-subscription-payments/`

## Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── subscriptions/      # Subscription feature components
│   ├── app-sidebar.tsx     # Main navigation
│   └── *.tsx               # Shared components
├── lib/
│   ├── api/                # Supabase API functions
│   ├── hooks/              # TanStack Query hooks
│   ├── subscriptions/      # Subscription types/utils
│   └── *.ts                # Shared utilities
├── routes/
│   ├── _authenticated/     # Protected routes
│   │   ├── calendar.tsx
│   │   ├── subscriptions.tsx
│   │   └── index.tsx
│   ├── login.tsx
│   └── __root.tsx
└── types/
    └── database.ts         # Supabase generated types

supabase/
├── functions/              # Edge Functions (Deno)
├── migrations/             # Database migrations
└── config.toml             # Supabase configuration

docs/
├── calendar/               # Calendar feature docs
└── subscriptions/          # Subscriptions feature docs

.claude/
├── agents/                 # Custom Claude Code agents
└── commands/               # Custom slash commands
```

## Recent Updates (2026-01-01)

### Subscriptions Feature (Complete)

- Full CRUD for subscription tracking
- Support for VND and USD currencies
- Monthly/yearly billing cycles
- Exchange rate API integration (USD to VND)
- Automated payment processing via cron jobs

### Security Improvements

- URL sanitization to prevent XSS attacks
- Authorization token validation in edge functions
- Stricter TypeScript types for currency and billing fields

### Developer Experience

- Added custom Claude Code agents and slash commands
- VS Code Deno extension configured for edge functions
- Feature documentation workflow with checklists
