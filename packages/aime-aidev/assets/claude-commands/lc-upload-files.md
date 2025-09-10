# LC Upload Files Command

## Purpose
Recovery system for failed Linear uploads. This command orchestrates the upload of deferred Linear operation reports and issue updates that failed during normal operation.

## CRITICAL: This is an UPLOAD-ONLY Recovery Operation
**DO NOT CREATE ANY NEW OPERATION REPORTS**
- You are ONLY uploading EXISTING files that were created by a previous operation
- Do NOT start a new grooming/delivery operation
- Do NOT create new `operation-report-*.md` files
- Do NOT modify existing files except for renaming locked files if needed
- ONLY read existing files and upload them via lc-issue-saver

## Parameters
When invoked, you will receive these parameters:
- `workingFolder`: Absolute path to the operation folder containing files to upload
- `issueId`: The Linear issue identifier (e.g., AM-80)
- `operation`: The original operation being recovered (e.g., "Groom" or "Deliver")
- `testMode` (optional): If true, simulate uploads without Linear API calls

## Process Overview

You are responsible for:
1. Identifying EXISTING files that need uploading based on filename patterns
2. Checking the operation log to avoid duplicate uploads
3. Invoking the lc-issue-saver subagent for each pending file
4. Updating the operation log after successful uploads
5. Failing fast on errors with clear reporting
6. Returning a structured response for CLI parsing

## Step-by-Step Execution

### Step 1: Validate Environment
1. Verify the working folder exists and is readable
2. Determine the issue-level folder (parent of operation folder)
3. Locate or prepare to create `issue-upload-log.jsonl` at issue level (NOT `issue-operation-log.md` which is for operation status)
4. **CRITICAL CHECK**: If you see any files with very recent timestamps (within the last few seconds), STOP - you may be in the wrong mode. This is an upload recovery operation, not a new operation

### Step 2: Read Upload Log
1. Check if `issue-upload-log.jsonl` exists in issue-level folder (NOT `issue-operation-log.md`)
2. If it exists:
   - Read the file line by line
   - Parse each line as JSON (JSON Lines format)
   - Build a set of already-uploaded file paths
   - If any line contains malformed JSON, fail with clear error
3. If it doesn't exist:
   - Initialize empty set of uploaded files
   - File will be created on first successful upload

### Step 3: Identify Pending Files (EXISTING FILES ONLY)
1. List all EXISTING files in the working folder - do NOT create any new files
2. Classify EXISTING files by pattern:
   - `operation-report-*.md` → EXISTING operation reports (process in chronological order)
   - `updated-issue.md` → EXISTING issue content update file
   - `breakout-*.md` → EXISTING breakout sub-issue files
3. Filter out files already recorded in the operation log (to prevent duplicates)
4. Sort operation reports by timestamp extracted from their filenames
5. **IMPORTANT**: If no files need uploading, return success with 0 files uploaded

### Step 4: Process Pending Files

#### For each operation report (in chronological order):
1. Read the report file to extract metadata
2. Look for `issueId:` field in the report (may differ from main issueId for breakouts)
3. **IMPORTANT**: Skip "Broken Out" reports entirely:
   - These are test-mode artifacts with `issueId: null`
   - They're replaced by "CreateBreakout" reports that get generated when real breakout issues are created
   - The "CreateBreakout" reports contain the actual issue IDs and are uploaded to the child issues
4. Extract the operation and operationStatus from the report (these will be used for all uploads)
5. Invoke lc-issue-saver subagent:
   ```
   subagent_type: "lc-issue-saver"
   workingFolder: <working-folder>
   issueId: <extracted-issue-id>
   operation: <operation-parameter>  // Use the operation passed as parameter
   action: <from-report>
   operationStatus: <from-report>
   summary: <from-report>
   payload: <report-content>
   testMode: <if-provided>
   ```
4. On success:
   - Extract linearUrl from subagent response
   - Append log entry to `issue-upload-log.jsonl` (NOT `issue-operation-log.md`):
     ```json
     {"timestamp":"2025-09-10T12:00:00Z","filePath":"/absolute/path/to/file.md","linearUrl":"https://linear.app/..."}
     ```
