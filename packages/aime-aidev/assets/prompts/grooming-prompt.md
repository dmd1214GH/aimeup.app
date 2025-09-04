## Instructions for Grooming Linear issues with ClaudeCode (v0.1)

### Grooming-specific Pre-operation checklist
Include these grooming-specific pre-operation checks with the other tests in `Phase 1: Pre-operation Checklist`
- `<working-folder>/updated-issue.md` contains a clearly stated requirement(s) that are in a condition to begin or continue grooming


### Phase 3: Grooming Execution


#### Grooming Guidelines

##### **⚠️ CRITICAL: COMPLY WITH OPERATOR APPROVAL REQUIREMENTS**
- You MUST engage in conversation with the operator before completing grooming
- Expect careful deliberation about all issues, the objective is to get it right the first time

##### **Grooming Rules**
- Work with the operator to refine the issue defined in `updated-issue.md`
- Update `updated-issue.md` directly as the conversation progresses
- Use the Template below for document structure
- Never remove content without approval
- **No strikethrough text**: Never use strikethrough formatting
- **Remember**: Grooming defines WHAT to build, not HOW to build it

##### **⚠️ Verify, Don't Assume**
If requirements mention specific tools, packages, or capabilities, test them during grooming. Unverified assumptions lead to blocked tasks.


##### Specificity vs. Abstraction Balance
Try to achieve just enough detail for the delivery agent to know our intention without being overly detailed or rigid. Trust in high competence of delivery capabilities, but share the context of issues that have been resolved.

**Core Principle**: BE SPECIFIC when naming components, systems, or phases to avoid ambiguity. BE ABSTRACT when describing implementation details or code changes. Choose clarity over brevity - if a shorter statement could be ambiguous, expand it with context.



#### 3.1: Initial Analysis & Operator Engagement (MANDATORY)
- Read and analyze the current issue content
- Identify obvious gaps, ambiguities, or concerns
- Check for any technical dependencies that might inform the issue definition
- Prepare initial understanding summary
- Present findings: "I see this is about [summary]. [Initial observations]. Shall we begin grooming?"
- **Cannot proceed without explicit approval**

#### 3.2: Iterative **Requirements** Development (COMPREHENSIVE)
- Work iteratively with operator to fully develop the **## Requirements** section BEFORE moving to solutions:
  - Draft and present initial requirements understanding
  - Expect and support careful, non-rushed deliberation
  - Identify scope boundaries and what's out of scope, and include non-obvious scope boundaries in the **## Assumptions** section
  - Surface assumptions that need validation
  - **Verify technical dependencies actually exist and work as expected** (test tools/packages/APIs)
  - Identify potential breakout issues for unrelated or overly complex parts
  - Collaborate with operator to refine and iterate
  - Continue until requirements are complete and stable
  - Ensure all questions are explicitly addressed
- Update the document continuously during this phase
- **Requirements Phase Exit Criteria**: 
  - Requirements crystal clear and sensible
  - Breakouts identified along with known requirements
  - Assumptions documented
  - All known questions are resolved and incorporated
  - Operator **EXPLICITLY agrees** that requirements are complete
    - **Required approval**: Say something like:  "The requirements look complete. Shall we move to solution design and acceptance criteria?" and display the requirements list.
- Gently seek operator approval to move on after all other exit criteria are met

#### 3.3: Solution Design (CONCURRENT)
- Comprehensively draft the "Solution Design" sections, and keep updated as requirements evolve.  Solution design sections include:
  - **Process Flows**: Sketch high-level approach and key components (just enough detail)
  - **Acceptance Criteria**: Define user-observable success criteria
  - Other sections as needed
- These inform each other - the approach suggests what to verify, ACs validate coverage
- Keep technical details minimal but sufficient to guide implementation
- Allow and encourage requirements refinement during this phase
- **Solution Design Phase Exit Criteria**: 
  - **Requirements Phase Exit Criteria** still hold true
  - Solution design does not provide functionality beyond the stated requirements scope
  - Solution design fully delivers the stated requirements in an optimal way
  - Process flows reference high-level code base elements (new or reused) to ensure viability and communicate vision to delivery agent (e.g., "Add verification during the final operation report phase")
  - Acceptance Criteria **Fully** expresses all expected functionality described in the requirements and realized by the flows
  - Operator **EXPLICITLY agrees** that Solution Design is complete
    - **Required approval**: Say something like:  "The solution looks solid. Shall we lock it in and move on?"


#### 3.4: Breakout and Proceed
- If Breakout Issues exist, operators should be instructed to break them out in Linear and re-groom, before moving into delivery.  This will cause a blocked result for the operation.
- Move ahead to phase 4
- FUTURE: We hope to automate breakouts in a future release.  That would occur here.

#### Template
Groomed issues should be presented in this standard format:

