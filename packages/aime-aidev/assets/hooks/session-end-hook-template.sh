#!/bin/bash

# SessionEnd Hook Template for Linear Issue Terminal Transition Handling
# This hook is triggered when a Claude Code session ends gracefully
# Place this script in your Claude Code hooks directory and configure as needed

# Configuration
WORKING_FOLDER="${1:-}"  # First argument should be the working folder path
ISSUE_ID="${2:-}"        # Second argument should be the issue ID
OPERATION="${3:-}"       # Third argument should be the operation type (Grooming/Delivery)

# Check if working folder exists and contains necessary files
if [ ! -d "$WORKING_FOLDER" ]; then
    echo "[SessionEnd] Working folder not found: $WORKING_FOLDER"
    exit 0
fi

STATE_FILE="$WORKING_FOLDER/.terminal-transition-state"
UPDATED_ISSUE_FILE="$WORKING_FOLDER/updated-issue.md"
ORIGINAL_ISSUE_FILE="$WORKING_FOLDER/original-issue.md"

# Check if state file exists
if [ ! -f "$STATE_FILE" ]; then
    echo "[SessionEnd] No state file found, skipping terminal transition check"
    exit 0
fi

# Parse the state file (assuming JSON format)
# Extract terminal transition flag and timestamps
if command -v jq &> /dev/null; then
    TERMINAL_FLAG=$(jq -r '.terminalTransitionFlag' "$STATE_FILE" 2>/dev/null)
    LAST_FILE_UPDATE=$(jq -r '.lastFileUpdateTimestamp' "$STATE_FILE" 2>/dev/null)
    LAST_LINEAR_SAVE=$(jq -r '.lastLinearSaveTimestamp' "$STATE_FILE" 2>/dev/null)
else
    # Fallback to grep if jq is not available
    TERMINAL_FLAG=$(grep -o '"terminalTransitionFlag":[^,}]*' "$STATE_FILE" | cut -d':' -f2 | tr -d ' ')
fi

# If terminal transition has already occurred, no action needed
if [ "$TERMINAL_FLAG" = "true" ]; then
    echo "[SessionEnd] Terminal transition already completed, no action needed"
    exit 0
fi

# Check if updated-issue.md has been modified
if [ ! -f "$UPDATED_ISSUE_FILE" ]; then
    echo "[SessionEnd] No updated issue file found"
    exit 0
fi

# Compare updated-issue.md with original-issue.md
if [ -f "$ORIGINAL_ISSUE_FILE" ]; then
    if diff -q "$UPDATED_ISSUE_FILE" "$ORIGINAL_ISSUE_FILE" > /dev/null 2>&1; then
        echo "[SessionEnd] No changes detected in issue file"
        exit 0
    fi
fi

# Create a recovery backup with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$WORKING_FOLDER/recovery-backup-$TIMESTAMP.md"
cp "$UPDATED_ISSUE_FILE" "$BACKUP_FILE"
echo "[SessionEnd] Created recovery backup: $BACKUP_FILE"

# Trigger lc-issue-saver with Blocked status
# This would typically call the lc-runner or use the MCP tools
echo "[SessionEnd] Triggering save to Linear with Blocked status..."

# Example command (adjust based on actual lc-runner implementation):
# lc-runner save-issue \
#   --issue-id "$ISSUE_ID" \
#   --working-folder "$WORKING_FOLDER" \
#   --operation "$OPERATION" \
#   --status "Blocked" \
#   --reason "Session ended with unsaved changes"

echo "[SessionEnd] Session end handling complete"
echo "[SessionEnd] To recover work in next session, check: $WORKING_FOLDER"