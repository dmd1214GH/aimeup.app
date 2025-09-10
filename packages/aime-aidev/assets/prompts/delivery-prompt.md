## Instructions for Delivering Linear Stories with ClaudeCode (v0.1)

### Story Delivery-specific Prechecks
Include these delivery-specific checklist items with `Phase 1: Validate and Prime`
- Ensure `git status` is clean (no pending commits)
- Run `_scripts/aimequal` and confirm all tests pass
- Read `<repo-root>/_docs/guides/development-standards.md`
- Review the story as defined in `updated-issue.md` and validate that it is completely clear and achievable


### Story Delivery Execution Guidelines

#### Updating the Task List
Phase `2.2: Implementation` guides the Delivery Agent through delivering each task in the task list.  Use these guidelines for updating the task list in `updated-issue.md`:
  - Each task has a `()` status indicator
  - Task status indicator **SHALL** be updated **BEFORE** and **AFTER** performing work on each task
  - key: `()`=Not started `(X)`=Completed the task, `(O)`=Started the task, `(-)`=Blocked, `(D)`=Deleted/Not Needed
  - Save `updated-issue.md` after every task list update
  - **CRITICAL**: Never lie about task status.  It only causes problems!!!!

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

#### Coding Standards
1. Do not resort to "hacky" solutions, consider the task blocked if a good solution cannot be found in a reasonable amount of attempts
2. Never commit to git. Operator will do this after accepting delivery.
3. Stick to established patterns and standards in the codebase
4. Adhere to standards included in `development-standards.md`


### Phase 2: Delivery Execution


#### 2.1: Generate/Validate Task List
Before beginning delivery work, you MUST use the lc-issue-tasker subagent to generate or validate the task list, followed by quality validation:

1. **Invoke the lc-issue-tasker subagent**:
  - Use the subagent `lc-issue-tasker` to task the issue
    ```
    subagent_type: "lc-issue-tasker"
    issueId: <issue-id>
    workingFolder: <working-folder>
    operation: <operation>
    repoRoot: <repo-root>
    ```
  - Wait for subagent completion and capture the response

2. **Process subagent response and create operation report**:
  - Parse the JSON response from the subagent
  - Use lc-issue-saver subagent to create operation report:
    ```
    subagent_type: "lc-issue-saver"
    action: "Tasked" or "Tasking-BLOCKED" depending on tasker status
    operationStatus: "InProgress" or "Blocked" depending on tasker status
    summary: operation + " tasking " + status result
    payload: |
      ### Tasking Results
      Summarized task list, noting blockers if existing
    ```

3. **Calculate Next Steps**:
  - Check the status from subagent response:
    - If "Blocked" or "Failed": 
      - `OPERATION_COMPLETION` = `BLOCKED` or `FAILED` accordingly
      - Skip to Phase 3 to end the operation
    - If "Complete": Continue to implementation
    - If missing/invalid: 
      - `OPERATION_COMPLETION` = `FAILED`
      - Create failed report and skip to Phase 3

   

#### 2.2: Implementation
Read and understand the newly created task list in `updated-issue.md`, and process it using these guidelines:

1. Read the first uncompleted task
  a. If no other tasks are processable, end the `2.2 Implementation phase`
2. Update the `()` status indicator with `(O)` to indicate that processing has started, save the file
3. Formulate a detailed `Task Delivery Plan` for completing the task
4. Execute the plan to deliver the task, iterate and adjust the plan as needed to deliver a high-quality result
5. Evaluate completion of the `Task Delivery Plan` 
  a. If the `Task Delivery Plan` is not viable, or any part of the plan cannot be completed, indicate the task to be blocked:
    - Replace the status indicator with `(-)` to indicate "Blocked"
    - Append a `- BLOCKED: + Reason` sub-item to the task's sub-list
    - Review the remaining uncompleted tasks to evaluate if they should be blocked by this task, and indicate their blockages as well.
    - Save the file to update the status
  b. Otherwise, (the task delivery plan was fully completed)
    - Indicate the task as complete `(X)`
    - Append a `- UPDATED: File1.md, File2.ts` sub-item to the task's sub-list
6. If any deviation from the plan was required to progress the task, create or append a summary to the `## Delivery Adjustments` section of `updated-issue.md`
7. Return to Step 1 to see if there is another task to deliver


#### 2.3: Final Delivery Verification
Perform these steps after `2.2: Implementation` finishes its work

1. Calculate the Blocked/Complete operation status.  Complete depends on ALL **Delivery Phase Exit Criteria** being true
  - Task list status accurately reflects the status of each task
  - Every task has been **HONESTLY** marked completed
  - Code is in a committable state (high quality, no known bugs, aimequal works)
  - Local repo is up to date with the latest build and is ready to showcase the results
  - The `Delivery Adjustments` section accurately represents adjustments and findings
  - The aimequal test suite passes (run `_scripts/aimequal`) following the very last code change
  - Delivery agent affirms that all acceptance criteria will pass either through direct testing or careful code review
    - **CRITICAL**: Do NOT modify acceptance criteria checkboxes `[ ]` - these must remain unchecked for human verification
2. If all of the **Delivery Phase Exit Criteria** are true
  - `OPERATION_COMPLETION` = `COMPLETE`
  - Otherwise, `OPERATION_COMPLETION` = `BLOCKED`


