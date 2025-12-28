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
