## Instructions for Delivering Linear issues with ClaudeCode (v0.1)

### Delivery-specific Pre-Operation checklist
Include these delivery-specific pre-operation checks with the other tests in `Phase 1: Pre-operation Checklist`
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

Before beginning delivery work, you MUST use the lc-issue-tasker subagent to generate or validate the task list, followed by quality validation:

1. **Invoke the lc-issue-tasker subagent**:
   - Use the Task tool with `subagent_type="lc-issue-tasker"`
   - Provide required parameters:
     - issueId: <issue-id>
     - workingFolder: <working-folder>
     - operation: <operation>
     - repoRoot: <repo-root>
   - Example prompt: "Please task the following Linear issue:
     - issueId: AM-68
     - workingFolder: /aimeup/.linear-watcher/work/lcr-AM-68/op-Deliver-20250904170945
     - operation: Deliver
     - repoRoot: /aimeup"
   - The subagent will run with full conversation context awareness
   - Wait for subagent completion and capture the response

2. **Process subagent response and create operation report**:
   - Parse the JSON response from the subagent
   - Use lc-issue-saver subagent to create operation report:
     - action: "Tasked" (if status="Complete") or "Tasking-BLOCKED" (if status="Blocked")
     - operationStatus: Map status to appropriate value
     - Include task count and validation details in payload
   
3. **Evaluate tasking status**:
   - Check the status from subagent response:
     - If "Blocked" or "Failed": Stop the operation immediately
     - If "Complete": Continue to implementation
     - If missing/invalid: Create failed report and stop

4. **Save to Linear**:
  - Use the lc-issue-saver subagent to save the issue, operation report, and status


#### 3.3: Implementation

##### Prime Delivery Directives
1. Locate and update the `Task List` in `updated-issue.md` with every status change.
  - key: `(X)`=Completed the task, `(O)`=Started the task, `(-)`=Blocked, `(D)`=Deleted/Not Needed
  - **CRITICAL**: Do NOT modify acceptance criteria checkboxes `[ ]` - these must remain unchecked for human verification
2. Do not resort to "hacky" solutions, consider the task blocked if a good solution cannot be found
3. When a task is blocked, move on to other **non-validation** tasks that are not impacted by the blockage. End the operation when all work is blocked.  Validation tasks should only be performed after all other delivery tasks are completed.
4. Never commit to git. Operator will do this after accepting delivery.
5. Stick to established patterns and standards in the codebase

**Task status examples**:
```
## Task List
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

### Phase 4: Delivery Success Verification with Terminal Transition
All of these criteria must be true to consider Delivery Complete:
- 4.1: Task list status accurately reflects the status of each task
- 4.2: Every task has been completed
- 4.3: Code is in a committable state
- 4.4: Local repo is up to date with the latest build and is ready to showcase the results
- 4.5: The `Delivery Adjustments` section accurately represents adjustments and findings
- 4.6: The aimequal test suite passes (run `_scripts/aimequal` or `/aimefix` command) following the very last code change
- 4.7: Delivery agent has affirms that all acceptance criteria will pass

If all conditions are true, the operation should be identified as a success.

