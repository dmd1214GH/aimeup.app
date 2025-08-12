#!/usr/bin/env zsh
set -euo pipefail

# Repo root
REPO_PATH="$(cd "$(dirname "$0")/.." && pwd)"
export REPO_PATH

# Load project env (aliases, PATH, NODE_OPTIONS, .env.local)
source "$REPO_PATH/_scripts/aimeup-env.sh"

# Make the screen light green
term-color lightgreen

# Launch Claude in terminal
claude

# Drop you into the guides root with env ready
cd "$REPO_PATH"
echo "[aimeup] Environment loaded. You're at: $REPO_PATH"
echo "[aimeup] Quick cmds: 'web' (dev server), 'ui' (build UI), 'pn' (pnpm)"
echo "[aimeup] Claude CLI launched in terminal"
exec $SHELL -i
