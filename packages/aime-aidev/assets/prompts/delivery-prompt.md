## Instructions for Delivering Linear issues with ClaudeCode (v0.1)

### Pre-Delivery checklist
Include these checks with the standard pre-check tests in Phase 1:
- Ensure `git status` is clean (no pending commits)
- Run the aimequal-runner subagent, then summarize results and confirm all tests pass
- Read `<repo-root>/_docs/guides/development-standards.md`

### Phase 3: Delivery Execution

#### 3.1: Understand Requirements
- Review groomed requirements in `updated-issue.md`
- Validate Process Flows are clear and actionable
- Identify any blockers immediately
- If requirements are unclear or incomplete, report as blocker

#### 3.2: Generate/Validate Task List with Quality Validation

Before beginning delivery work, you MUST invoke the lc-issue-tasker subagent to generate or validate the task list, followed by quality validation:

##### Part A: Task List Generation

1. **Invoke the lc-issue-tasker subagent**:
   - Use the Task tool with `subagent_type="lc-issue-tasker"`
   - Pass the complete issue content from `updated-issue.md` to the subagent
   - The subagent will run in a separate context window, preserving the Delivery context

2. **Handle tasker response**:
   - If the subagent succeeds:
     - Verify that a non-empty task list was generated in `updated-issue.md`
     - If task list is empty, treat as failure and stop the operation
   - If the subagent fails (crash, timeout, error, or non-successful status):
     - Stop the Delivery operation immediately
     - Report the operation as Blocked with "Tasking-BLOCKED"

3. **Save to Linear via MCP**:
   - After the subagent completes (whether successful or failed), save the updated issue content to Linear
   - Use the `mcp__linear__update_issue` tool as described in the general MCP Integration section
   - Include the save status in the operation report

4. **Create initial operation report**:
   - If tasking failed: Create "Tasking-BLOCKED" report and stop operation
   - If tasking succeeded: Create "Tasked" report and proceed to validation

##### Part B: Task List Quality Validation

**Only proceed to validation if tasking succeeded**

5. **Invoke the lc-task-validator subagent**:
   - Use the Task tool with `subagent_type="lc-task-validator"`
   - Pass the updated issue content from `updated-issue.md` for validation
   - The validator will analyze the task list against 8 quality criteria

6. **Check for fatal validation failures**:
   - Fatal failures that block immediately without refinement:
     - `requirementsClarity` = "fail": Block with "Requirements-BLOCKED" report
     - `noBlockers` = "fail": Block with "BlockingQuestions-BLOCKED" report
   - If fatal failure detected:
     - Create appropriate blocking operation report
     - Save to Linear via MCP
     - Stop the operation - do NOT attempt refinement

7. **Handle refineable validation failures**:
   - If no fatal failures but other criteria fail (refineable failures):
     - Create "Validation-Failed" operation report with structured feedback
     - Re-invoke lc-issue-tasker with `validationFeedback` parameter containing the validator's response
     - The tasker will analyze feedback and either regenerate or apply targeted fixes
     - Save updated content to Linear via MCP after refinement

8. **Second validation cycle (if refinement occurred)**:
   - Re-invoke lc-task-validator with the refined task list
   - Handle second validation results:
     - If validation passes: Create "Validated" report, continue to Step 4
     - If validation fails: Create "Validation-BLOCKED" report and stop operation
   - Note: Only ONE refinement attempt is allowed

9. **Handle successful initial validation**:
   - If all criteria pass on first validation:
     - Create "Validated" operation report
     - Continue directly to Step 4

##### Validation Criteria Reference

The validator checks these 8 criteria (fatal failures marked with **FATAL**):
- `requirementsClarity`: **FATAL** - Requirements must be clear and unambiguous
- `completeCoverage`: All requirements must have corresponding tasks
- `standardsCompliance`: Tasks must follow project standards
- `testingIncluded`: Appropriate testing tasks must be present
- `scopeAdherence`: Tasks must stay within issue scope
- `noBlockers`: **FATAL** - No blocking questions can remain
- `selfContainedTasks`: Each task must be independently executable
- `verifiableResults`: Each task must have clear success criteria

**CRITICAL**: 
- Do not proceed to Step 4 if tasking fails, validation identifies fatal failures, or refinement fails
- The Delivery operation must stop immediately and report as Blocked in these cases
- Always save to Linear after each agent invocation (tasker and validator)

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
- 4.6: The aimequal-runner subagent reports success (all tests passing) following the very last code change

If all conditions are true, the operation should be identified as a success.

When creating your Finished operation report with Complete status:
- You MUST save the updated issue content to Linear via MCP (as described in the general prompt MCP Integration for Issue Content Saving section)
- This ensures the delivered changes are immediately reflected in the Linear issue
- The mcpSaveStatus should be included in your Finished operation report

Otherwise, repeat the delivery process to address remaining unfinished work, or end with a BLOCKED status.
All BLOCKED statuses must be accompanied by BLOCKING QUESTIONS.
