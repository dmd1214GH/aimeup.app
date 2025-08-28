#!/bin/bash
# Script to preserve Claude authentication across container rebuilds

CLAUDE_CONFIG_DIR="/home/aimedev/.claude"
BACKUP_DIR="/aimeup/.claude-backup"

# Function to backup Claude configuration
backup_claude_config() {
    if [ -f "$CLAUDE_CONFIG_DIR/.credentials.json" ]; then
        echo "Backing up Claude configuration..."
        mkdir -p "$BACKUP_DIR"
        # Copy all files including hidden ones
        cp -r "$CLAUDE_CONFIG_DIR"/. "$BACKUP_DIR/" 2>/dev/null
        echo "Claude configuration backed up to $BACKUP_DIR"
    else
        echo "No Claude configuration found to backup"
    fi
}

# Function to restore Claude configuration
restore_claude_config() {
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR)" ]; then
        echo "Restoring Claude configuration..."
        mkdir -p "$CLAUDE_CONFIG_DIR"
        # Copy all files including hidden ones
        cp -r "$BACKUP_DIR"/. "$CLAUDE_CONFIG_DIR/" 2>/dev/null
        chmod 700 "$CLAUDE_CONFIG_DIR"
        chmod 600 "$CLAUDE_CONFIG_DIR/.credentials.json" 2>/dev/null
        echo "Claude configuration restored from backup"
    else
        echo "No backup found to restore"
    fi
}

# Main logic
case "${1:-}" in
    backup)
        backup_claude_config
        ;;
    restore)
        restore_claude_config
        ;;
    check)
        if [ -f "$CLAUDE_CONFIG_DIR/.credentials.json" ]; then
            echo "✓ Claude is authenticated"
        else
            echo "✗ Claude is not authenticated - run 'claude auth'"
        fi
        ;;
    *)
        echo "Usage: $0 {backup|restore|check}"
        echo "  backup  - Save current Claude configuration"
        echo "  restore - Restore saved Claude configuration"
        echo "  check   - Check if Claude is authenticated"
        exit 1
        ;;
esac