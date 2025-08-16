#!/bin/bash
set -euo pipefail

# Maestro artifact cleanup script
# Manages .temp/maestro/ directory for test recordings and logs

REPO_ROOT="$(cd "$(dirname "$0")/../../../../.." && pwd)"
ARTIFACTS_DIR="$REPO_ROOT/.temp/maestro"
MAX_RUNS=10

# Function to create artifacts directory
create_artifacts_dir() {
    if [[ ! -d "$ARTIFACTS_DIR" ]]; then
        echo "Creating artifacts directory: $ARTIFACTS_DIR"
        mkdir -p "$ARTIFACTS_DIR"
    fi
}

# Function to clean artifacts before tests
clean_before_tests() {
    echo "Cleaning Maestro artifacts before tests..."
    
    # Create directory if it doesn't exist
    create_artifacts_dir
    
    # Archive previous run if it exists
    if [[ -n "$(ls -A "$ARTIFACTS_DIR" 2>/dev/null)" ]]; then
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        ARCHIVE_DIR="$ARTIFACTS_DIR/archive_$TIMESTAMP"
        mkdir -p "$ARCHIVE_DIR"
        
        # Move existing files to archive
        find "$ARTIFACTS_DIR" -maxdepth 1 -type f -exec mv {} "$ARCHIVE_DIR/" \; 2>/dev/null || true
        echo "Previous artifacts archived to: $ARCHIVE_DIR"
    fi
    
    echo "Artifacts directory ready for new test run"
}

# Function to archive artifacts on failure
archive_on_failure() {
    local test_name="${1:-unknown}"
    echo "Archiving failed test artifacts for: $test_name"
    
    if [[ -n "$(ls -A "$ARTIFACTS_DIR" 2>/dev/null)" ]]; then
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        FAILURE_DIR="$ARTIFACTS_DIR/failed_${test_name}_$TIMESTAMP"
        mkdir -p "$FAILURE_DIR"
        
        # Move recordings and logs
        find "$ARTIFACTS_DIR" -maxdepth 1 -type f \( -name "*.mp4" -o -name "*.log" -o -name "*.png" \) \
            -exec mv {} "$FAILURE_DIR/" \; 2>/dev/null || true
        
        echo "Failed test artifacts saved to: $FAILURE_DIR"
    else
        echo "No artifacts to archive"
    fi
}

# Function to prune old artifacts (keep last N runs)
prune_old_artifacts() {
    echo "Pruning old Maestro artifacts (keeping last $MAX_RUNS runs)..."
    
    if [[ ! -d "$ARTIFACTS_DIR" ]]; then
        echo "No artifacts directory to prune"
        return 0
    fi
    
    # Count archived directories
    ARCHIVE_COUNT=$(find "$ARTIFACTS_DIR" -maxdepth 1 -type d -name "archive_*" -o -name "failed_*" | wc -l)
    
    if [[ $ARCHIVE_COUNT -gt $MAX_RUNS ]]; then
        # Calculate how many to delete
        DELETE_COUNT=$((ARCHIVE_COUNT - MAX_RUNS))
        
        # Delete oldest directories
        find "$ARTIFACTS_DIR" -maxdepth 1 -type d \( -name "archive_*" -o -name "failed_*" \) -print0 | \
            xargs -0 ls -dt | \
            tail -n $DELETE_COUNT | \
            xargs rm -rf
        
        echo "Pruned $DELETE_COUNT old artifact directories"
    else
        echo "No pruning needed ($ARCHIVE_COUNT directories, max $MAX_RUNS)"
    fi
}

# Function to clean all artifacts
clean_all() {
    echo "Removing all Maestro artifacts..."
    
    if [[ -d "$ARTIFACTS_DIR" ]]; then
        rm -rf "$ARTIFACTS_DIR"
        echo "All artifacts removed"
    else
        echo "No artifacts to remove"
    fi
    
    # Recreate empty directory
    create_artifacts_dir
}

# Function to list artifacts
list_artifacts() {
    echo "Maestro artifacts in $ARTIFACTS_DIR:"
    
    if [[ ! -d "$ARTIFACTS_DIR" ]]; then
        echo "No artifacts directory found"
        return 0
    fi
    
    # List directories with sizes
    echo "Archived runs:"
    find "$ARTIFACTS_DIR" -maxdepth 1 -type d \( -name "archive_*" -o -name "failed_*" \) -exec du -sh {} \; | sort -rh
    
    # List current files
    echo -e "\nCurrent files:"
    find "$ARTIFACTS_DIR" -maxdepth 1 -type f -exec ls -lh {} \; 2>/dev/null || echo "No current files"
    
    # Total size
    echo -e "\nTotal size:"
    du -sh "$ARTIFACTS_DIR" 2>/dev/null || echo "0"
}

# Handle script arguments
case "${1:-clean}" in
    clean)
        clean_before_tests
        ;;
    archive)
        archive_on_failure "${2:-unknown}"
        ;;
    prune)
        prune_old_artifacts
        ;;
    clean-all)
        clean_all
        ;;
    list)
        list_artifacts
        ;;
    *)
        echo "Usage: $0 {clean|archive [test_name]|prune|clean-all|list}"
        echo ""
        echo "  clean      - Clean artifacts before tests (archives existing)"
        echo "  archive    - Archive artifacts after test failure"
        echo "  prune      - Remove old artifacts (keep last $MAX_RUNS)"
        echo "  clean-all  - Remove all artifacts"
        echo "  list       - List current artifacts"
        exit 1
        ;;
esac