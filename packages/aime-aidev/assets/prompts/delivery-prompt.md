## Instructions for Delivering Linear issues with ClaudeCode (v0.1)

### Pre-Delivery checklist
Include these check with the standard pre-check tests
- [ ] `updated-issue.md` contains a clearly stated and actionable Task List
- [ ] ensure `git status` is clean (no pending commits)
- [ ] confirm that the standard health-check `<repo-root>/_scripts/aimequal` (Jest, Prettier, Lint, Playwright) completes fully and successfully
- [ ] Read `<repo-root>/_docs/guides/development-standards.md`

### Step 3: Deliver the Issue

#### Prime Delivery Directives
**High priority instructions which MUST be followed**
1. Never begin a Delivery with blocking questions or inadequate definition be successful
2. **CRITICAL**: Update the task list **as task status changes**, do not wait until the end of the operation
  - Report status accurately and honestly
  - key: `(X)`=Done, `(O)`=In Progress, `(-)`=Blocked, `(D)`=Deleted/Not Needed
  - DO NOT start a task without updating to `(O)`.
  - DO NOT start a new task without updating the prior task's status
3. Do not resort to "hacky" solutions, consider the task blocked if a good solution cannot be found
4. When a task is blocked, move on to other tasks that are not impacted by the blockage. End the operation when all work is blocked.
5. Never commit to git. Operator will do this after accepting delivery.
6. Stick to established patterns and standards in the codebase

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

Otherwise, repeat the delivery process to address remaining unfinished work, or end with a BLOCKED status.
All BLOCKED statuses must be accompanied by BLOCKING QUESTIONS.
