#!/usr/bin/env zsh
# Don't use set -e in sourced files as it affects the entire shell session
# Only use these for debugging when needed
# set -euo pipefail

# If REPO_PATH wasn't set by the caller, derive it from this script file's path
: "${REPO_PATH:="$(cd "$(dirname "$0")/.." && pwd)"}"
export REPO_PATH

# Validate REPO_PATH is set and is a valid directory
if [[ -z "$REPO_PATH" ]] || [[ ! -d "$REPO_PATH" ]]; then
    echo "Error: REPO_PATH is not set or is not a valid directory: $REPO_PATH"
    exit 1
fi

# Default to sandbox if AIME_ENV is not set
: "${AIME_ENV:=sandbox}"
export AIME_ENV

# Add _scripts to PATH for easy access to utilities
export PATH="$REPO_PATH/_scripts:$PATH"

# Common aliases for all environments
alias ll='ls -la'
alias build='pnpm build'
alias dev='pnpm dev'
alias test='pnpm test'
alias check='pnpm check'
alias install='pnpm install && cd packages/aime-aidev && pnpm build && node dist/postinstall.js && cd -'
alias lcr='install && pnpm lc-runner'
alias aimefix='yolo "run agent aimequal-runner, then summarize resulting json"'

# Project-specific aliases (AimeUp specific)
alias pn="pnpm"
alias pnb="pnpm -w build"
alias web="pnpm -F eatgpt-web dev"
alias ui="pnpm -F @aimeup/ui -w build"

# Claude backup aliases
alias claude-backup="$REPO_PATH/_scripts/claude-backup.sh backup"
alias claude-restore="$REPO_PATH/_scripts/claude-backup.sh restore"
alias claude-backups="$REPO_PATH/_scripts/claude-backup.sh list"

# Terminal settings
export EDITOR='vi'

# Node memory tweak
export NODE_OPTIONS="--max_old_space_size=4096"

# Node/pnpm settings (if pnpm is installed locally)
if [[ -d "/home/node/.local/share/pnpm" ]]; then
  export PNPM_HOME="/home/node/.local/share/pnpm"
  export PATH="$PNPM_HOME:$PATH"
fi

# Load .env.local if it exists
if [[ -f "$REPO_PATH/.env.local" ]]; then
  set -a
  source "$REPO_PATH/.env.local"
  set +a
fi

# Load environment-specific settings
ENV_FILE="aime-env-${AIME_ENV}"

if [[ -f "$REPO_PATH/_scripts/${ENV_FILE}.sh" ]]; then
  source "$REPO_PATH/_scripts/${ENV_FILE}.sh"
else
  echo "⚠️  Warning: Environment file not found: ${ENV_FILE}.sh"
  echo "    Valid environments: sandbox, dev, test, acceptance, production"
fi

# Load environment-specific secrets if available (API keys, tokens, etc.)
# This comes AFTER environment file so environment can control which secrets file to load
SECRETS_FILE="${SECRETS_FILE:-aime-env-secrets-${AIME_ENV}}"

if [[ -f "$REPO_PATH/_scripts/${SECRETS_FILE}.sh" ]]; then
  source "$REPO_PATH/_scripts/${SECRETS_FILE}.sh"
elif [[ -f "$REPO_PATH/_scripts/aime-env-secrets.sh" ]]; then
  # Fallback to common secrets file if no environment-specific one exists
  source "$REPO_PATH/_scripts/aime-env-secrets.sh"
fi