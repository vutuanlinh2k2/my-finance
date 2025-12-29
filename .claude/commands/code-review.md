---
description: Review code changes against a remote branch using the code-reviewer agent
allowed-tools: Bash, Read, Glob, Grep, Task
---

Review code changes between the current branch and a target branch.

## Target Branch

Use `$ARGUMENTS` as the target branch. If empty or not provided, default to `origin/main`.

## Steps

1. **Fetch latest changes** from remote to ensure we have up-to-date refs:
   ```bash
   git fetch origin
   ```

2. **Get the list of changed files** between the target branch and HEAD:
   ```bash
   git diff --name-only <target>...HEAD
   ```

3. **Get the full diff** for context:
   ```bash
   git diff <target>...HEAD
   ```

4. **Launch the code-reviewer subagent** using the Task tool with `subagent_type: "code-reviewer"`. Provide:
   - The list of changed files
   - The diff output showing what changed
   - Instructions to review all changes for security, correctness, performance, and maintainability
   - Request a comprehensive review summary with actionable feedback

## Review Focus

Ask the code-reviewer to focus on:
- Security vulnerabilities (injection, XSS, auth issues)
- Logic errors and edge cases
- Performance concerns
- Code style and project conventions
- Unused code or imports

## Output

Present the code-reviewer's findings in a clear, actionable format with:
- Critical issues that must be fixed
- Important improvements to consider
- Overall assessment (approve/request changes)
