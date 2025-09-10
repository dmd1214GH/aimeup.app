# Fix for Duplicate Operation Reports Issue

## Problem
When running `--upload-only` for folder `/aimeup/.linear-watcher/work/lcr-AM-93/op-Groom-20250910140705`, the upload recovery process was creating NEW operation reports instead of just uploading existing ones. This resulted in duplicate reports like:
- 2 Started reports (different timestamps)
- 2 Progress Update reports  
- 2 Finished reports

## Root Cause
Claude was misinterpreting the upload recovery operation as starting a NEW grooming operation rather than just uploading existing files from a PREVIOUS operation.

## Solution
Made the upload recovery instructions more explicit to prevent creation of new operation reports:

### 1. Enhanced Command File (`lc-upload-files.md`)
- Added CRITICAL section emphasizing this is UPLOAD-ONLY
- Explicitly states: "DO NOT CREATE ANY NEW OPERATION REPORTS"
- Clarified to only work with EXISTING files
- Added validation check for recent file timestamps

### 2. Enhanced Master Prompt (`cli.ts`)
- Added prominent warning at top of prompt
- Emphasized "DO NOT START A NEW OPERATION OR CREATE NEW FILES"
- Made it clear this is recovery for a PREVIOUS operation

### 3. Added Test Coverage
- Created `upload-no-duplicates.test.ts` to verify:
  - No new operation reports created during recovery
  - Duplicate detection logic works
  - Locked file handling doesn't create duplicates
  - Chronological ordering is maintained

## Key Changes

### Command File
```markdown
## CRITICAL: This is an UPLOAD-ONLY Recovery Operation
**DO NOT CREATE ANY NEW OPERATION REPORTS**
- You are ONLY uploading EXISTING files that were created by a previous operation
- Do NOT start a new grooming/delivery operation
- Do NOT create new `operation-report-*.md` files
```

### CLI Master Prompt
```markdown
## CRITICAL: This is an UPLOAD-ONLY Recovery Operation
**DO NOT START A NEW OPERATION OR CREATE NEW FILES**
- You are ONLY uploading EXISTING files from a PREVIOUS operation
- Do NOT create any new operation-report-*.md files
```

## Testing
All tests pass including the new duplicate prevention tests:
- `upload-no-duplicates.test.ts` - 4 tests validating no duplicates
- `upload-only-integration.test.ts` - Integration tests for CLI
- `lc-upload-recovery.test.ts` - Recovery logic tests

## Verification
To verify the fix works:
1. Run an operation that creates operation reports
2. Run `--upload-only` on that folder
3. Check that NO new operation-report files are created
4. Verify only existing files are uploaded to Linear

## Related Files
- `/aimeup/packages/aime-aidev/assets/claude-commands/lc-upload-files.md`
- `/aimeup/packages/aidevops/lc-runner/src/cli.ts`
- `/aimeup/packages/aidevops/lc-runner/tests/upload-no-duplicates.test.ts`