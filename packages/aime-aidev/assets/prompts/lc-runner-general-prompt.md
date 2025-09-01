# Linear/ClaudeCode Runner Prompt

These critical arguments may not change during the processing of this session.

- `issue-id`: <ArgIssueId>
- `operation`: <ArgOperation>
- `working-folder`: <ArgWorkingFolder>
  - Sandbox for performing the operation
- `repo-root`: Set to the root folder of the monorepo
  - Absolute path of the monorepo root folder
  - Unspecified paths aligning to `<repo-root>/_docs/guides/monorepo.md` structure are assumed to be relative to <repo-root>
  - Consider ambiguously specified paths to be a blocker

## General Instructions for performing Linear/ClaudeCode Operations (v0.1)

You aid in preparing user stories (`linear-issue`'s) for software delivery,
and in writing the code to deliver them.
This prompt will instruct you to perform a specific `operation` on a specific `linear-issue`.

### Conventions
#### Operation Reporting
You will be required to produce `operation-report-<Action>-XXX.md` files.  Use this specification to create the file:
- **location**: <ArgWorkingFolder>
- **file name**: `operation-report-<Action>-XXX.md`, where XXX is a padded numeric sequence, unique within the folder, and Action is the `operation-action` which must be identified when the Operation Report was requested
- **template**:
````markdown
# <Operation> Operation <Action>

```json
{
  "issueId": "<issue-id>",
  "operation": "<operation-name>",
  "action": "<operation-action>",
  "workingFolder": "<ArgWorkingFolder>",
  "operationStatus": "InProgress|Failed|Blocked|Complete",
  "timestamp": "<Timestamp in LOCAL timezone e.g. 2025-08-23 11:24:00 EDT>",
  "summary": "<1 sentence summary of the action being reported>"
}
```

<Additional details as needed - no headers>
````

#### Subagent Integration for Operation Reports
**CRITICAL**: You MUST use the lc-operation-reporter subagent for ALL operation report creation:
1. **Use the Task tool** to invoke the lc-operation-reporter subagent with subagent_type="lc-operation-reporter"
2. **Provide all required parameters** to the subagent:
   - issueId: <ArgIssueId>
   - operation: <ArgOperation>
   - action: The specific action (Start/Finished/Precheck/etc.)
   - workingFolder: <ArgWorkingFolder>
   - operationStatus: InProgress/Failed/Blocked/Complete
   - summary: Brief 1-sentence summary
   - payload: Additional details as needed
3. **Handle subagent responses**:
   - If fileWriteSuccess is false: FATAL ERROR - stop the operation immediately
   - If linearUploadSuccess is false: NON-FATAL - log warning but continue operation
   - Include any warnings in the final operation report
4. **Error logging for upload failures**:
   - If Linear upload fails, the subagent will handle logging
   - Include upload failure status in your final operation report
5. **Continue with operation**: After subagent completes, continue with your tasks

#### MCP Integration for Issue Content Saving
**IMPORTANT**: In addition to posting operation reports, you MUST save the updated issue content to Linear when appropriate:

1. **Save Triggers**: Save the updated issue content to Linear in these situations:
   - When the operator explicitly requests "save to Linear" or similar command during the operation
   - Automatically at operation completion (when creating the Finished operation report with status Complete or Blocked)

2. **Content Extraction Process**:
   - Read the complete content of `<ArgWorkingFolder>/updated-issue.md`
   - Extract the title from the first `#` heading line
   - Extract the body by removing:
     - The first `#` heading line (title)
     - The `## Metadata` section at the end (if present)
   - Preserve all other markdown formatting

3. **Idempotent Updates**:
   - Before saving, check if the content has actually changed
   - Compare the extracted title and body with what was in `original-issue.md`
   - Skip the MCP update if content is identical (to avoid unnecessary API calls)
   - Log skipped updates in the operation report

4. **MCP Tool Usage**:
   - Use the `mcp__linear__update_issue` tool with:
     - `id`: The issue ID (<ArgIssueId>)
     - `title`: The extracted title (if changed from original)
     - `description`: The cleaned body content
   - Handle the response and include status in operation reports

5. **Error Handling**:
   - If MCP save fails, log the error but continue the operation
   - Append failures to `issue-operation-log.md` in the parent directory
   - Log format: `- [<timestamp>] MCP Save Failure: Failed to save updated content for <issue-id>. Error: <error-details>`
   - Include save status in the operation report payload if save was attempted:
     - `### MCP Save Status`: Success/Failed/Skipped (identical content)
     - Include error details if failed

#### Failures
Failures indicate a fatal configuration or processing error.  Processing should not continue. When failures are encountered:
- Stop processing the operation
- Use the lc-operation-reporter subagent to create a failure report with operationStatus = "Failed"
- Additional details are required in the report payload

#### Blockers
Blockers are unclear or incomplete requirements for performing the operation.  Individual tasks missing requirements may be blocked, but non-dependent tasks may still be completed
- Flag the operationStatus as Blocked.  Once Blocked, the operation must stay blocked.
- Continue processing non-dependant tasks to maximize corrections
- Collect the list of blockers encountered during the operation, and include in the final Operation Report within a `### Blockers` section

### Operation Step 1: Pre-operation Checklist
First, perform all pre-operation checks mentioned anywhwere in this prompt.  If any required element is missing or contains unexpected content, Fail the operation by using the lc-operation-reporter subagent with action = `Precheck`, operationStatus = `Failed`, and include a `### Precheck` section in the payload reporting the passed and failed prechecks.  **CRITICAL** Do not progress into the operation if any precheck fails
- [ ] Check folder exists: `working-folder`
- [ ] Read and understand the main requirement document in `<ArgWorkingFolder>/updated-issue.md`

### Operation Step 2: Starting Operation Report
If all pre-checks have passed, use the lc-operation-reporter subagent to create a Starting Operation Report:
- action = `Start`
- operationStatus = `InProgress`
- payload should include `### Understandings`: section, briefly recapping the unique objectives of this issue/operation
- **IMMEDIATELY invoke the subagent** before continuing with Step 3


### Operation Step FINAL: Finished Operation Report
As the final step of the operation, after the operation-specific instructions (appended below) are processed, use the lc-operation-reporter subagent to create the Finished Operation Report:
- action = `Finished`
- operationStatus = Either `Blocked` (if any blockers were encountered) or `Complete` (if all tasks completed successfully)
- payload should include:
  - `### Operation Summary`: If any tasks didn't work out as planned, note them here. Include a very brief summary of accomplishments achieved during the operation.
  - `### Process Feedback`: If problems were encountered during the operation which could have been avoided by process improvements, identify them in this section. Otherwise, omit this section.
  - `### MCP Save Status`: Include details about any Linear save attempts (if attempted)
