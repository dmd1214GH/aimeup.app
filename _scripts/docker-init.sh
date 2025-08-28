#!/bin/bash
# Docker container initialization script

echo "🐳 Initializing Docker container..."

# Check and restore Claude configuration if needed
if [ ! -f "/home/aimedev/.claude/.credentials.json" ]; then
    echo "Claude configuration not found, checking for backup..."
    /aimeup/_scripts/preserve-claude-auth.sh restore
fi

# Verify Claude authentication
/aimeup/_scripts/preserve-claude-auth.sh check

# Fix permissions on the Claude directory
if [ -d "/home/aimedev/.claude" ]; then
    chmod 700 /home/aimedev/.claude
    chmod 600 /home/aimedev/.claude/.credentials.json 2>/dev/null || true
fi

echo "✓ Docker container initialized"
echo ""
echo "If Claude is not authenticated, run: claude auth"