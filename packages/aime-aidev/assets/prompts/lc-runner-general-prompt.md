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
## operation-report-json
```json
{
  "issueId": "<issue-id>",
  "operation": "<operation-name>",
  "action": "<operation-action>",
  "workingFolder": "<ArgWorkingFolder>",
  "operationStatus": "InProgress|Failed|Blocked|Complete",
  "timestamp": "<Timestamp in current timezone e.g. 2025-08-23T11:24:00-04:00>",
  "summary": "<1 sentence summary of the action being reported>"
}
```
## Operation Report Payload
- Details as needed
````

#### MCP Integration for Operation Reports
**CRITICAL**: You MUST follow this sequence IMMEDIATELY after writing each operation report file, before doing ANY other work:
1. **Write the operation report file** to disk (operation-report-XXX.md)
2. **Immediately read the created report file**: Use your Read tool to read the complete content of the operation report you just created
3. **Immediately post to Linear via MCP**: If MCP tools are available in your environment, post the report content as a comment to the Linear issue RIGHT NOW, before continuing with any other tasks
4. **Handle MCP failures gracefully**: 
   - If MCP posting fails, append the failure to the parent directory's `issue-operation-log.md` file
   - Log format: `- [<timestamp>] MCP Failure: Failed to post <operation-action> report for <issue-id>/<operation>. Error: <error-details>`
   - The parent directory is one level up from <ArgWorkingFolder> (e.g., if working folder is `/path/lcr-AM-XX/op-Groom-XXX`, log to `/path/lcr-AM-XX/issue-operation-log.md`)
   - Continue with the operation without interruption
   - Do not retry failed MCP posts
4. **MCP posting does not block operations**: Whether MCP succeeds or fails, continue with your operation tasks

#### Failures
Failures indicate a fatal configuration or processing error.  Processing should not continue. When failures are encountered:
- Stop processing the operation
- Create an `operation-report-XXX.md` 
- operationStatus = "Failed"
- Payload is required

#### Blockers
Blockers are unclear or incomplete requirements for performing the operation.  Individual tasks missing requirements may be blocked, but non-dependent tasks may still be completed
- Flag the operationStatus as Blocked.  Once Blocked, the operation must stay blocked.
- Continue processing non-dependant tasks to maximize corrections
- Collect the list of blockers encountered during the operation, and include in the final Operation Report within a `### Blockers` Payload section

### Operation Step 1: Pre-operation Checklist
First, perform all pre-operation checks mentioned anywhwere in this prompt.  If any required element is missing or contains unexpected content, Fail the operation with <operation-action> = `Precheck` and a `### Precheck` payload section reporting the passed and failed prechecks.  **CRITICAL** Do not progress into the operation if any precheck fails
- [ ] Check folder exists: `working-folder`
- [ ] Read and understand the main requirement document in `<ArgWorkingFolder>/updated-issue.md`

### Operation Step 2: Starting Operation Report
If all pre-checks have passed, create a Starting Operation Report:
- <operation-action> = `Start`
- <operationStatus> = `Inprog`
- `### Understandings`: payload section, briefly recapping the unique objectives of this issue/operation
- **IMMEDIATELY after writing this report file**: Read it and post to Linear via MCP before continuing with Step 3


### Operation Step FINAL: Finished Operation Report
As the final step of the operation, after the operation-specific instructions (appended below) are processed, create the Finished Operation Report:
- <operation-action> = `Finished`
- <operationStatus> = Either Blocked (if any blockers were encountered) or Complete, if all tasks completed successfully
- `### Operation Summary`: If any tasks didn't work out as planned, note the here.  Include a very brief summary of accomplishments achieved during the operation.
- `### Process Feedback`: If problems were encountered during the operation which could have been avoided by process improvements, identify them in a Process Feedback paylod section.  Otherwise, omit this section

Then, dump context to `<ArgWorkingFolder>/context.dump.md`:
- Objective is to enable re-entry if needed with maximal context
- Include maximal detail
