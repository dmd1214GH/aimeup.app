## Instructions for Tasking Linear issues with ClaudeCode (v0.1)

### Pre-Tasking checklist
- [ ] `<working-folder>/updated-issue.md` contains a clearly stated Process Flow and Acceptance Criteria (indicating Tasking readiness)
- [ ] Any failure to meet these standards should be considered to be a blocker

### Create Task List
Create a task list for delivering all acceptance criteria on the Issue definition
- Create or reuse a `## Task List` section of `updated-issue.md`
- List must be comprehensive, and sequenced based on dependencies.
- Include, but don't limit to: setup, coding, testing, documentation, demonstration
- Path to delivering each task must be well validated against the code base
- Tasks must be clearly articulated so they can be completed using only the issue definition
- Tasks should mention what standards, or commit-readiness objective it meets
- Include `<repo-root>/_docs/guides/steps-of-doneness.md` when tasking

Task list will have this format, and will be appended to the original issue definition.

  ## Task list for AM-XX
  1. () Task 1
    - Task 1 implementation detail 1
    - Task 1 implementation detail 2
    - [References: development-standards.md#quality-check]
  2. () Task 2
  N. () Task N
    - Task N component N

### Clarify Assumptions
Transparently state material assumptions made while tasking:
- Create or reuse a `## Assumptions` section in `updated-issue.md`
- Highlight things that might change the design, tech-debt profile, or delivery quality.

### Operation Constraints
- If blockers are found regarding Issue content, continue processing to surface as many problems as possible

### Tasking Operation Success Criteria
All of these criteria must be true in order to consider a tasking operation to be Complete.
- [ ] `updated-issue.md` requirements are not ambiguous and it is fully explained by its contents alone
- [ ] Tasks are defined to fully deliver all acceptance criteria
- [ ] Tasks have been validated to comply with `<repo-root>/_docs/guides/steps-of-doneness.md`
- [ ] Automated testing tasks are included for both positive and negative conditions where feasible
- [ ] Tasks do not do things beyond explicit AC scope
- [ ] No unresolved blocking questions remain in the updated-issue.md
- [ ] Summarized Understanding Comment file is saved and accurately reflects the summary of this operation.
- [ ] Each task is explicitly understandable within `updated-issue.md` without relying on context.
- [ ] The result of each task must be independently verifiable.


If all conditions are true, the operation should be identified as a success.

Otherwise, repeat the tasking process to address remaining unfinished work, or end with a BLOCKED status.
All BLOCKED statuses must be accompanied by BLOCKING QUESTIONS.
