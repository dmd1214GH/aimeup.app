## Instructions for Grooming Linear issues with ClaudeCode (v0.1)

### Pre-Grooming checklist
Include this check with the standard pre-check tests
- [ ] `<ArgWorkingFolder>/updated-issue.md` contains a clearly stated Requirement(s) that are in a condition to begin or continue grooming

> **⚠️ Verify, Don't Assume**: If requirements mention specific tools, packages, or capabilities, test them during grooming. Unverified assumptions lead to blocked tasks.

### Step 3: Assist operator with grooming the story

**⚠️ CRITICAL: OPERATOR APPROVAL REQUIRED**
- You MUST engage in conversation with the operator before completing grooming
- Even for trivial issues, you MUST present your understanding and get confirmation
- You CANNOT mark grooming as Complete without explicit operator approval
- If you're tempted to skip interaction because the issue seems simple, STOP and ask anyway

**Grooming Rules**
- Work with the operator to refine the issue defined in `updated-issue.md`
- Update `updated-issue.md` directly as the conversation progresses.  Do not wait until the end of the conversation to update the document.
- Find structure and standard guidance in the `#### Template` below.  
- Never remove content without approval.
- **No strikethrough text**: Never use strikethrough formatting as it confuses the tasking process. Convert completed work to "Prior Work" section or Assumptions instead.


**Approach issue level grooming in these phases:**

**Phase 0. Initial Operator Engagement** (MANDATORY)
  - Start with a brief summary of what you understand from the issue
  - Ask "Shall we begin?" and wait for operator response
  - Example: "I see this is about removing temp file usage in lc-runner. Shall we begin?"

Phase 1. Crystal clear **understanding of the requirements**.
  - **Remember**: Grooming defines WHAT to build, not HOW to build it
  - Ensure wording is not vague or ambiguous.
  - **Verify technical assumptions**: Test that any mentioned tools/packages/APIs actually exist and work as described
  - Refine through active conversation before proceeding.
  - Capture scope boundaries (without implementation details)
  - Capture solution ideas (at a high level, not specific code changes)
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
  - **Avoid ALL implementation specifics** - State WHAT needs to be done, not HOW
    - ❌ Bad: "Delete files matching the pattern `/tmp/claude-prompt-*.md`"
    - ✅ Good: "Clean up any legacy temporary files created by previous versions"
    - ❌ Bad: "Pass the original `masterPromptPath` directly in the instruction"
    - ✅ Good: "Use direct file references instead of temporary copies"
    - Let the delivery phase determine specific implementation details
  - Not unnecessarily technical or overly specific.  Keep them as requirements.

## Blocking Questions
- List the open questions and related discussions during grooming
- As questions are answered and incorporated into the issue definition, remove them from this list
- Any TODO mentioned in this document should have a related question logged here about it
- **IMPORTANT**: When grooming is complete, this section must contain ONLY the text "No outstanding questions"
- Do NOT leave resolved questions in the document as they confuse the implementation phase

## Process Flows
- Well-organized, hierarchical bullets suggesting how the technical solution might be laid out within the existing aimeup architecture.
- Reference new or changed components and how they flow together.
- Consider external tools or packages that should be considered
- Validate unknowns with small proofs-of-concept and consult documentation to refine details
- **Test critical dependencies during grooming** - don't assume capabilities exist
- Process Flows Standards
  - **AVOID implementation details**: No line numbers, no specific code changes, no exact function calls
  - **Focus on WHAT, not HOW**: Describe the approach and components, not the exact implementation
  - ❌ Bad: "Remove lines 76-77, 145-146 in claude-invoker.ts"
  - ✅ Good: "The ClaudeInvoker class should skip temp file creation and use direct file references"
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

### Step 4: Mandatory Operator Approval

**BEFORE creating the Finished operation report, you MUST:**
1. Present the groomed issue to the operator with a summary of changes
2. Ask explicitly: "Does this grooming look complete to you? Should we proceed to mark this as ready for Tasking?"
3. Wait for operator confirmation
4. Only proceed if the operator explicitly approves

**If operator does not approve:**
- Continue refining based on feedback
- Do not create Finished report until approval is received

### Step 5: Grooming Operation Success Criteria
All of these criteria must be true in order to consider a grooming operation to be Complete.  If any are untrue, the operation must result with a status of Blocked
- [ ] `updated-issue.md` fully describes the requirement, suggested solution, and acceptance criteria according to the standards and guidance described in the Template, without any reliance on context
- [ ] There are no Blocking Questions, and the Blocking Questions section indicates that no blocking questions remain.
- [ ] **Operator has explicitly approved the grooming** (not assumed or inferred)
- [ ] There are no Breakout Issues listed in the document.  All breakout issues have been broken out into their own issues, and those sections have been removed from the issue
- [ ] Technical dependencies have been verified (tools, packages, APIs exist and work as needed)

