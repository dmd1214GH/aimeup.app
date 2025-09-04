---
description: Generate or validate task list for Linear issue with full context
tools: Read, Write, Edit, MultiEdit, Grep, Glob
---

# Task Linear Issue

Task a Linear issue using the working folder already established in the current operation context.

Usage: `/aime-task-issue <tasking-result-file-path>`

The tasking result file path should be provided as an argument (e.g., `<working-folder>/tasking-20250904072822.md`)

## Execution Process

### Step 1: Validate Context

Verify this slash command is being run from within an lc-watcher Delivery operation.
If any of these variables are not well-understood, exit the operation with an error: "This command must be executed from within an existing lc-runner operation"
- `issue-id`
- `operation`
- `working-folder`
- `repo-root`
- `updated-issue.md` file is accessible and updateable
- `$1` or `$ARGUMENTS` contains the tasking result file path (e.g., `<working-folder>/tasking-20250904072822.md`)


### Step 2: Generate or Validate Task List

1. Check for existing `## Task List` section
2. If missing or invalid, generate comprehensive task list that:
   - Addresses all requirements and acceptance criteria
   - Uses format: `1. ( ) Task description` with sub-bullets
   - Includes file references where applicable
   - Covers implementation, testing, validation, demonstration
   - Complies with steps-of-doneness.md
   - Sequences tasks based on dependencies
3. For each component: Use Grep/Glob to find patterns, verify paths, identify integration points

### Step 3: Add the task list to the issue

Write updated issue to `<working-folder>/updated-issue.md` with:
- Generated/validated `## Task List`
- `## Assumptions` (if material assumptions exist)
- `## Blocking Questions` (if requirements unclear)
- Preserve all original content

### Step 4: Validate Task List

Validate against 8 success criteria:
1. **Requirements clarity** - Requirements are unambiguous
2. **Complete coverage** - Tasks deliver all functionality discussed in the issue
3. **Standards compliance** - Tasks follow steps-of-doneness.md
4. **Testing included** - Automated testing tasks present
5. **Scope adherence** - Tasks don't exceed issue
6. **No blockers** - No unresolved questions (or clearly documented)
7. **Self-contained tasks** - Each task understandable in isolation
8. **Verifiable results** - Each task independently verifiable

If any failiures to these conditions can be resolved with **one extra pass** through steps 2 and 3, resolve them now, otherwise consider the issue to be BLOCKED when creating the status file.


### Step 5: Create Operation Report and Update Result File

1. **Invoke lc-issue-saver subagent** to create operation report:
   - issueId: `<issue-id>`
   - workingFolder: `<working-folder>`
   - operation: `<operation>`
   - action: "Tasked" or "Tasking-BLOCKED"
   - operationStatus: "InProgress", "Blocked", or "Failed"
   - summary: Brief description of tasking outcome
   - Include task count and validation results in payload

2. **Extract operation report path** from lc-issue-saver response:
   - Look for the report file path in the response
   - Format: `<working-folder>/operation-report-<action>-<timestamp>.md`

3. **Write to tasking result file** (provided as argument):
   ```
   OperationReport=<path-to-operation-report>
   ```

### Step 6: Report Summary

- **Success**: "✅ Tasked [ISSUE-ID]: X tasks generated, validation passed"
- **Blocked**: "⚠️ Tasked [ISSUE-ID] with blockers: X tasks, see blocking questions"  
- **Failed**: "❌ Failed to task [ISSUE-ID]: [reason]"

