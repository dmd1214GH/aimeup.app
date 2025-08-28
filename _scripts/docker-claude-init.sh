#!/bin/bash
# Enhanced Docker Claude authentication initialization
# This script ensures Claude authentication persists across container rebuilds

set -e

CLAUDE_CONFIG_DIR="/home/aimedev/.claude"
BIND_MOUNT_DIR="/aimeup/.claude-docker"
BACKUP_DIR="/aimeup/.claude-backup"

echo "🔐 Claude Authentication Persistence Check"
echo "=========================================="

# Function to copy config from source to destination
copy_claude_config() {
    local source="$1"
    local dest="$2"
    
    if [ -d "$source" ] && [ -f "$source/.credentials.json" ]; then
        echo "📋 Copying Claude config from $source to $dest"
        mkdir -p "$dest"
        cp -r "$source"/. "$dest"/
        
        # Fix permissions
        chmod 700 "$dest"
        find "$dest" -type f -exec chmod 600 {} \;
        return 0
    fi
    return 1
}

# Check current authentication status
if [ -f "$CLAUDE_CONFIG_DIR/.credentials.json" ]; then
    echo "✅ Claude is already authenticated in container"
    
    # Ensure bind mount has latest config
    if [ -d "$BIND_MOUNT_DIR" ]; then
        copy_claude_config "$CLAUDE_CONFIG_DIR" "$BIND_MOUNT_DIR"
        echo "✅ Synced config to bind mount for persistence"
    fi
else
    echo "⚠️  Claude not authenticated in container, checking for saved config..."
    
    # Try to restore from bind mount first (preferred)
    if copy_claude_config "$BIND_MOUNT_DIR" "$CLAUDE_CONFIG_DIR"; then
        echo "✅ Restored Claude config from bind mount"
    # Fallback to backup directory
    elif copy_claude_config "$BACKUP_DIR" "$CLAUDE_CONFIG_DIR"; then
        echo "✅ Restored Claude config from backup directory"
        # Also copy to bind mount for future persistence
        copy_claude_config "$BACKUP_DIR" "$BIND_MOUNT_DIR"
    else
        echo "❌ No saved Claude configuration found"
        echo ""
        echo "📝 Please authenticate Claude:"
        echo "   1. Run: claude auth"
        echo "   2. Follow the prompts to authenticate"
        echo "   3. Your authentication will persist across container rebuilds"
        exit 1
    fi
fi

# Verify authentication works (with timeout)
echo ""
echo "🔍 Verifying Claude authentication..."
if timeout 2 claude account &>/dev/null; then
    echo "✅ Claude authentication verified and working!"
else
    # Check if it was a timeout or actual failure
    if [ $? -eq 124 ]; then
        echo "⚠️  Claude verification timed out (but config exists)"
    else
        echo "⚠️  Claude authentication may need to be refreshed"
        echo "   Run 'claude auth' if you encounter issues"
    fi
fi

echo ""
echo "💾 Config locations:"
echo "   Active:     $CLAUDE_CONFIG_DIR"
echo "   Persistent: $BIND_MOUNT_DIR"
echo "   Backup:     $BACKUP_DIR"