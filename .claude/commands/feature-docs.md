---
description: Create feature documentation with spec, checklists, and implementation progress tracker
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Task, TodoWrite, AskUserQuestion
---

# Feature Documentation Workflow

Generate comprehensive feature documentation including:
- Feature specification (`<feature>-feat.md`)
- UI/UX testing checklist (`<feature>-ui-checklist.md`)
- QA/Logic testing checklist (`<feature>-qa-checklist.md`)
- Step-by-step implementation progress tracker (`<feature>-progress.md`)

## Arguments

- `$ARGUMENTS`: Feature brain dump (required). This should include:
  - Feature name (will be extracted for folder/file naming)
  - Detailed description of what you want
  - User stories and use cases
  - Technical requirements
  - UI/UX ideas
  - Any constraints or considerations
  - References to existing features or patterns

**Example brain dump:**
```
reports feature - I want a page where users can see spending reports and analytics.
Should show monthly spending breakdown by category/tag, income vs expense comparison,
spending trends over time (line chart), top spending categories (pie chart).
Users should be able to filter by date range (this month, last 3 months, this year, custom).
Export to PDF would be nice. Should integrate with existing transactions data.
Similar to the calendar page but focused on analytics. Use recharts for charts.
Mobile should show simplified charts. Need empty state for new users with no data.
```

## Phase 1: Validate and Setup

### 1.1 Parse Brain Dump

Extract from `$ARGUMENTS`:

1. **Feature name**: Identify the feature name for folder/file naming (use kebab-case)
   - Look for patterns like "X feature", "X page", or the first noun
   - Examples: "reports feature" → `reports`, "user settings page" → `user-settings`

2. **Key requirements**: Extract all mentioned requirements, features, and ideas

3. **Technical details**: Note any mentioned technologies, integrations, or patterns

4. **UI/UX notes**: Capture any visual or interaction requirements

If the brain dump is unclear or missing a feature name, ask the user:

```
I couldn't identify a clear feature name from your input.
What should I name this feature? (e.g., "reports", "notifications", "user-settings")
```

### 1.2 Deep Analysis & Clarification

Before proceeding, thoroughly analyze the brain dump to identify:

#### 1.2.1 Potential Issues & Concerns

Look for:
- **Conflicting requirements**: Ideas that may contradict each other
- **Scope creep risks**: Features that could balloon in complexity
- **Technical challenges**: Difficult implementations that need discussion
- **Missing pieces**: Important aspects the user may have overlooked
- **Ambiguous terms**: Words that could mean different things
- **Dependencies**: Features that require other features to exist first

#### 1.2.2 Questions to Clarify

Ask about:
- **Priority**: Which features are must-have vs nice-to-have?
- **Scope boundaries**: What's explicitly out of scope for v1?
- **User flows**: How should the user navigate/interact?
- **Data sources**: Where does the data come from? Existing tables or new?
- **Edge cases**: What happens when X is empty/large/invalid?
- **Design preferences**: Any specific UI patterns or references?

#### 1.2.3 Present Analysis

Before generating documentation, present findings to the user:

```
📋 Brain Dump Analysis

## What I Understood:
- [Summary of main feature goals]
- [Key requirements extracted]
- [Technical approach inferred]

## Concerns & Potential Issues:
⚠️ [Issue 1]: [Description and why it matters]
⚠️ [Issue 2]: [Description and why it matters]

## Questions for Clarification:
1. [Question about priority/scope]
2. [Question about ambiguous requirement]
3. [Question about technical approach]

## Assumptions I'm Making:
- [Assumption 1] - Let me know if this is wrong
- [Assumption 2] - Let me know if this is wrong

Would you like to address these before I generate the documentation?
Or should I proceed with my assumptions and you can refine later?
```

**Wait for user response** before proceeding to Phase 2.

This step is CRITICAL - don't skip it. Taking time to clarify upfront saves significant rework later.

### 1.3 Check Existing Documentation

