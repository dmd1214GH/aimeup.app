#!/usr/bin/env bash
# Claude authentication backup management script
# Automatically backs up .claude-docker directory with rotation

set -euo pipefail

# Configuration
BACKUP_DIR="${HOME}/.claude-backups"
BACKUP_PREFIX="claude-docker"
MAX_BACKUPS=3  # Keep last 3 backups (reduce to ~3.6MB max)
SOURCE_DIR=".claude-docker"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory and repo root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# Function to create backup
backup_claude() {
    # Check if source directory exists
    if [ ! -d "$SOURCE_DIR" ]; then
        echo -e "${YELLOW}⚠️  No .claude-docker directory found. Nothing to backup.${NC}"
        exit 0
    fi
    
    # Check if directory has content
    if [ -z "$(ls -A $SOURCE_DIR 2>/dev/null)" ]; then
        echo -e "${YELLOW}⚠️  .claude-docker directory is empty. Nothing to backup.${NC}"
        exit 0
    fi
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Generate timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_NAME="${BACKUP_PREFIX}_${TIMESTAMP}.tar.gz"
    BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
    
    # Create backup
    echo -e "${GREEN}📦 Creating backup...${NC}"
    tar -czf "$BACKUP_PATH" "$SOURCE_DIR" 2>/dev/null
    
    # Get backup size
    BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    echo -e "${GREEN}✅ Backup created: ${BACKUP_NAME} (${BACKUP_SIZE})${NC}"
    
    # Rotate old backups
    rotate_backups
    
    # Show current backups
    list_backups
}

# Function to rotate old backups
rotate_backups() {
    # Get list of backups sorted by date (oldest first)
    BACKUPS=($(ls -1t "$BACKUP_DIR"/${BACKUP_PREFIX}_*.tar.gz 2>/dev/null | tail -r))
    BACKUP_COUNT=${#BACKUPS[@]}
    
    if [ $BACKUP_COUNT -gt $MAX_BACKUPS ]; then
        REMOVE_COUNT=$((BACKUP_COUNT - MAX_BACKUPS))
        echo -e "${YELLOW}🔄 Rotating old backups (keeping last ${MAX_BACKUPS})...${NC}"
        
        for ((i=0; i<$REMOVE_COUNT; i++)); do
            OLD_BACKUP="${BACKUPS[$i]}"
            rm "$OLD_BACKUP"
            echo -e "   Removed: $(basename "$OLD_BACKUP")"
        done
    fi
}

# Function to restore from backup
restore_claude() {
    # Check if backup directory exists
    if [ ! -d "$BACKUP_DIR" ]; then
        echo -e "${RED}❌ No backup directory found at ${BACKUP_DIR}${NC}"
        exit 1
    fi
    
    # Get latest backup or specified backup
    if [ -n "${1:-}" ]; then
        # Specific backup requested
        BACKUP_FILE="${BACKUP_DIR}/${1}"
        if [ ! -f "$BACKUP_FILE" ]; then
            BACKUP_FILE="${BACKUP_DIR}/${BACKUP_PREFIX}_${1}.tar.gz"
        fi
    else
        # Get latest backup
        BACKUP_FILE=$(ls -1t "$BACKUP_DIR"/${BACKUP_PREFIX}_*.tar.gz 2>/dev/null | head -1)
    fi
    
    if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}❌ No backup found to restore${NC}"
        list_backups
        exit 1
    fi
    
    # Confirm restoration
    echo -e "${YELLOW}⚠️  This will replace current .claude-docker directory!${NC}"
    echo -e "Restoring from: $(basename "$BACKUP_FILE")"
    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Restoration cancelled."
        exit 0
    fi
    
    # Backup current directory if it exists
    if [ -d "$SOURCE_DIR" ] && [ -n "$(ls -A $SOURCE_DIR 2>/dev/null)" ]; then
        echo -e "${YELLOW}📦 Backing up current .claude-docker before restore...${NC}"
        backup_claude
    fi
    
    # Remove existing directory
    rm -rf "$SOURCE_DIR"
    
    # Restore from backup
    echo -e "${GREEN}📥 Restoring from backup...${NC}"
    tar -xzf "$BACKUP_FILE"
    
    echo -e "${GREEN}✅ Restored from: $(basename "$BACKUP_FILE")${NC}"
    
    # Verify restoration
    if [ -f "${SOURCE_DIR}/.credentials.json" ]; then
        echo -e "${GREEN}✅ Authentication files verified${NC}"
    else
        echo -e "${YELLOW}⚠️  Warning: .credentials.json not found in restore${NC}"
    fi
}

