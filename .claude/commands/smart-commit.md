---
description: Analyze all changes deeply and create multiple focused commits, each addressing a single concern
allowed-tools: Bash, Read, Glob, Grep, Edit, Write, TodoWrite
---

# Smart Commit

Thoroughly analyze all current changes, understand how they connect, and create multiple focused commits where each commit addresses only one logical change.

## Arguments

- `$ARGUMENTS`: Optional commit scope filter or instructions (e.g., "only frontend", "skip tests")

## Process

### Phase 1: Gather All Changes

1. **Get git status** to see all modified, added, and deleted files:

   ```bash
   git status --porcelain
   ```

2. **Get the full diff** of all changes (staged and unstaged):

   ```bash
   git diff HEAD
   ```

3. **List untracked files** that might need to be included:
   ```bash
   git ls-files --others --exclude-standard
   ```

### Phase 2: Deep Analysis

For each changed file:

1. **Read the full file content** to understand its purpose and context
2. **Analyze the diff** to understand exactly what changed
3. **Identify the intent** behind each change:
   - Is it a new feature?
   - Is it a bug fix?
   - Is it a refactor?
   - Is it a style/formatting change?
   - Is it a dependency update?
   - Is it documentation?
   - Is it test-related?

### Phase 3: Group Changes Logically

Group related changes into logical commits based on:

1. **Feature boundaries**: Changes that implement the same feature together
2. **File relationships**: Files that import/depend on each other
3. **Change type**: Separate refactors from features from fixes
4. **Domain boundaries**: Separate UI changes from API changes from database changes

Create a TodoWrite plan listing each proposed commit with:

- Commit type (feat, fix, refactor, style, docs, test, chore)
- Scope (component, module, or area affected)
- Files to include
- Brief description of what this commit accomplishes

### Phase 4: User Confirmation

Present the commit plan to the user showing:

- Total number of proposed commits
- For each commit:
  - The commit message (following conventional commits)
  - List of files included
  - Brief explanation of why these changes belong together

Ask the user to confirm or adjust the plan before proceeding.

### Phase 5: Execute Commits

For each approved commit:

1. **Reset staging area** (if needed):

   ```bash
   git reset HEAD
   ```

2. **Stage only the relevant files**:

   ```bash
   git add <file1> <file2> ...
   ```

3. **Create the commit** following the project's commit convention:

   ```bash
   git commit -m "$(cat <<'EOF'
   <type>(<scope>): <description>

   <optional body explaining the why>

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   EOF
   )"
   ```

4. **Verify the commit** was created successfully:
   ```bash
   git log -1 --oneline
   ```

### Phase 6: Summary

After all commits are created, show:

- Total commits created
- List of all commit hashes and messages
- Any files that were intentionally skipped and why

## Rules

1. **Never combine unrelated changes** - Each commit should be atomic and focused
2. **Follow conventional commits** - Use proper types (feat, fix, refactor, etc.)
3. **Preserve logical order** - Commits should be ordered so the codebase works at each step
4. **Handle dependencies** - If file A depends on file B, commit B first or together
5. **Skip sensitive files** - Never commit .env, credentials, or secrets
6. **Clean up first** - Before committing, ensure `.playwright-mcp/` images are deleted
7. **Explain groupings** - Always explain why files are grouped together

## Example Output

```
📊 Analyzing 12 changed files...

Found 4 logical commit groups:

1. feat(auth): add password reset functionality
   Files: src/routes/reset-password.tsx, src/lib/auth.ts, src/components/ResetPasswordForm.tsx
   Reason: All files work together to implement the password reset feature

2. fix(ui): correct button alignment in header
   Files: src/components/Header.tsx, src/styles.css
   Reason: Both changes fix the same visual bug

3. refactor(utils): extract date formatting helpers
   Files: src/lib/date.ts, src/lib/utils.ts
   Reason: Pure refactoring with no behavior change

4. chore(deps): update TanStack Router to v1.95
   Files: package.json, pnpm-lock.yaml
   Reason: Dependency update should be isolated

Proceed with these commits? (y/n)
```