5. On failure:
   - Stop processing immediately (fail-fast)
   - Report error details

#### For updated-issue.md (if pending):
1. Use the operation and operationStatus from the LAST operation report uploaded (typically "Finished" report)
2. **IMPORTANT**: Prepare for forced update:
   - Rename `saved-issue.md` to `saved-issue.md.backup` (forces lc-issue-saver to detect changes)
   - If `updated-issue.md` contains test placeholders (AM-TEST-*), replace them with actual issue IDs from created breakouts
   - This ensures the issue description has the correct breakout references
3. Invoke lc-issue-saver for issue update:
   ```
   subagent_type: "lc-issue-saver"
   workingFolder: <working-folder>
   issueId: <main-issue-id>
   operation: <operation-parameter>  // Use the operation passed as parameter
   action: "UpdateIssue"
   operationStatus: <from-last-report>  // e.g., "Complete" if Finished report had Complete
   summary: "Recovering issue content update"
   testMode: <if-provided>
   ```
   NOTE: This ensures proper status transitions based on the original operation's config
4. After completion, rename `saved-issue.md.backup` back to `saved-issue.md`
2. Handle success/failure as above

#### For each breakout file (if pending):
1. Read the breakout file for parent metadata
2. Invoke lc-issue-saver to create sub-issue:
   ```
   subagent_type: "lc-issue-saver"
   workingFolder: <working-folder>
   filePath: <breakout-file-path>
   operation: <operation-parameter>  // Use the operation passed as parameter
   action: "CreateBreakout"
   operationStatus: <from-last-report>  // Use status from last report
   summary: "Creating breakout sub-issue"
   testMode: <if-provided>
   ```
3. Handle success/failure as above

### Step 5: Return Structured Response

Return a structured text response that the CLI can parse:

#### Success Format:
```
RECOVERY_STATUS: SUCCESS
UPLOADED_FILES: <count>
DETAILS:
- operation-report-Started-timestamp.md -> https://linear.app/...
- operation-report-Finished-timestamp.md -> https://linear.app/...
- updated-issue.md -> https://linear.app/...
```

#### Failure Format:
```
RECOVERY_STATUS: FAILED
UPLOADED_FILES: <count-before-failure>
ERROR: <error-message>
FAILED_FILE: <filename>
DETAILS:
- Successfully uploaded files listed here
```

#### Test Mode Format:
```
RECOVERY_STATUS: TEST_MODE
SIMULATED_UPLOADS: <count>
DETAILS:
- Would upload: operation-report-Started-timestamp.md
- Would upload: updated-issue.md
```

## Error Handling

1. **Malformed JSON in log**: Fail immediately with clear error about log corruption
2. **File read errors**: Report which file couldn't be read and why
3. **Subagent failures**: Include subagent error details in response
4. **Missing required fields**: Report which field is missing from which file

## Test Mode Behavior

When `testMode` is true:
1. Perform all file identification and log checking
2. Simulate subagent invocations (don't actually call)
3. Do NOT write to operation log
4. Return simulated results showing what would be uploaded

## Important Notes

1. **Idempotency**: The operation log ensures files are never uploaded twice
2. **Atomic logging**: Each log entry is one complete line (JSON)
3. **Fail-fast**: Stop on first error to prevent partial uploads
4. **Chronological order**: Process operation reports by timestamp
5. **Issue routing**: Operation reports may target different issues via issueId field

## Example Log Entry

Each line in `issue-upload-log.jsonl` is a complete JSON object:
```json
{"timestamp":"2025-09-10T14:30:00.000Z","filePath":"/aimeup/.linear-watcher/work/lcr-AM-80/op-Deliver-20250910143000/operation-report-Started-20250910143000.md","linearUrl":"https://linear.app/aimeup/issue/AM-80#comment-abc123"}
```

This JSON Lines format allows efficient append-only operations and easy parsing.