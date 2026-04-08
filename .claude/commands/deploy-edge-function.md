---
description: Deploy one or more Supabase Edge Functions for this repo with the correct project ref and --no-verify-jwt
allowed-tools: Bash, Read, Glob, Grep
---

# Deploy Edge Function

Deploy Supabase Edge Functions for this repository using the shared project script.

## Arguments

- `$ARGUMENTS`: One or more function names in `supabase/functions/`

## Process

1. If `$ARGUMENTS` is empty, inspect changed files under `supabase/functions/`.
2. If exactly one function name can be inferred, deploy it.
3. If multiple function names are possible, ask the user which ones to deploy.
4. Run the shared deploy script:

```bash
scripts/deploy-edge-function.sh <function-name> [more-function-names...]
```

## Rules

- Always use the shared script instead of rebuilding the deploy command manually
- Do not omit `--no-verify-jwt`
- Report which function names were deployed and which project ref was used
