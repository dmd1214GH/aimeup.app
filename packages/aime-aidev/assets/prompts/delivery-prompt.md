## Instructions for Delivering Linear issues with ClaudeCode (v0.1)

### Pre-Delivery checklist
Include these check with the standard pre-check tests
- [ ] ensure `git status` is clean (no pending commits)
- [ ] Run the aimequal-runner subagent, then summarize results and confirm all tests pass
- [ ] Read `<repo-root>/_docs/guides/development-standards.md`

### Step 3: Generate/Validate Task List

Before beginning delivery work, you MUST invoke the lc-issue-tasker subagent to generate or validate the task list:

1. **Invoke the lc-issue-tasker subagent**:
   - Use the Task tool with `subagent_type="lc-issue-tasker"`
   - Pass the complete issue content from `updated-issue.md` to the subagent
   - The subagent will run in a separate context window, preserving the Delivery context

2. **Handle subagent response**:
   - If the subagent succeeds:
     - Verify that a non-empty task list was generated in `updated-issue.md`
     - If task list is empty, treat as failure and stop the operation
   - If the subagent fails (crash, timeout, error, or non-successful status):
     - Stop the Delivery operation immediately
     - Report the operation as Blocked

3. **Save to Linear via MCP**:
   - After the subagent completes (whether successful or failed), save the updated issue content to Linear
   - Use the `mcp__linear__update_issue` tool as described in the general MCP Integration section
   - Include the save status in the operation report

4. **Create operation report**:
   - Use the lc-operation-reporter subagent to create an operation report
   - Action: "Tasked" if successful, "Tasking-BLOCKED" if failed
   - Status: "InProgress" if successful (continue to Step 4), "Blocked" if failed (stop operation)
   - Include details about the tasking result and MCP save status in the payload

**CRITICAL**: Do not proceed to Step 4 if tasking fails or produces an empty task list. The Delivery operation must stop immediately and report as Blocked.

### Step 4: Deliver the Issue

#### Prime Delivery Directives
1. Update the task list in `updated-issue.md` with every status change.
  - key: `(X)`=Completed the task, `(O)`=Started the task, `(-)`=Blocked, `(D)`=Deleted/Not Needed
  - **CRITICAL**: Do NOT modify acceptance criteria checkboxes `[ ]` - these must remain unchecked for human verification
  - Only update task list items numbered 1., 2., etc. Never change `- [ ]` or `- [X]` checkbox items
2. Do not resort to "hacky" solutions, consider the task blocked if a good solution cannot be found
3. When a task is blocked, move on to other tasks that are not impacted by the blockage. End the operation when all work is blocked.
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

#### Delivery steps
- Complete the Tasks as defined in `updated-issue.md`, updating status as you progress
- If unexpected problems are encountered, address them as long as the solution is obvious and complies with standards.
- If you must skip a task, consider it blocked and move on to unblocked tasks

### Step 5: Delivery Operation Success Criteria
All of these criteria must be true in order to consider a Delivery operation to be Complete.
- Task list status accurately reflects the status of each task
- Every task has been completed
- The aimequal-runner subagent reports success (all tests passing)
- Code is in a committable state
- Local monorepo is ready to showcase the results
- The `Delivery Adjustments` section accurately and fully represents adjustments and findings discovered during the delivery process.

If all conditions are true, the operation should be identified as a success.

When creating your Finished operation report with Complete status:
- You MUST save the updated issue content to Linear via MCP (as described in the general prompt MCP Integration for Issue Content Saving section)
- This ensures the delivered changes are immediately reflected in the Linear issue
- The mcpSaveStatus should be included in your Finished operation report

Otherwise, repeat the delivery process to address remaining unfinished work, or end with a BLOCKED status.
All BLOCKED statuses must be accompanied by BLOCKING QUESTIONS.