Check if documentation already exists for this feature:

```bash
ls -la docs/<feature-name>/ 2>/dev/null
```

If docs exist, ask the user whether to:
- Overwrite existing documentation
- Update/append to existing documentation
- Cancel the operation

### 1.4 Create Documentation Folder

Create the feature documentation folder if it doesn't exist:

```bash
mkdir -p docs/<feature-name>
```

## Phase 2: Gather Feature Context

### 2.1 Explore Existing Implementation

Search for existing code related to this feature:

1. **Routes**: Check for existing route files
   ```bash
   find src/routes -name "*<feature-name>*" -type f
   ```

2. **Components**: Check for feature components
   ```bash
   find src/components -type d -name "*<feature-name>*"
   ```

3. **API/Hooks**: Check for data layer files
   ```bash
   find src/lib -name "*<feature-name>*" -type f
   ```

4. **Types**: Check for type definitions
   ```bash
   grep -r "<feature-name>" src/types/ --include="*.ts"
   ```

### 2.2 Read Existing Code (if found)

If relevant files exist, read them to understand:
- Current implementation status
- Data models and types
- API endpoints
- Component structure

## Phase 3: Create Feature Specification

### 3.1 Generate Feature Spec Template

Create `docs/<feature-name>/<feature-name>-feat.md` with the following structure:

```markdown
# <Feature Name> Feature Specification

## Overview

Brief description of the feature and its purpose.

## User Stories

- As a user, I want to...
- As a user, I need to...

## Functional Requirements

### FR-1: [Requirement Name]
- Description
- Acceptance criteria

### FR-2: [Requirement Name]
- Description
- Acceptance criteria

## Data Models

### [Model Name]
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| ... | ... | ... |

## API Endpoints (if applicable)

### GET /api/<feature>
- Description
- Request params
- Response format

### POST /api/<feature>
- Description
- Request body
- Response format

## UI Components

### [Component Name]
- Purpose
- Props
- States (loading, error, empty, success)

## State Management

- Query keys used
- Mutations
- Optimistic updates

## Edge Cases

- [ ] Empty state handling
- [ ] Error state handling
- [ ] Loading state handling
- [ ] Validation errors
- [ ] Network failures

## Security Considerations

- Input validation
- Authorization checks
- Data sanitization

## Dependencies

- External libraries needed
- Internal modules used
```

### 3.2 Pre-fill from Brain Dump

Use the parsed brain dump from Phase 1 to populate the specification:

1. **Overview**: Synthesize the user's description into a clear feature overview
2. **User Stories**: Convert mentioned use cases into proper user story format
3. **Functional Requirements**: Extract and organize all mentioned features
4. **Data Models**: Infer data structures from mentioned entities
5. **UI Components**: List components mentioned or implied
6. **Technical Notes**: Include mentioned technologies, patterns, integrations

**Example transformation:**

Brain dump input:
> "monthly spending breakdown by category/tag, income vs expense comparison"

Becomes:
```markdown
### FR-1: Monthly Spending Breakdown
- Display spending grouped by category/tag
- Show amounts in VND with formatCompact()
- Acceptance: User can see which categories have highest spending

### FR-2: Income vs Expense Comparison
- Show total income and total expenses side by side
- Calculate and display the difference (savings/deficit)
- Acceptance: User can quickly see if they saved or overspent
```

### 3.3 Enrich with Code Context

If existing code was found in Phase 2, merge that information:
- Add discovered data models and types
- Include existing component structures
- Note current implementation patterns

### 3.4 Review Prompt

After generating the specification, briefly summarize what was extracted:

```
📝 Feature Specification Generated

Extracted from your brain dump:
- 8 functional requirements
- 4 UI components identified
- 2 integrations needed (transactions, tags)
- 3 chart types (line, pie, bar)

The spec has been written to docs/<feature-name>/<feature-name>-feat.md

Would you like to review it before I generate the checklists?
```

