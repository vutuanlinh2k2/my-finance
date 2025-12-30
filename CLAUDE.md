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

**Stack**: TanStack Start (full-stack React framework) + shadcn/ui + TailwindCSS 4 + Vite

### File-Based Routing

- Routes live in `src/routes/` and are auto-generated into `src/routeTree.gen.ts`
- **Never edit `routeTree.gen.ts`** - it regenerates automatically when route files change
- `__root.tsx` is the root layout shell (HTML structure, devtools, global head)
- Route components export a `Route` object created with `createFileRoute()`

### Component System

- UI components in `src/components/ui/` follow shadcn/ui patterns
- Uses Radix UI primitives under the hood
- Icons from `@phosphor-icons/react`
- Component variants managed with CVA (Class Variance Authority)

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
