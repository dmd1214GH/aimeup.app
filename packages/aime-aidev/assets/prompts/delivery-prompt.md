## Instructions for Delivering Linear issues with ClaudeCode (v0.1)

### Pre-Delivery checklist
Include these checks with the standard pre-check tests in Phase 1:
- Ensure `git status` is clean (no pending commits)
- Run `_scripts/aimequal` directly or use `/aimefix` command, then confirm all tests pass
- Read `<repo-root>/_docs/guides/development-standards.md`

### Phase 3: Delivery Execution

#### 3.1: Understand Requirements
- Review groomed requirements in `updated-issue.md`
- Validate Process Flows are clear and actionable
- Identify any blockers immediately
- If requirements are unclear or incomplete, report as blocker

#### 3.2: Generate/Validate Task List with Quality Validation

Before beginning delivery work, you MUST use the /aime-task-issue slash command to generate or validate the task list, followed by quality validation:

1. **Create unique tasking result file**:
   - Generate timestamp: `YYYYMMDDHHMMSS` format  
   - Create file path: `<workingFolder>/tasking-<timestamp>.md`
   - This file will receive the operation report path from the slash command

2. **Invoke the /aime-task-issue slash command**:
   - Execute: `/aime-task-issue <tasking-result-file-path>`
   - The command runs in forked context with full conversation awareness
   - Wait for command completion

3. **Read tasking result file for operation report path**:
   - Read the tasking result file created in step 1
   - Look for: `OperationReport=<path-to-operation-report>`
   - If file missing or invalid format: Create failed operation report and stop

4. **Read and evaluate operation report**:
   - Read the operation report from the path provided
   - Check the `operationStatus` field in the JSON block:
     - If "Blocked" or "Failed": Stop the operation immediately
     - If "InProgress": Continue to validation
     - If missing/invalid: Create failed report and stop


#### 3.3: Implementation

##### Prime Delivery Directives
1. Update the task list in `updated-issue.md` with every status change.
  - key: `(X)`=Completed the task, `(O)`=Started the task, `(-)`=Blocked, `(D)`=Deleted/Not Needed
  - **CRITICAL**: Do NOT modify acceptance criteria checkboxes `[ ]` - these must remain unchecked for human verification
2. Do not resort to "hacky" solutions, consider the task blocked if a good solution cannot be found
3. When a task is blocked, move on to other **non-validation** tasks that are not impacted by the blockage. End the operation when all work is blocked.  Validation tasks should only be performed after all other delivery tasks are completed.
4. Never commit to git. Operator will do this after accepting delivery.
5. Stick to established patterns and standards in the codebase

**Task status examples**:
```
1. () Non-started task
  - Task 1 component 1.1
2. (-) Task 2 (BLOCKED example)
  - Task 2 component
  - BLOCKED: Blocking reason and proposed resolution
3. (D) Task 3 (DELETE example)
  - Task 3 component
  - DELETE: Delete recommendation reason
4. (X) Task 4 (DONE example)
5. (O) Started task
```

##### Delivery steps
- Complete the Tasks as defined in `updated-issue.md`, updating status as you progress
- If unexpected problems are encountered, address them as long as the solution is obvious and complies with standards.

#### 3.4: Final Delivery Verification
- Confirm all ACs are met
- Run tests/validations
- Document any deviations in Delivery Adjustments section

### Phase 4: Delivery Success Verification
All of these criteria must be true to consider Delivery Complete:
- 4.1: Task list status accurately reflects the status of each task
- 4.2: Every task has been completed
- 4.3: Code is in a committable state
- 4.4: Local repo is up to date with the lastest build and is ready to showcase the results
- 4.5: The `Delivery Adjustments` section accurately represents adjustments and findings
- 4.6: The aimequal test suite passes (run `_scripts/aimequal` or `/aimefix` command) following the very last code change
- 4.7: Delivery agent has affirms that all acceptance criteria will pass

If all conditions are true, the operation should be identified as a success.

When creating your Finished operation report with Complete status:
- Use lc-issue-saver which will automatically save the updated issue content to Linear
- This ensures the delivered changes are immediately reflected in the Linear issue
- The subagent response will include the save status for your records

Otherwise, repeat the delivery process to address remaining unfinished work, or end with a BLOCKED status.
All BLOCKED statuses must be accompanied by BLOCKING QUESTIONS.