## Phase 4: Generate UI/UX Checklist

Use the `design-review` sub-agent (via Task tool) to generate the UI/UX checklist.

Prompt for the design-review agent:

```
Based on the feature specification for "<feature-name>", create a comprehensive UI/UX testing checklist.

## User's Original Brain Dump:
<include the original $ARGUMENTS brain dump>

## Feature Specification:
<include feature spec content>

## Instructions:

Generate a checklist file at docs/<feature-name>/<feature-name>-ui-checklist.md with the following categories:

1. Visual Consistency
   - [ ] Follows design system patterns (shadcn/ui)
   - [ ] Consistent spacing and typography
   - [ ] Correct color usage (OKLCH color space)
   - [ ] Icon usage from @phosphor-icons/react

2. Responsive Design
   - [ ] Mobile viewport (< 640px)
   - [ ] Tablet viewport (640px - 1024px)
   - [ ] Desktop viewport (> 1024px)

3. Interactive States
   - [ ] Hover states
   - [ ] Focus states (keyboard navigation)
   - [ ] Active/pressed states
   - [ ] Disabled states

4. Loading States
   - [ ] Skeleton screens for initial load
   - [ ] Loading spinners for actions
   - [ ] Progressive loading for large data

5. Empty States
   - [ ] No data placeholder
   - [ ] First-time user experience
   - [ ] Search with no results

6. Error States
   - [ ] Form validation errors
   - [ ] API error messages
   - [ ] Network failure handling

7. Accessibility
   - [ ] ARIA labels and roles
   - [ ] Keyboard navigation
   - [ ] Focus management
   - [ ] Screen reader compatibility
   - [ ] Color contrast ratios

8. Animations & Transitions
   - [ ] Smooth transitions
   - [ ] Loading animations
   - [ ] Modal open/close animations
   - [ ] Reduced motion preference

9. Forms (if applicable)
   - [ ] Field labels and placeholders
   - [ ] Required field indicators
   - [ ] Inline validation feedback
   - [ ] Submit button states

10. Dark Mode
    - [ ] All components support dark theme
    - [ ] Proper contrast in dark mode
    - [ ] No hard-coded colors

11. Feature-Specific Items
    Based on the brain dump, add specific checklist items. Examples:
    - If charts mentioned: "Charts render correctly", "Chart legends readable", "Chart tooltips work"
    - If filters mentioned: "Filter dropdowns work", "Date picker functions", "Filters persist on reload"
    - If export mentioned: "Export button visible", "PDF generates correctly", "Downloaded file opens"
    - If mobile mentioned: "Simplified mobile layout", "Touch interactions work", "Charts scale properly"
```

**Important**: Customize the checklist based on what the user mentioned in their brain dump.
Don't include irrelevant sections (e.g., skip "Forms" if no forms are needed).

Write the generated checklist to `docs/<feature-name>/<feature-name>-ui-checklist.md`.

## Phase 5: Generate QA Checklist

Use the `qa-expert` sub-agent (via Task tool) to generate the QA/Logic checklist.

Prompt for the qa-expert agent:

