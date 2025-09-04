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


##### Verification During Grooming
Technical Verification
- Test any mentioned tools/APIs with actual calls when feasible
- Verify assumptions about how systems work
- Don't trust documentation blindly - test it


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
- **Requirements Writing Standards**:
  - Tightly stated (brief and well written), clear and unambiguous
  - **Avoid ALL implementation specifics** - State WHAT is needed, not HOW to do it
    - ❌ Bad: "Delete files matching the pattern `/tmp/claude-prompt-*.md`"
    - ✅ Good: "Clean up any legacy temporary files created by previous versions"
    - ❌ Bad: "the agent does X" (too vague about which agent)
    - ✅ Good: "the Grooming agent does X" or "the lc-runner operation does X"
  - State as requirements, not as instructions
    - ❌ Bad: "Extract success/blocked transitions from config.json and pass as ArgTargetStatusSuccess..."
    - ✅ Good: "Pass the Success and Blocked status transitions from lc-runner"
  - Requirements should be complete and stable before moving to Process Flows
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
  - **Process Flows**: Sketch high-level approach and key components (just enough detail per Process Flow standards above)
  - **Acceptance Criteria**: Define user-observable success criteria
    - Express as single-line `- [ ] Unchecked Checkbox` items
    - Focus on user-observable outcomes, not technical tasks
    - Must be independently verifiable and demonstrable
    - Should fully cover all requirements
  - **Blocking Questions**: Track and resolve all open questions
    - Remove questions as they're answered and incorporated
    - Final state must be "No outstanding questions"
  - **Assumptions**: Capture only non-obvious, unstated assumptions
  - **Breakout Issues**: Use nested format if issue grows too large
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
[Well-organized, hierarchical numbered list per section 3.2 standards]

## Blocking Questions
[Must contain only "No outstanding questions" when grooming is complete]

## Process Flows
[High-level technical approach per Process Flow standards above]

## Acceptance Criteria
- [ ] User-observable success criteria (unchecked boxes)
[Per section 3.3 standards]

## Assumptions
[Non-obvious, unstated assumptions only]

## Breakout Issues
[If needed, use nested format for Linear AI extraction]
```

### Phase 4: Grooming Success Verification
Grooming agent should take a careful look at the final issue definition.  Assume prior evaluations of exit criteria were incomplete.  All of these criteria must be true to consider grooming Complete. If any are untrue, the operation must result with status Blocked.
- `updated-issue.md` fully describes requirements, solution, and acceptance criteria per Template standards
- Blocking Questions section contains only "No outstanding questions"
- Exit criteria for both **Requirements** and **Solution Design** still hold true
- You explicitly asked: "The issue looks solid to me, ready to move to Delivery?", and operator responded affirmatively.  **NEVER** assume or infer this answer.
- No Breakout Issues remain in document (all have been separated into their own issues)
- Technical dependencies have been verified (tools, packages, APIs exist and work as needed)

