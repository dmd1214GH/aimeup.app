# Upload Recovery System - Session Summary

## Current Issue
The upload recovery operation is incorrectly changing Linear issue status to "Done" when it uploads `updated-issue.md`. This happens because the command passes `operationStatus: "Complete"` to lc-issue-saver, which triggers a status transition.

## Key Problem Files & Lines
- `/aimeup/packages/aime-aidev/assets/claude-commands/lc-upload-files.md` line 94: `operationStatus: "Complete"`
- `/aimeup/.linear-watcher/work/lcr-AM-93/op-Groom-20250910140705/operation-report-UpdateIssue-20250910154503.md` - Shows the status change to Done

## System Architecture

### 1. Command Flow
```
CLI (--upload-only) → Creates master prompt → Claude reads command file → Executes recovery
```

### 2. Current Implementation
- **CLI approach**: Simple "read the command file" (not embedding content)
- **Command file**: `/aimeup/.claude/commands/lc-upload-files.md`
- **Log separation**: 
  - `issue-operation-log.md` - Human-readable operation status (markdown)
  - `issue-upload-log.jsonl` - Machine-readable upload tracking (JSON Lines)

### 3. File Locations
- **Test folder**: `/aimeup/.linear-watcher/work/lcr-AM-93/op-Groom-20250910140705/`
- **Source files**: `/aimeup/packages/aime-aidev/assets/claude-commands/`
- **Installed files**: `/aimeup/.claude/commands/` (read-only, installed via postinstall)

## Recent Fixes Implemented

### 1. Duplicate Operation Reports
- **Problem**: Upload recovery was creating NEW operation reports instead of uploading existing ones
- **Solution**: Added explicit warnings in command file to NOT create new reports
- **Files changed**: `lc-upload-files.md` - Added "CRITICAL: This is an UPLOAD-ONLY Recovery Operation"

### 2. Mixed Log Format
- **Problem**: JSON Lines were being appended to markdown operation log
- **Solution**: Separated into two files - `issue-operation-log.md` (markdown) and `issue-upload-log.jsonl` (JSON)
- **Files changed**: `lc-upload-files.md` - Changed all references from operation-log to upload-log

### 3. Timestamp Consistency
- **Problem**: Operation report timestamps didn't match filenames
- **Solution**: Simplified instructions in `lc-issue-saver.md` to generate one timestamp for both
- **Files changed**: `lc-issue-saver.md` line 200-210, `lc-runner-general-prompt.md` line 50-65

### 4. Locked File Handling
- **Problem**: CLI expected `updated-issue.md` but file was renamed to `.LOCKED-CHECK-REVERSION-PROTOCOL`
- **Solution**: CLI automatically renames locked files back before upload
- **Files changed**: `cli.ts` line 225-236

## Test Results
- Upload recovery successfully uploads all 4 files (3 operation reports + updated-issue.md)
- No duplicate operation reports created ✓
- Proper log separation working ✓
- Simple "read file" approach working (not hanging) ✓
- **ISSUE**: Status incorrectly changes to "Done" ✗

## Current Status Transition Logic

The lc-issue-saver agent maps `operationStatus` to Linear statuses:
- `InProgress` → Uses configured status for operation (e.g., "Grooming", "Delivery-ai")
- `Complete` → Transitions to success status (e.g., "Done")
- `Blocked` → Transitions to blocked status

## Question for Discussion
How should upload recovery handle status transitions?

### Option 1: No Status Change
- Change line 94 to `operationStatus: "InProgress"` 
- This preserves current status

### Option 2: Restore Original Status
- Read status from `READONLY-LOCK.json`
- Pass that status to lc-issue-saver

### Option 3: Skip Status Update Entirely
- New parameter to lc-issue-saver to skip status updates
- Only update content, not status

## Files to Reference
1. `/aimeup/packages/aime-aidev/assets/claude-commands/lc-upload-files.md` - Command being executed
2. `/aimeup/packages/aidevops/lc-runner/src/cli.ts` - CLI implementation
3. `/aimeup/.claude/agents/lc-issue-saver.md` - Agent that performs uploads
4. `/aimeup/.linear-watcher/work/lcr-AM-93/op-Groom-20250910140705/READONLY-LOCK.json` - Contains original status

## Next Steps
Need to decide how upload recovery should handle status transitions, then implement the chosen approach.