```
Based on the feature specification for "<feature-name>", create a comprehensive QA testing checklist.

## User's Original Brain Dump:
<include the original $ARGUMENTS brain dump>

## Feature Specification:
<include feature spec content>

## Instructions:

Generate a checklist file at docs/<feature-name>/<feature-name>-qa-checklist.md with the following categories:

1. Functional Requirements
   - [ ] Each requirement from the spec works as expected
   - [ ] All user stories are satisfied

2. Data Validation
   - [ ] Required fields enforcement
   - [ ] Input type validation
   - [ ] Boundary conditions (min/max values)
   - [ ] Format validation (email, phone, URL, etc.)

3. CRUD Operations
   - [ ] Create: New items are persisted correctly
   - [ ] Read: Data loads correctly from database
   - [ ] Update: Changes are saved and reflected
   - [ ] Delete: Items are removed with proper confirmation

4. State Management
   - [ ] TanStack Query cache invalidation
   - [ ] Optimistic updates work correctly
   - [ ] Error rollback functions properly
   - [ ] Loading states transition correctly

5. API Integration
   - [ ] Successful API calls
   - [ ] Error handling (400, 401, 403, 404, 500)
   - [ ] Network timeout handling
   - [ ] Retry logic (if applicable)

6. User Flows
   - [ ] Happy path completion
   - [ ] Error path recovery
   - [ ] Cancel/back navigation
   - [ ] Multi-step flows maintain state

7. Authentication & Authorization
   - [ ] Protected routes require login
   - [ ] User can only access their own data
   - [ ] Proper error for unauthorized actions

8. Edge Cases
   - [ ] Empty data sets
   - [ ] Very large data sets
   - [ ] Special characters in input
   - [ ] Concurrent modifications
   - [ ] Rapid repeated actions

9. Currency Handling (if applicable)
   - [ ] formatCompact() used for display
   - [ ] formatCurrency() used for tooltips
   - [ ] Correct +/- prefixes for income/expense
   - [ ] VND/USD handling correct

10. Database Integrity
    - [ ] Foreign key relationships maintained
    - [ ] Cascade deletes work correctly
    - [ ] Timestamps updated appropriately

11. Performance
    - [ ] Page loads within acceptable time
    - [ ] No unnecessary re-renders
    - [ ] Proper pagination/virtualization

12. Feature-Specific Items
    Based on the brain dump, add specific test cases. Examples:
    - If charts: "Chart data matches transaction totals", "Chart updates when data changes", "Large datasets don't crash"
    - If filters: "Date range filters correct data", "Multiple filters combine correctly", "Reset clears all filters"
    - If export: "Exported PDF contains all data", "Export handles large datasets", "Filename includes date"
    - If integrations: "Data syncs with transactions", "Tags display correctly", "Cross-navigation works"
```

**Important**: Customize the checklist based on what the user mentioned in their brain dump.
Add specific test cases for each feature mentioned. Skip irrelevant sections.

Write the generated checklist to `docs/<feature-name>/<feature-name>-qa-checklist.md`.

## Phase 6: Generate Implementation Progress Tracker

Based on all gathered information from previous phases (feature spec, UI checklist, QA checklist), create a comprehensive implementation progress file.

### 6.1 Analyze Feature Complexity

Determine the implementation phases based on:
- **Data requirements**: Does it need database tables? API endpoints?
- **UI complexity**: How many components? Forms? Modals?
- **External dependencies**: Third-party APIs? New libraries?
- **Integration points**: Does it connect to existing features?

### 6.2 Generate Progress File

Create `docs/<feature-name>/<feature-name>-progress.md` with the following structure:

