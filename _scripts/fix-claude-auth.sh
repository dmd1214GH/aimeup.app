#!/bin/bash
# Comprehensive Claude authentication fix script
# This script diagnoses and attempts to fix authentication persistence issues

set -e

# Check for silent mode
SILENT_MODE=false
if [ "$1" = "--silent" ] || [ "$1" = "-s" ]; then
    SILENT_MODE=true
fi

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CLAUDE_CONFIG_DIR="/home/aimedev/.claude"
HOST_BIND_DIR="/aimeup/.claude-docker"
BACKUP_DIR="/aimeup/.claude-backup"

# Function for conditional output
log() {
    if [ "$SILENT_MODE" = false ]; then
        echo -e "$@"
    fi
}

# Function for error output (always shown)
error() {
    echo -e "${RED}$@${NC}" >&2
}

# Function for warning output (always shown)
warn() {
    echo -e "${YELLOW}$@${NC}"
}

if [ "$SILENT_MODE" = false ]; then
    echo -e "${GREEN}🔧 Claude Authentication Fix Script${NC}"
    echo "======================================"
    echo ""
fi

# Function to check if a directory has valid Claude config
check_claude_config() {
    local dir="$1"
    if [ -f "$dir/.credentials.json" ] && [ -s "$dir/.credentials.json" ]; then
        return 0
    fi
    return 1
}

# Step 1: Diagnose current state
log "${YELLOW}Step 1: Diagnosing current state...${NC}"

if [ "$SILENT_MODE" = false ]; then
    echo -n "  • Checking container Claude directory (~/.claude): "
fi
if check_claude_config "$CLAUDE_CONFIG_DIR"; then
    log "${GREEN}✓ Found${NC}"
    CONTAINER_HAS_CONFIG=true
else
    log "${RED}✗ Not found or empty${NC}"
    CONTAINER_HAS_CONFIG=false
fi

if [ "$SILENT_MODE" = false ]; then
    echo -n "  • Checking host bind mount (.claude-docker): "
fi
if check_claude_config "$HOST_BIND_DIR"; then
    log "${GREEN}✓ Found${NC}"
    HOST_HAS_CONFIG=true
else
    log "${RED}✗ Not found or empty${NC}"
    HOST_HAS_CONFIG=false
fi

if [ "$SILENT_MODE" = false ]; then
    echo -n "  • Checking backup directory (.claude-backup): "
fi
if check_claude_config "$BACKUP_DIR"; then
    log "${GREEN}✓ Found${NC}"
    BACKUP_HAS_CONFIG=true
else
    log "${RED}✗ Not found or empty${NC}"
    BACKUP_HAS_CONFIG=false
fi

log ""

# Step 2: Determine action
log "${YELLOW}Step 2: Determining action...${NC}"

if [ "$CONTAINER_HAS_CONFIG" = true ] && [ "$HOST_HAS_CONFIG" = true ]; then
    log "${GREEN}  ✓ Both container and host have config - checking sync${NC}"
    
    # Check if they're the same
    if diff -q "$CLAUDE_CONFIG_DIR/.credentials.json" "$HOST_BIND_DIR/.credentials.json" >/dev/null 2>&1; then
        log "${GREEN}  ✓ Configs are in sync${NC}"
    else
        # In silent mode, only act, don't report
        if [ "$SILENT_MODE" = false ]; then
            echo -e "${YELLOW}  ⚠ Configs differ - syncing container to host${NC}"
        fi
        cp -r "$CLAUDE_CONFIG_DIR"/. "$HOST_BIND_DIR"/
        log "${GREEN}  ✓ Synced to host for persistence${NC}"
    fi
    
elif [ "$CONTAINER_HAS_CONFIG" = true ] && [ "$HOST_HAS_CONFIG" = false ]; then
    # In silent mode, just fix it
    if [ "$SILENT_MODE" = false ]; then
        echo -e "${YELLOW}  ⚠ Container has config but host doesn't - saving to host${NC}"
    fi
    mkdir -p "$HOST_BIND_DIR"
    cp -r "$CLAUDE_CONFIG_DIR"/. "$HOST_BIND_DIR"/
    log "${GREEN}  ✓ Saved to host for persistence${NC}"
    
elif [ "$CONTAINER_HAS_CONFIG" = false ] && [ "$HOST_HAS_CONFIG" = true ]; then
    # In silent mode, just fix it
    if [ "$SILENT_MODE" = false ]; then
        echo -e "${YELLOW}  ⚠ Host has config but container doesn't - restoring to container${NC}"
    fi
    mkdir -p "$CLAUDE_CONFIG_DIR"
    cp -r "$HOST_BIND_DIR"/. "$CLAUDE_CONFIG_DIR"/
    log "${GREEN}  ✓ Restored from host${NC}"
    
elif [ "$BACKUP_HAS_CONFIG" = true ]; then
    # In silent mode, just fix it
    if [ "$SILENT_MODE" = false ]; then
        echo -e "${YELLOW}  ⚠ No active config found, but backup exists - restoring${NC}"
    fi
    mkdir -p "$CLAUDE_CONFIG_DIR"
    mkdir -p "$HOST_BIND_DIR"
    cp -r "$BACKUP_DIR"/. "$CLAUDE_CONFIG_DIR"/
    cp -r "$BACKUP_DIR"/. "$HOST_BIND_DIR"/
    log "${GREEN}  ✓ Restored from backup${NC}"
    
else
    # Always show this error, even in silent mode
    error "  ✗ No Claude configuration found anywhere"
    error ""
    warn "  Please authenticate Claude:"
    echo "    1. Run: claude auth"
    echo "    2. Follow the prompts"
    echo "    3. Run this script again to verify persistence"
    exit 1
fi

log ""

# Step 3: Fix permissions
log "${YELLOW}Step 3: Fixing permissions...${NC}"

if [ -d "$CLAUDE_CONFIG_DIR" ]; then
    chmod 700 "$CLAUDE_CONFIG_DIR"
    find "$CLAUDE_CONFIG_DIR" -type f -exec chmod 600 {} \;
    log "${GREEN}  ✓ Fixed container directory permissions${NC}"
fi

if [ -d "$HOST_BIND_DIR" ]; then
    chmod 700 "$HOST_BIND_DIR"
    find "$HOST_BIND_DIR" -type f -exec chmod 600 {} \;
    log "${GREEN}  ✓ Fixed host directory permissions${NC}"
fi

log ""

# Step 4: Verify authentication (skip in silent mode for speed)
if [ "$SILENT_MODE" = false ]; then
    echo -e "${YELLOW}Step 4: Verifying authentication...${NC}"
    
    # Try to run claude account with a timeout
    if timeout 3 claude account &>/dev/null; then
        echo -e "${GREEN}  ✓ Claude authentication is working!${NC}"
    else
        exit_code=$?
        if [ $exit_code -eq 124 ]; then
            echo -e "${YELLOW}  ⚠ Claude verification timed out (config exists but may need refresh)${NC}"
        else
            echo -e "${YELLOW}  ⚠ Claude authentication may need to be refreshed${NC}"
            echo "     Run 'claude auth' if you encounter issues"
        fi
    fi
    
    echo ""
    echo -e "${GREEN}✅ Authentication fix complete!${NC}"
    echo ""
    echo "Summary:"
    echo "  • Container config: $CLAUDE_CONFIG_DIR"
    echo "  • Persistent storage: $HOST_BIND_DIR"
    echo "  • Backup location: $BACKUP_DIR"
    echo ""
    echo "The bind mount should now persist your authentication across container rebuilds."
fi