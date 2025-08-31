## Instructions for Delivering Linear issues with ClaudeCode (v0.1)

### Pre-Delivery checklist
Include these check with the standard pre-check tests
- [ ] `updated-issue.md` contains a clearly stated and actionable Task List, and along with clear, achievable requirement.
- [ ] ensure `git status` is clean (no pending commits)
- [ ] confirm that the standard health-check `<repo-root>/_scripts/aimequal` (Jest, Prettier, Lint, Playwright) completes fully and successfully
- [ ] Read `<repo-root>/_docs/guides/development-standards.md`

### Step 3: Deliver the Issue

#### Prime Delivery Directives
1. **IMPORTANT**: Update the task list in `updated-issue.md` with every status change.
  - key: `(X)`=Completed the task, `(O)`=Started the task, `(-)`=Blocked, `(D)`=Deleted/Not Needed
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

### Step 4: Delivery Operation Success Criteria
All of these criteria must be true in order to consider a Delivery operation to be Complete.
- Task list status accurately reflects the status of each task
- Every task has been completed
- `<repo-root>/_scripts/aimequal` completes fully and successfully
- Code is in a committable state
- Local monorepo is ready to showcase the results
- The `Delivery Adjustments` section accurately and fully represents adjustments and findings discovered during the delivery process.

If all conditions are true, the operation should be identified as a success.

**IMPORTANT**: When creating your Finished operation report with Complete status:
- You MUST save the updated issue content to Linear via MCP (as described in the general prompt MCP Integration for Issue Content Saving section)
- This ensures the delivered changes are immediately reflected in the Linear issue
- The mcpSaveStatus should be included in your Finished operation report

Otherwise, repeat the delivery process to address remaining unfinished work, or end with a BLOCKED status.
All BLOCKED statuses must be accompanied by BLOCKING QUESTIONS.
