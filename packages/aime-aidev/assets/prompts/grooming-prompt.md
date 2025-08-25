## Instructions for Grooming Linear issues with ClaudeCode (v0.1)

### Pre-Grooming checklist
Include this check with the standard pre-check tests
- [ ] `<ArgWorkingFolder>/updated-issue.md` contains a clearly stated Requirement(s) that are in a condition to begin or continue grooming

### Step 3: Assist operator with grooming the story
**Grooming Rules**
- Work with the operator to refine the issue defined in `updated-issue.md`
- Update `updated-issue.md` directly as the conversation progresses.  Do not wait until the end of the conversation to update the document.
- Find structure and standard guidance in the `#### Template` below.  
- Never remove content without approval.


**Approach issue level grooming in these phases:**
Phase 1. Crystal clear **understanding of the requirements**.
  - Ensure wording is not vague or ambiguous.
  - Refine through active conversation before proceeding.
  - Capture scope boundaries
  - Capture solution ideas
  - Understand the purpose of the each requirement, and challenge validity when appropriate
Phase 2. Suggest **Breaking Out Issues**
  - Unrelated issues should not be completed within the same issue
  - Large or unnecessarily complex issues should be broken out
  - Aim for simple, easily deliverable stories.
Phase 3. Work through **Solution and Process Flow** ideas
  - Again, do this primarily through conversation and approval
  - Ensure competing options are clear
Phase 4. Craft **Acceptance Criteria**
  - Ideally completed after other elements are nearing maturity


#### Template
Groomed issues should be presented in this standard format:

```markdown
# <IssueName: Uniquely descriptive name>
<Description: 1-2 sentence description of the issue>

## Requirements
- Well-organized, hierarchical bullets describing the aspirational requirements
- Consider edge cases, recording decisions as requirements or scope assumptions
- Consider best-practices, and deviate consciously
- Requirement Standards
  - Tightly stated (brief and well written)
  - Clear and unambiguous

## Blocking Questions
- List the open questions and related discussions.
- As questions are answered and incorporated into the issue definition, remove them from this list.  
- Any TODO mentioned in this document should have a related question logged here about it
- When no questions remain, simply add the text "No outstanding questions"

## Process Flows
- Well-organized, hierarchical bullets suggesting how the technical solution might be laid out within the existing aimeup architecture.
- Reference new or changed components and how they flow together.
- Consider external tools or packages that should be considered
- Validate unknowns with small proofs-of-concept and consult documentation to refine details
- Process Flows Standards
  - Use "```fenceposts" to show code or configuration samples.  But use sparingly.  We are not developing the solution here.
  - Reference existing components or documents directly using `singleBackTic` marks
  - Be concise.  Assume ClaudeCode will develop the solution and will not need development guidance, only solution direction
  - Process flows fully cover the stated requirements

## Acceptance Criteria
- Express AC's as on a single line with a `- [ ] Unchecked Checkbox`.  Operator will check these off during acceptance of the issue.
- Specify the key points that a user would expect to experience after the delivery of the functionality
- State these as user acceptance criteria, not requirements or technical tasks
- Do not restate obvious criteria, or items that are included in `_docs/guides/steps-of-doneness.md`
- Acceptance Criteria Standards
  - AC's are independently verifiable and can be demonstrated
  - AC's cover all requirements

## Assumptions
- Capture a bullet list of assumptions made during the grooming process.
- Include only non-obvious, unstated assumptions (such as tool availability, scope decisions, etc).  Do not restate requirements, standards, or best practices in this section.

## Breakout Issues
- Each groomed story should be small enough to deliver within a single ClaudeCode context window.  
- If Issues get too big, consider breaking out functionality into separate Issues.  
- Use the same format as the main issue (with deeper indentation) so they can be easily broken out using Linear AI

### BreakoutIssueXName
<BreakoutIssueXDescription>

#### Requirements

#### Blocking Questions

#### Process Flows

#### Assumptions

```

### Step 4: Grooming Operation Success Criteria
All of these criteria must be true in order to consider a tasking operation to be Complete.
- [ ] `updated-issue.md` fully describes the requirement, suggested solution, and acceptance criteria according to the standards and guidance described in the Template
- [ ] There are no Blocking Questions, and the Blocking Questions section indicates that no blocking questions remain.
- [ ] All content independently understandable within `updated-issue.md` without relying on context.
- [ ] Operator agrees that grooming is complete and the issue should move along to `Tasking`
- [ ] There are no Breakout Issues listed in the document

If all conditions are true, the operation should be identified as a success.

Otherwise, repeat the tasking process to address remaining unfinished work, or end with a BLOCKED status.
All BLOCKED statuses must be accompanied by BLOCKING QUESTIONS.