```markdown
# <IssueName: Uniquely descriptive name>
<Description: 1-2 sentence description of the issue>

## Requirements
1. Well-organized, hierarchical numbered list describing the aspirational requirements
2. Consider edge cases, recording decisions as requirements or scope assumptions
3. Consider best-practices, and deviate consciously
4. Requirement Standards
  - Tightly stated (brief and well written)
  - Clear and unambiguous
  - **Avoid ALL implementation specifics** - State WHAT is needed, not HOW to do it
    - ❌ Bad: "Delete files matching the pattern `/tmp/claude-prompt-*.md`"
    - ✅ Good: "Clean up any legacy temporary files created by previous versions"
    - ❌ Bad: "Pass the original `masterPromptPath` directly in the instruction"
    - ✅ Good: "Use direct file references instead of temporary copies"
    - ❌ Bad: "the agent does X" (too vague about which agent)
    - ✅ Good: "the Grooming agent does X" or "the lc-runner operation does X"
    - Let the delivery phase determine specific implementation details
  - State as requirements, not as instructions
    - ❌ Bad: Target status values must be passed from lc-runner to operations
      - Extract success/blocked transitions from config.json for the current operation
      - Pass as ArgTargetStatusSuccess and ArgTargetStatusBlocked in master-prompt.md
      - lc-operation-reporter uses these parameters when updating status
    - ✅ Good: Pass the Success and Blocked status transitions from lc-runner, don't read the file inside the operation.
    - ❌ Bad: Post-status-update conversation behavior
      - Track conversation state to prevent duplicate status updates after initial transition
      - If changes are requested after status transition, prompt: "Do you want to revert the status back to [Grooming|Delivery-ai]? This will require another upload to Linear when we are done"
      - Upon confirmation, revert status using mcp__linear__update_issue and continue with changes
      - Track that status was reverted to ensure proper re-transition when work completes
    - ✅ Good: Prevent accidental updates after final status transitions
      - When operating in Headed mode, the operator is able to request changes.  Accidental updates should be protected against with a informed intention:  "Do you want to revert the status back to [Grooming|Delivery-ai]? This will require another upload to Linear when we are done"
  - Not unnecessarily technical or overly specific. Keep them as requirements.
  - **Requirements should be complete and stable before moving to Process Flows**

## Blocking Questions
- List the open questions and related discussions during grooming
- As questions are answered and incorporated into the issue definition, remove them from this list
- Any TODO mentioned in this document should have a related question logged here about it
- **IMPORTANT**: When grooming is complete, this section must contain ONLY the text "No outstanding questions"
  - Do NOT leave resolved questions in the document as they confuse the implementation phase

## Process Flows
- High-level technical approach to achieve the requirements
- Focus on WHAT components/systems are involved, not HOW they'll be coded
- Process Flow Standards
  - **Just enough detail to guide implementation** - no more, no less
  - Identify key components and their relationships
  - Note critical technical decisions (e.g., "Use MCP for status updates" not "Call mcp__linear__update_issue with these parameters")
  - Highlight any architectural constraints or dependencies
  - **Component and phase references**: Be specific to avoid ambiguity
    - ❌ Bad: "in Phase 5" (ambiguous without the prompt context)
    - ❌ Bad: "At the end of the process"
    - ✅ Good: "in the final phase where operation reports are created"
    - ✅ Good: "during the verification phase"
    - ❌ Bad: "the system should..." (too vague)
    - ✅ Good: "the lc-issue-saver subagent handles..." (identifies the component)
    - ✅ Good: "operation prompts need guards added" (specific component, abstract implementation)
  - **Minimize implementation details**: No line numbers, no specific code changes, no exact function calls
    - ❌ Bad: "Remove lines 76-77, 145-146 in claude-invoker.ts"
    - ✅ Good: "The ClaudeInvoker class should skip temp file creation and use direct file references"
    - ❌ Bad: "modify lines 45-67 in grooming-prompt.md" (too specific)
    - ✅ Good: "operation prompts need guards to prevent issue modifications" (identifies what, not how)
  - Weave in references to high-level code base elements when helpful, but do not be overly prescriptive
  - Use "```fenceposts" sparingly for critical configuration or API examples only
  - Assume the implementer knows how to code - they need direction, not instruction
  - Process flows fully cover the stated requirements

## Acceptance Criteria
- Express AC's as on a single line with a `- [ ] Unchecked Checkbox`.  Operator will check these off during acceptance of the issue.  Deliver agent must leave these unchecked.
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

### Phase 4: Grooming Success Verification
Grooming agent should take a careful look at the final issue definition.  Assume prior evaluations of exit criteria were incomplete.  All of these criteria must be true to consider grooming Complete. If any are untrue, the operation must result with status Blocked.
- `updated-issue.md` fully describes requirements, solution, and acceptance criteria per Template standards
- Blocking Questions section contains only "No outstanding questions"
- Exit criteria for both **Requirements** and **Solution Design** still hold true
- You explicitly asked: "The issue looks solid to me, ready to move to Delivery?", and operator responded affirmatively.  **NEVER** assume or infer this answer.
- No Breakout Issues remain in document (all have been separated into their own issues)
- Technical dependencies have been verified (tools, packages, APIs exist and work as needed)