```markdown
# <Feature Name> Feature - Implementation Progress

## Overview

| Phase   | Description                     | Status  |
| ------- | ------------------------------- | ------- |
| Phase 1 | UI + Mock Data                  | Pending |
| Phase 2 | Database & API Layer            | Pending |
| Phase 3 | Integration & State Management  | Pending |
| Phase 4 | Testing & Polish                | Pending |

---

## Phase 1: UI with Mock Data

### Goal

Build all UI components with hardcoded/mock data to validate the design and user experience before integrating with the backend.

### Summary

[To be filled during implementation]

### Success Criteria

- [ ] All UI components render correctly
- [ ] Mock data displays properly in all states
- [ ] Forms accept input and validate locally
- [ ] Modals open/close correctly
- [ ] Responsive design works across viewports
- [ ] Loading, empty, and error states implemented

### Implementation Steps

#### Step 1: Route & Page Setup

- [ ] Create route file at `src/routes/_authenticated/<feature-name>.tsx`
- [ ] Add navigation link to sidebar
- [ ] Create basic page layout

#### Step 2: Type Definitions

- [ ] Create `src/lib/<feature-name>/types.ts`
- [ ] Define all TypeScript interfaces
- [ ] Add type exports

#### Step 3: Mock Data

- [ ] Create `src/lib/<feature-name>/mock-data.ts`
- [ ] Generate realistic sample data
- [ ] Include edge cases (empty, many items, etc.)

#### Step 4: UI Components

- [ ] Create `src/components/<feature-name>/` directory
- [ ] Implement main display component(s)
- [ ] Implement form/modal component(s)
- [ ] Implement summary/stats component(s) if applicable
- [ ] Add loading skeletons
- [ ] Add empty state placeholders

#### Step 5: Local State Management

- [ ] Implement useState/useReducer for local state
- [ ] Wire up form submissions (local only)
- [ ] Implement CRUD operations with mock data

#### Step 6: Visual Testing

- [ ] Test in browser with Playwright MCP
- [ ] Verify all interactive elements work
- [ ] Check responsive design
- [ ] Verify accessibility basics

### Files Created/Modified

| Action  | File                                           |
| ------- | ---------------------------------------------- |
| Created | `src/routes/_authenticated/<feature-name>.tsx` |
| Created | `src/lib/<feature-name>/types.ts`              |
| Created | `src/lib/<feature-name>/mock-data.ts`          |
| Created | `src/components/<feature-name>/*.tsx`          |
| Modified| `src/components/app-sidebar.tsx`               |

---

## Phase 2: Database & API Layer

### Goal

Replace mock data with real Supabase database persistence.

### Summary

[To be filled during implementation]

### Success Criteria

- [ ] Database table(s) created with proper schema
- [ ] RLS policies enforce user data isolation
- [ ] API functions handle all CRUD operations
- [ ] Data persists across browser sessions
- [ ] Security Advisor shows 0 errors/warnings
- [ ] Performance Advisor shows 0 errors/warnings

### Implementation Steps

#### Step 1: Database Migration

- [ ] Create migration file `supabase/migrations/<timestamp>_create_<feature>_table.sql`
- [ ] Define table schema with proper types and constraints
- [ ] Add RLS policies for user isolation
- [ ] Add indexes for common queries
- [ ] Run `pnpm db:migrate`
- [ ] Regenerate types with `pnpm db:types`

**Schema:**
```sql
-- Define your table schema here
CREATE TABLE public.<feature_name> (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Add other columns...
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.<feature_name> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "<feature>_select_own"
  ON public.<feature_name> FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "<feature>_insert_own"
  ON public.<feature_name> FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "<feature>_update_own"
  ON public.<feature_name> FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "<feature>_delete_own"
  ON public.<feature_name> FOR DELETE
  USING (user_id = (SELECT auth.uid()));
```

#### Step 2: API Layer

- [ ] Create `src/lib/api/<feature-name>.ts`
- [ ] Implement `fetch<Feature>()` function
- [ ] Implement `create<Feature>()` function
- [ ] Implement `update<Feature>()` function
- [ ] Implement `delete<Feature>()` function

#### Step 3: React Query Hooks

- [ ] Add query keys to `src/lib/query-keys.ts`
- [ ] Create `src/lib/hooks/use-<feature-name>.ts`
- [ ] Implement `use<Feature>()` query hook
- [ ] Implement `useCreate<Feature>()` mutation hook
- [ ] Implement `useUpdate<Feature>()` mutation hook
- [ ] Implement `useDelete<Feature>()` mutation hook

#### Step 4: Update UI Components

- [ ] Replace mock data with real hooks
- [ ] Add loading states during data fetching
- [ ] Add error handling with toast notifications
- [ ] Implement optimistic updates if applicable

#### Step 5: Cleanup

- [ ] Delete mock data file
- [ ] Update type imports
- [ ] Remove unused code

#### Step 6: Security Check

- [ ] Open Supabase console at `http://localhost:64323`
- [ ] Check Security Advisor (0 errors, 0 warnings)
- [ ] Check Performance Advisor (0 errors, 0 warnings)
- [ ] Create migration for any fixes

### Files Created/Modified

| Action   | File                                              |
| -------- | ------------------------------------------------- |
| Created  | `supabase/migrations/<timestamp>_<feature>.sql`   |
| Created  | `src/lib/api/<feature-name>.ts`                   |
| Created  | `src/lib/hooks/use-<feature-name>.ts`             |
| Modified | `src/lib/query-keys.ts`                           |
| Modified | `src/routes/_authenticated/<feature-name>.tsx`    |
| Modified | `src/components/<feature-name>/*.tsx`             |
| Deleted  | `src/lib/<feature-name>/mock-data.ts`             |

---

## Phase 3: Integration & Advanced Features

### Goal

Add integrations, advanced features, and edge case handling.

### Summary

[To be filled during implementation]

### Success Criteria

- [ ] All integrations with other features working
- [ ] Edge cases handled gracefully
- [ ] Performance optimized
- [ ] All functional requirements met

### Implementation Steps

#### Step 1: Feature Integrations

- [ ] Connect to related features (if applicable)
- [ ] Implement cross-feature data flows
- [ ] Add navigation between related features

#### Step 2: Advanced Features

- [ ] Implement sorting/filtering (if applicable)
- [ ] Add search functionality (if applicable)
- [ ] Implement pagination/virtualization for large data
- [ ] Add export/import capabilities (if applicable)

#### Step 3: Edge Cases

- [ ] Handle empty states with helpful messages
- [ ] Handle error states with retry options
- [ ] Handle network failures gracefully
- [ ] Add input validation with clear error messages

#### Step 4: Performance Optimization

- [ ] Implement query caching strategies
- [ ] Add loading state optimizations
- [ ] Minimize unnecessary re-renders
- [ ] Add optimistic updates where appropriate

### Files Created/Modified

| Action   | File                           |
| -------- | ------------------------------ |
| Modified | [List files as you work]       |

---

## Phase 4: Testing & Polish

### Goal

Comprehensive testing against UI and QA checklists, bug fixes, and final polish.

### Summary

[To be filled during implementation]

### Success Criteria

- [ ] All UI checklist items pass
- [ ] All QA checklist items pass
- [ ] No console errors or warnings
- [ ] Accessibility requirements met
- [ ] Performance acceptable

### Implementation Steps

#### Step 1: UI/UX Testing

- [ ] Run through `<feature-name>-ui-checklist.md`
- [ ] Fix all visual issues discovered
- [ ] Test responsive design on all viewports
- [ ] Verify dark mode compatibility

#### Step 2: Functional Testing

- [ ] Run through `<feature-name>-qa-checklist.md`
- [ ] Test all CRUD operations
- [ ] Test error scenarios
- [ ] Verify data persistence

#### Step 3: Accessibility Testing

- [ ] Test keyboard navigation
- [ ] Verify screen reader compatibility
- [ ] Check color contrast ratios
- [ ] Add missing ARIA labels

#### Step 4: Final Polish

- [ ] Fix any remaining bugs
- [ ] Improve error messages
- [ ] Add helpful tooltips
- [ ] Polish animations/transitions

#### Step 5: Documentation

- [ ] Update progress file with completion notes
- [ ] Mark all checklist items as complete
- [ ] Document any known issues or future improvements

### Files Created/Modified

| Action   | File                           |
| -------- | ------------------------------ |
| Modified | [List files as you work]       |

---

## Dependencies Diagram

```
Phase 1 (UI + Mock Data)
    │
    ▼
Phase 2 (Database & API)
    │
    ▼
Phase 3 (Integration & Features)
    │
    ▼
Phase 4 (Testing & Polish)
    │
    ▼
Feature Complete ✅
```

---

## Notes

### Architecture Decisions

[Document any significant architectural decisions made during implementation]

### Known Issues

[Track any known issues or limitations]

### Future Improvements

[Ideas for future enhancements]
```

### 6.3 Customize Progress Template from Brain Dump

Based on the user's brain dump and feature specification, heavily customize the progress file:

1. **Adjust phases** - Add/remove/reorder phases based on feature complexity
   - Simple feature: May only need 2-3 phases
   - Complex feature: May need 5+ phases with sub-phases
   - External API: Add dedicated "API Integration" phase
   - Charts/visualizations: Add dedicated "Data Visualization" phase

2. **Customize implementation steps** - Replace generic steps with specific ones from brain dump
   - If user mentioned "recharts": Add specific recharts setup steps
   - If user mentioned "export to PDF": Add PDF generation steps
   - If user mentioned specific filters: List each filter as a step

3. **Add feature-specific phases** - Examples:
   ```markdown
   ## Phase 3: Charts & Visualization
   - [ ] Install recharts library
   - [ ] Create SpendingTrendChart component
   - [ ] Create CategoryPieChart component
   - [ ] Implement chart data transformations
   - [ ] Add chart loading states
   - [ ] Test with various data sizes
   ```

4. **Include mentioned integrations** - Add steps for each integration:
   - If "integrates with transactions": Add transaction data fetching steps
   - If "similar to calendar page": Reference calendar patterns

5. **Add architecture diagrams** - Create ASCII diagrams for:
   - Data flow (API → Transform → Charts)
   - Component hierarchy
   - State management flow

**Example customization for a "reports" feature:**

```markdown
| Phase   | Description                     | Status  |
| ------- | ------------------------------- | ------- |
| Phase 1 | Page Layout + Mock Data         | Pending |
| Phase 2 | Chart Components (recharts)     | Pending |
| Phase 3 | Data Layer (fetch transactions) | Pending |
| Phase 4 | Filters & Date Ranges           | Pending |
| Phase 5 | PDF Export                      | Pending |
| Phase 6 | Testing & Polish                | Pending |
```

## Phase 7: Summary and Next Steps

### 7.1 Display Created Files

Show the user what was created:

```
✅ Feature Documentation Created

📁 docs/<feature-name>/
├── <feature-name>-feat.md         # Feature specification
├── <feature-name>-ui-checklist.md  # UI/UX testing checklist
├── <feature-name>-qa-checklist.md  # QA/Logic testing checklist
└── <feature-name>-progress.md      # Implementation progress tracker
```

### 7.2 Next Steps Instructions

Provide the user with next steps:

```
## Next Steps

1. **Review & Complete Specification**
   Edit docs/<feature-name>/<feature-name>-feat.md to add any missing details.

2. **Review Progress Tracker**
   Customize docs/<feature-name>/<feature-name>-progress.md phases and steps
   to match your specific implementation plan.

3. **Implement Phase by Phase**
   Follow the progress tracker, marking items complete as you go:
   - Start with Phase 1 (UI + Mock Data)
   - Move to Phase 2 (Database & API) after UI is validated
   - Continue through remaining phases

4. **Track Progress**
   Update the progress file as you work:
   - Mark checkboxes [x] when complete
   - Add files to the "Files Created/Modified" tables
   - Fill in "Summary" sections with implementation notes

5. **Test with Playwright**
   After each phase, use Playwright MCP to verify:
   ```
   1. Start dev server: pnpm dev
   2. Navigate to http://localhost:3000/<feature-route>
   3. Test against relevant checklist items
   4. Fix issues before moving to next phase
   ```

6. **Final Verification**
   In Phase 4, systematically verify both checklists:
   - Complete all UI checklist items
   - Complete all QA checklist items
   - Only mark feature complete when 100% pass
```

## Rules

1. **Always analyze the brain dump first** - Present concerns, questions, and assumptions BEFORE generating any files. This is the most important step.
2. **Wait for user clarification** - Don't proceed to documentation generation until the user has addressed your questions or confirmed your assumptions.
3. **Always use kebab-case** for folder and file names (e.g., `user-settings`, not `userSettings`)
4. **Never overwrite without asking** - Confirm before replacing existing files
5. **Pre-fill when possible** - Use discovered code to populate specifications
6. **Be comprehensive** - Include all relevant checklist items for the feature type
7. **Context-aware checklists** - Customize checklists based on feature requirements (e.g., skip currency checks for non-financial features)
8. **Follow project patterns** - Reference existing code patterns from CLAUDE.md
9. **Think critically** - Identify potential issues the user may not have considered (performance, security, edge cases, scope creep)

## Example Usage

```bash
/feature-docs reports
/feature-docs user-settings
/feature-docs notifications
```

## Example Output

```
🚀 Feature Documentation Workflow

Feature: reports
Status: New feature (no existing docs)

📋 Phase 1: Parse & Analyze Brain Dump

## What I Understood:
- Reports page for spending analytics and insights
- Charts: spending trends (line), category breakdown (pie), income vs expense
- Date range filters: this month, 3 months, year, custom
- PDF export functionality
- Integrates with existing transactions data
- Responsive design with simplified mobile charts

## Concerns & Potential Issues:
⚠️ Chart library choice: You mentioned recharts - this adds ~45KB to bundle.
   Consider if lightweight alternatives (e.g., chart.js) would work.

⚠️ PDF export complexity: Client-side PDF generation can be tricky with charts.
   May need html2canvas + jsPDF or a server-side solution.

⚠️ Performance with large datasets: If user has years of transactions,
   chart rendering could be slow. May need data aggregation/sampling.

## Questions for Clarification:
1. For the date range filter, should "custom" allow any date range, or limit
   to the last 2 years? (affects query complexity)

2. Should the PDF include all charts, or let user select which to export?

3. For mobile "simplified charts" - do you mean smaller charts, or different
   chart types (e.g., bar instead of pie)?

## Assumptions I'm Making:
- Data comes from existing `transactions` table (no new tables needed)
- Charts will use the same tag/category system as calendar
- VND is the primary display currency (USD converted)

Would you like to address these before I generate the documentation?

---
[User responds with clarifications]
---

📋 Phase 2: Setup
✅ Created docs/reports/

📋 Phase 3: Context Gathering
Found existing files:
- src/routes/_authenticated/reports.tsx
- src/components/reports/report-card.tsx
Reading files to understand current implementation...

📋 Phase 4: Feature Specification
✅ Created docs/reports/reports-feat.md
   Pre-filled with discovered routes, components, and your clarifications

📋 Phase 5: UI/UX Checklist
✅ Created docs/reports/reports-ui-checklist.md
   Generated 52 checklist items (including chart-specific and filter-specific items)

📋 Phase 6: QA Checklist
✅ Created docs/reports/reports-qa-checklist.md
   Generated 44 checklist items (including PDF export and data aggregation tests)

📋 Phase 7: Implementation Progress Tracker
✅ Created docs/reports/reports-progress.md
   Generated 6 customized phases based on your requirements:
   - Phase 1: Page Layout + Mock Data (10 steps)
   - Phase 2: Chart Components with recharts (14 steps)
   - Phase 3: Data Layer & Transactions Integration (12 steps)
   - Phase 4: Filters & Date Ranges (8 steps)
   - Phase 5: PDF Export (6 steps)
   - Phase 6: Testing & Polish (14 steps)

📋 Phase 8: Summary
All documentation created successfully!

📁 docs/reports/
├── reports-feat.md          # Feature specification
├── reports-ui-checklist.md  # UI/UX testing checklist (52 items)
├── reports-qa-checklist.md  # QA/Logic testing checklist (44 items)
└── reports-progress.md      # Implementation tracker (6 phases)

Next Steps:
1. Review & customize the feature specification
2. Adjust implementation phases in progress.md
3. Start with Phase 1 (UI + Mock Data)
4. Track progress as you implement each phase
```