# Function to list backups
list_backups() {
    echo -e "\n${GREEN}📋 Available backups:${NC}"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        echo "   No backups found"
        return
    fi
    
    BACKUPS=($(ls -1t "$BACKUP_DIR"/${BACKUP_PREFIX}_*.tar.gz 2>/dev/null))
    
    if [ ${#BACKUPS[@]} -eq 0 ]; then
        echo "   No backups found"
    else
        for backup in "${BACKUPS[@]}"; do
            SIZE=$(du -h "$backup" | cut -f1)
            NAME=$(basename "$backup")
            DATE=$(echo "$NAME" | sed -E 's/.*_([0-9]{8})_([0-9]{6}).*/\1 \2/' | sed 's/\(....\)\(..\)\(..\) \(..\)\(..\)\(..\)/\1-\2-\3 \4:\5:\6/')
            echo "   • $NAME ($SIZE) - $DATE"
        done
        echo -e "\n   Total: ${#BACKUPS[@]} backup(s) in ${BACKUP_DIR}"
    fi
}

# Function to check backup age
check_backup_age() {
    if [ ! -d "$BACKUP_DIR" ]; then
        return 1
    fi
    
    LATEST_BACKUP=$(ls -1t "$BACKUP_DIR"/${BACKUP_PREFIX}_*.tar.gz 2>/dev/null | head -1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        return 1
    fi
    
    # Get file modification time in seconds since epoch
    if [[ "$OSTYPE" == "darwin"* ]]; then
        BACKUP_TIME=$(stat -f %m "$LATEST_BACKUP")
    else
        BACKUP_TIME=$(stat -c %Y "$LATEST_BACKUP")
    fi
    
    CURRENT_TIME=$(date +%s)
    AGE_SECONDS=$((CURRENT_TIME - BACKUP_TIME))
    AGE_DAYS=$((AGE_SECONDS / 86400))
    
    if [ $AGE_DAYS -gt 7 ]; then
        echo -e "${YELLOW}ℹ️  Last backup is ${AGE_DAYS} days old. Consider creating a new backup.${NC}"
        return 1
    fi
    
    return 0
}

# Main script logic
case "${1:-}" in
    backup|--backup|-b)
        backup_claude
        ;;
    restore|--restore|-r)
        restore_claude "${2:-}"
        ;;
    list|--list|-l)
        list_backups
        ;;
    check|--check|-c)
        if check_backup_age; then
            echo -e "${GREEN}✅ Recent backup exists${NC}"
        else
            echo -e "${YELLOW}⚠️  No recent backup found${NC}"
            exit 1
        fi
        ;;
    auto|--auto|-a)
        # Silent auto-backup mode for integration
        if ! check_backup_age; then
            backup_claude > /dev/null 2>&1
        fi
        ;;
    *)
        echo "Claude Authentication Backup Manager"
        echo ""
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  backup, -b          Create a new backup"
        echo "  restore, -r [name]  Restore from backup (latest or specified)"
        echo "  list, -l           List all available backups"
        echo "  check, -c          Check if recent backup exists"
        echo "  auto, -a           Auto-backup if needed (silent mode)"
        echo ""
        echo "Examples:"
        echo "  $0 backup                    # Create new backup"
        echo "  $0 restore                   # Restore latest backup"
        echo "  $0 restore 20240830_143022   # Restore specific backup"
        echo "  $0 list                      # Show all backups"
        ;;
esac