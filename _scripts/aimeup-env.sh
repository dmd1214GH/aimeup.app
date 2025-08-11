#!/usr/bin/env zsh
set -euo pipefail

# If REPO_PATH wasn't set by the caller (dev.sh), derive it from this file
: "${REPO_PATH:="$(cd "$(dirname "$0")/.." && pwd)"}"

# Project PATH & aliases
export PATH="$REPO_PATH/_scripts:$PATH"
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
