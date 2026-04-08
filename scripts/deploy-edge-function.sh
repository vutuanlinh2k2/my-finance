#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/deploy-edge-function.sh [--project-ref <ref>] <function-name> [more-function-names...]

Behavior:
  - Deploys each Supabase Edge Function with --no-verify-jwt
  - Defaults project ref from supabase/.temp/project-ref
  - Uses pnpm exec supabase for this repo

Examples:
  scripts/deploy-edge-function.sh snapshot-crypto-portfolio
  scripts/deploy-edge-function.sh snapshot-crypto-portfolio snapshot-net-worth
  scripts/deploy-edge-function.sh --project-ref votuotqmkkaltmowbfsv process-subscription-payments
EOF
}

PROJECT_REF=""
FUNCTION_NAMES=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-ref)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --project-ref" >&2
        usage
        exit 1
      fi
      PROJECT_REF="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      FUNCTION_NAMES+=("$1")
      shift
      ;;
  esac
done

if [[ ${#FUNCTION_NAMES[@]} -eq 0 ]]; then
  echo "At least one function name is required." >&2
  usage
  exit 1
fi

if [[ -z "$PROJECT_REF" && -f "supabase/.temp/project-ref" ]]; then
  PROJECT_REF="$(tr -d '[:space:]' < "supabase/.temp/project-ref")"
fi

if [[ -z "$PROJECT_REF" ]]; then
  echo "Could not determine project ref. Pass --project-ref explicitly." >&2
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required but not found in PATH." >&2
  exit 1
fi

for function_name in "${FUNCTION_NAMES[@]}"; do
  function_dir="supabase/functions/${function_name}"
  if [[ ! -d "$function_dir" ]]; then
    echo "Function directory not found: ${function_dir}" >&2
    exit 1
  fi

  echo "Deploying ${function_name} to ${PROJECT_REF} with --no-verify-jwt"
  pnpm exec supabase functions deploy \
    "${function_name}" \
    --project-ref "${PROJECT_REF}" \
    --no-verify-jwt
done
