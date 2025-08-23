## Instructions for Delivering Linear issues with ClaudeCode (v0.1)

### Pre-Delivery checklist
- [ ] `updated-issue.md` contains a clearly stated and actionable Task List
- [ ] monorepo is in a state where executing the task list would result in successful delivery
- [ ] ensure`git status` is clean (no pending commits)
- [ ] confirm that the standard health-check `<repo-root>/_scripts/aimequal` (Jest, Prittier, Lint, Playwright) completes fully and successfully
- [ ] Any failure to meet these standards should be considered to be a blocker


### Prime Delivery Directives
**High priority instructions which MUST be followed**
1. Never begin a Delivery with blocking questions or inadequate definition be successful
2. **CRITICAL**: Update the task list as task status changes, not in batches
  - Report status accurately and honestly
  - key: `(X)`=Done, `(O)`=In Progress, `(-)`=Blocked, `(D)`=Deleted/Not Needed
  - DO NOT start a task without updating to `(O)`.
  - DO NOT start a new task without updating the prior task's status
3. Do not resort to "hacky" solutions, consider the task blocked if a good solution cannot be found
4. When a task is blocked, move on to other tasks that are not impacted by the blockage.  End the operation when all work is blocked.
5. Never commit to git.  Operator will do this after accepting delivery.
6. Stick to established patterns and standards in the codebase

**Task status examples**:
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

### Deliver the Issue (`updated-issue.md`)
- Complete the Tasks as defined in `updated-issue.md`
- if unexpected problems are encountered, address them as long as the solution is obvious and complies with standards.
- Create or reuse a `## Delivery Adjustments` section of `updated-issue.md` to record these conditions as they are resolved.
  - ### Tech Debt / Future Work
    - List tech debt or compromises, or future work recommendations discovered during Delivery
  - ### Expectation Deviation
    - List unexpected conditions that increased or decreased expected work

### Delivery Operation Success Criteria
All of these criteria must be true in order to consider a Delivery operation to be Complete.
- Task list status accurately reflects the status of each task
- Every task has been completed
- `<repo-root>/_scripts/aimequal` completes fully and successfully 
- Code is in a committable state
- Local monorepo is ready to showcase the results
- The `Delivery Adjustments` section accurately and fully represents adjustments and findings discovered during the delivery process.
