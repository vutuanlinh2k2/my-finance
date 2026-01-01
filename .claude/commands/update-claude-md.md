---
description: Automatically update CLAUDE.md file based on recent code changes
allowed-tools: Bash(git diff:*), Bash(git log:*), Bash(git status:*), Bash(find:*), Bash(grep:*), Bash(wc:*), Bash(ls:*), Read, Write, Edit, Glob, Grep
---

# Update Claude.md File

Analyze recent git changes and intelligently update the CLAUDE.md file to reflect the current state of the project.

## Arguments

- `$ARGUMENTS`: Optional parameters (e.g., "last 20 commits", "since 2 weeks ago", "focus on API changes")

## Phase 1: Gather Current State

### Read Current CLAUDE.md

First, read the existing CLAUDE.md file to understand its current structure and content:

```bash
cat CLAUDE.md
```

### Current Repository Status

```bash
git status --porcelain
```

### Recent Changes (Last 10 commits)

```bash
git log --oneline -10
```

### Detailed Recent Changes

```bash
git log --since="1 week ago" --pretty=format:"%h - %an, %ar : %s" --stat
```

## Phase 2: Analyze Changes

### Recent Diff Analysis

```bash
git diff HEAD~5 --name-only | head -20
```

### Detailed Diff of Key Changes

```bash
git diff HEAD~5 -- "*.js" "*.ts" "*.jsx" "*.tsx" "*.py" "*.md" "*.json" | head -200
```

### New Files Added

```bash
git diff --name-status HEAD~10 | grep "^A" | head -15
```

### Deleted Files

```bash
git diff --name-status HEAD~10 | grep "^D" | head -10
```

### Modified Core Files

```bash
git diff --name-status HEAD~10 | grep "^M" | grep -E "(package\.json|README|config|main|index|app)" | head -10
```

## Phase 3: Project Structure Changes

### Markdown Files

```bash
find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*" | head -10
```

### Configuration Changes

```bash
git diff HEAD~10 -- package.json tsconfig.json webpack.config.js next.config.js vite.config.ts .env* docker* 2>/dev/null | head -100
```

### API/Route Changes

```bash
git diff HEAD~10 -- "**/routes/**" "**/api/**" "**/controllers/**" 2>/dev/null | head -150
```

### Database/Model Changes

```bash
git diff HEAD~10 -- "**/models/**" "**/schemas/**" "**/migrations/**" 2>/dev/null | head -100
```

## Phase 4: Generate Updated CLAUDE.md

Based on the current CLAUDE.md content and all the git analysis above, create an updated CLAUDE.md file that:

### 1. Preserves Important Existing Content

- Keep the core project description and architecture
- Maintain important setup instructions
- Preserve key architectural decisions and patterns
- Keep essential development workflow information

### 2. Integrates Recent Changes

Analyze the git diff and logs to identify:

- **New Features**: What new functionality was added?
- **API Changes**: New endpoints, modified routes, updated parameters
- **Configuration Updates**: Changes to build tools, dependencies, environment variables
- **File Structure Changes**: New directories, moved files, deleted components
- **Database Changes**: New models, schema updates, migrations
- **Bug Fixes**: Important fixes that affect how the system works
- **Refactoring**: Significant code reorganization or architectural changes

### 3. Updates Key Sections

Intelligently update these CLAUDE.md sections:

#### Project Overview

- Update description if scope changed
- Note new technologies or frameworks added
- Update version information

#### Architecture

- Document new architectural patterns
- Note significant structural changes
- Update component relationships

#### Setup Instructions

- Add new environment variables
- Update installation steps if dependencies changed
- Note new configuration requirements

#### API Documentation

- Add new endpoints discovered in routes
- Update existing endpoint documentation
- Note authentication or parameter changes

#### Development Workflow

- Update based on new scripts in package.json
- Note new development tools or processes
- Update testing procedures if changed

#### Recent Changes Section

Add a "Recent Updates" section with:

- Summary of major changes from git analysis
- New features and their impact
- Important bug fixes
- Breaking changes developers should know about

#### File Structure

- Update directory explanations for new folders
- Note relocated or reorganized files
- Document new important files

### 4. Smart Content Management

- **Don't duplicate**: Avoid repeating information already well-documented
- **Prioritize relevance**: Focus on changes that affect how developers work with the code
- **Keep it concise**: Summarize rather than listing every small change
- **Maintain structure**: Follow existing CLAUDE.md organization
- **Add timestamps**: Note when major updates were made

## Phase 5: User Confirmation

Before writing changes, present a summary to the user:

1. **Sections to be updated** - List which parts of CLAUDE.md will change
2. **New information to add** - Summarize new content being added
3. **Content being removed** - Note any outdated content being removed
4. **Reasoning** - Explain why each change is being made

Ask for confirmation before proceeding with the update.

## Phase 6: Apply Changes

Once confirmed:

1. Create a backup mention in the commit
2. Write the updated CLAUDE.md file
3. Show a diff summary of what changed
4. Verify the file is valid markdown

## Rules

1. **Preserve the core structure** - Don't reorganize existing sections unless necessary
2. **Be conservative** - Only add/update what's clearly needed based on git analysis
3. **Match existing style** - Follow the formatting and tone of the existing CLAUDE.md
4. **Don't over-document** - Focus on information that helps developers, not every minor change
5. **Keep commit conventions** - Maintain any existing commit message guidelines
6. **Validate changes** - Ensure the resulting file is complete and valid
7. **Respect existing patterns** - If CLAUDE.md has specific conventions, follow them

## Example Output

```
📋 CLAUDE.md Update Analysis

Current file: 150 lines
Last updated: 2 weeks ago (based on git log)
Recent commits analyzed: 15

📝 Proposed Changes:

1. UPDATE: Architecture section
   - Add new "Reports" module documentation
   - Update component structure diagram

2. ADD: New section "Reports Feature"
   - Document new reports page functionality
   - Add API endpoints for report generation

3. UPDATE: Development Workflow
   - Add new pnpm script: `pnpm generate:report`

4. UPDATE: File Structure
   - Add docs/reports/ directory
   - Add src/routes/reports/ explanation

5. ADD: Recent Updates (2024-01-15)
   - Reports feature implementation
   - Subscription page enhancements
   - Sidebar navigation updates

Proceed with these updates? (y/n)
```
