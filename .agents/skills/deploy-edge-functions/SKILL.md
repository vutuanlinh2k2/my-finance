---
name: deploy-edge-functions
description: Deploy Supabase Edge Functions for this repository. Use when the user wants to deploy one or more functions in `supabase/functions/`, especially cron-triggered functions that must be deployed with `--no-verify-jwt` and this project's linked Supabase project ref.
---

# Deploy Edge Functions

Use this skill for project-scoped Supabase Edge Function deploys in this repo.

## When to use

- The user asks to deploy an Edge Function
- The user updates code in `supabase/functions/`
- The user changes auth or cron behavior for an Edge Function

## Workflow

1. Confirm which function names to deploy.
2. Use the shared project script:

```bash
scripts/deploy-edge-function.sh <function-name> [more-function-names...]
```

3. The script automatically:
   - reads the linked project ref from `supabase/.temp/project-ref`
   - deploys via `pnpm exec supabase`
   - adds `--no-verify-jwt`

## Project rule

For this repository, deploy Edge Functions with `--no-verify-jwt`.

Why:
- This project uses custom bearer-secret auth such as `CRON_SECRET`
- Those secrets are not JWTs
- Leaving Supabase JWT verification enabled can block the request before the function's own auth logic runs

## Verification

After deploy, verify in the lightest way that matches the change:

- For general functions: inspect deploy success output
- For cron-triggered functions: manually invoke once with the expected auth header if the user wants runtime verification
- For data-writing functions: confirm the expected DB row or side effect exists

## References

- Shared deploy script: `scripts/deploy-edge-function.sh`
- Project guidance: `CLAUDE.md`
- Linked project ref: `supabase/.temp/project-ref`
