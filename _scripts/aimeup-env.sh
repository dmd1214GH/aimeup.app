#!/usr/bin/env zsh
set -euo pipefail

# If REPO_PATH wasn't set by the caller (dev.sh), derive it from this script file's path
: "${REPO_PATH:="$(cd "$(dirname "$0")/.." && pwd)"}"

# Validate REPO_PATH is set and is a valid directory
if [[ -z "$REPO_PATH" ]] || [[ ! -d "$REPO_PATH" ]]; then
    echo "Error: REPO_PATH is not set or is not a valid directory: $REPO_PATH"
    exit 1
fi

# Project aliases
alias pn="pnpm"
alias pnb="pnpm -w build"
alias web="pnpm -F eatgpt-web dev"
alias ui="pnpm -F @aimeup/ui -w build"

# Node memory tweak (optional)
export NODE_OPTIONS="--max_old_space_size=4096"

# Load .env.local (supports quoted values and spaces)
if [[ -f "$REPO_PATH/.env.local" ]]; then
  set -a
  source "$REPO_PATH/.env.local"
  set +a
fi
