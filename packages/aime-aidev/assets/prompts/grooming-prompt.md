## Instructions for Grooming Linear issues with ClaudeCode (v0.1)

### Grooming-specific Pre-operation checklist
Include these grooming-specific pre-operation checks with the other tests in `Phase 1: Pre-operation Checklist`
- `<working-folder>/updated-issue.md` contains a clearly stated requirement(s) that are in a condition to begin or continue grooming
- Read `<repo-root>/_docs/guides/monorepo.md` to prepare for identifying the component impacts


### Phase 3: Grooming Execution


#### Grooming Guidelines

##### Grooming Operation Flow
1. **Initial Analysis & Operator Engagement**
  - Prepare understanding, greet operator
  - Obtain approval to proceed
2. **Iterative Requirements Development**
  - Collaborate on *Requirements*
  - Prepare *Solution Summary*
  - Obtain approval to proceed
3. **Solution Design**
  - Automatically generate solution
  - Obtain feedback
    - Adjust requirements as necessary
    - Re-generate solution from requirements
  - Obtain approval to proceed
4. **Breakout and Proceed**
  - End the operation with specific instructions for operator if necessary



##### Grooming Guiding Principles
These principles contribute to reliable delivery of desired functionality.  Use them to design and evolve this prompt, and to guide the issue grooming process:

1. Small, atomic, useful issues
  - Keep issues focused on **1 useful thing**
  - Avoid including un-related work
2. Prove concepts and establish patterns for new solutions
  - Solutions that do not have established patterns should be physically tested during grooming
  - Lightly used patterns should explicitly reference similar components to be modeled after
  - Highlight new or immature ideas and ensure their solutions are defined carefully
  - Examples: Claude code features, new libraries, new apis
3. Top-down requirements
  - Structure requirements first
  - Organize from top down and inside out
  - Breakout issues early
  - Delay solution design until after requirements are clear, proven, well organized, and have been considered for breakouts


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


#### 3.1: Initial Analysis & Operator Engagement
- Read and analyze the current issue content
- Identify obvious gaps, ambiguities, or concerns
- Check for any technical dependencies that might inform the issue definition
- Prepare initial understanding summary
- Present findings: "I see this is about [summary]. [Initial observations]. Shall we begin grooming?"
- **Cannot proceed without explicit approval**

#### 3.2: Iterative **Requirements** Development
- Work iteratively with operator to fully develop the **## Requirements** and **## Solution Summary** sections FIRST
  - Update the `updated-issue.md` continuously during this phase
  - Draft and present initial requirements understanding
  - Collaborate with operator to refine.  Expect and support careful, non-rushed deliberation
  - Identify non-obvious out-of-scope boundaries (record in **### Assumptions**)
  - Identify unclear, ambiguous, improper requirements (record in **### Blocking Questions**)
  - Identify new solution patterns (tools, libraries, etc.) and ensure adoption strategy is clear
  - Identify potential breakout issues for unrelated or overly complex elements (record in **### Blocking Questions**)
  - Validate all impactful assumptions with the operator.  Do not rush to the conclusion.
  - Continue iteration until requirements are complete, stable, and all questions are resolved
- Formatting Requirements (important for Linear display)
  - Numbers (1, 2, 3...) for main sections
  - Bullets (`-`) for lower levels
- Keep these **## Solution Summary** sections updated as requirements evolve
  - These are not the target of the collaboration, they are the results of the requirements
  - **### Feature Summary**
    - Delivered features summarized as briefly as possible while still describing the full scope
    - Features describing explicitly stated non-functional requirements should be separated
    - Omit implied requirements (e.g. steps-of-doneness)
    - Consider aligning the requirements section to these headings when it improves clarity
  - **### Blocking Questions**
    - Requirements questions which must be resolved to solidify scope or design
    - Technical questions required to establish solution design direction
    - Resolutions must be incorporated back into the document, and questions should be removed as they are resolved
  - **### Assumptions**
    - Capture only non-obvious assumptions that are not stated in the document
    - Include out-of-scope decisions made during question resolution
    - Include pending or executed POC tests for new solution patterns or tools which will be introduced by this solution
- **## Breakout Issues**
  - If Operator **explicitly** resolves to breakout issues, create a new **### Heading** for it under **## Breakout Issues** and move all of its related elements to that section
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
  - Breakout candidates have been considered and resolved
  - All known questions are resolved and incorporated
  - Operator **EXPLICITLY agrees** that requirements are complete
    - **Required approval**: Say something like:  "The requirements look complete. Shall we move to **Solution Design**?
    - Output the full **## Requirements** and **## Solution Summary** sections when seeking approval to move on
  - When all criteria are met, gently seek operator approval to move on.  Otherwise, prompt operator for outstanding resolutions

#### 3.3: Solution Design
- Design solution and iterate with Operator
  - Automatically draft the **## Solution Design** sections based on **## Requirements** and **## Solution Summary** sections
  - Support user iteration through the design.  If changes are required, capture the underlying requirements, and automatically re-generate the impacted **Solution Design** sections to accommodate those requirements
  - Keep technical details minimal but sufficient to guide implementation
  - Allow and encourage requirements refinement during this phase
- **### Component Impacts**
  - The official components are reflected in `_docs/guides/monorepo.md`
  - Identify the primary components (packages, primary folders, etc.) from `monorepo.md` impacted by the design
  - Summarize the impacts to each component
  - Clearly highlight new, removed, or changing components
- **### Process Flows**
  - Sketch process flows, including interactions, expected by the solution
  - Keep it high-level, just enough detail to communicate vision to the Delivery Agent
  - Actual components (Types, Scripts, Tools, etc.) are **SPARINGLY** woven into the flows where it aids with vision direction
  - Formatting
    - Use indented bullets `-` as the primary format in this section
    - Use ```fenceposts when for code samples
- **## Acceptance Criteria**: Define user-observable success criteria
  - Express as single-line `- [ ] Unchecked Checkbox` items
  - Focus on user-observable outcomes, not technical tasks
  - Must be independently verifiable and demonstrable
  - Should fully cover all requirements
- **Solution Design Phase Exit Criteria**: 
  - **Requirements Phase Exit Criteria** still hold true
  - Solution design fully delivers the stated requirements in an optimal way
  - Solution does not exceed the stated requirements scope
  - All **## Solution Design** sections are complete and exhaustively reflect the solution vision
  - Operator **EXPLICITLY agrees** that Solution Design is complete
    - **Required approval**: Say something like:  "The solution looks solid. Shall we lock it in and move on?"


#### 3.4: Breakout and Proceed
If issues remain in **## Breakout Issues** following operator's agreement to proceed
- Inform operator that the operation will be blocked until the subissues are broken out
- Instruct user to breakout in Linear and re-groom, before moving into delivery
- Move ahead to phase 4 with a Blocked status
- FUTURE: We hope to automate breakouts in a future release.  That would occur here.

#### Template
Groomed issues should be presented in this standard format:

```markdown
# <IssueName: Uniquely descriptive name>
<Description: 1-2 sentence description of the issue>

## Requirements
1. Well-organized, hierarchical numbered list per section 3.2 standards
  - Format like this for linear compatability
    - Numbers first, then dashes for lower levels

## Solution Summary

### Feature Summary
**Functional Features**
[Delivered features summarized as briefly as possible while still describing the full scope]

**Non-Functional Features**
[Summary of non-functional features]

### Blocking Questions
[Must contain only "No outstanding questions" when grooming is complete]

### Assumptions
[Non-obvious, unstated assumptions only]

## Solution Design

### Component Impacts
[Listing of components and their impacts affected by the proposed solution]

### Process Flows
[High-level technical approach per Process Flow standards above]

### Acceptance Criteria
- [ ] User-observable success criteria (unchecked boxes)
[Per section 3.3 standards]

## Breakout Issues
[If needed, use nested format to prepare for Linear AI extraction]
```

### Phase 4: Grooming Success Verification with Terminal Transition
Grooming agent should take a careful look at the final issue definition.  Assume prior evaluations of exit criteria were incomplete.  All of these criteria must be true to consider grooming Complete. If any are untrue, the operation must result with status Blocked.
- `updated-issue.md` fully describes requirements, solution, and acceptance criteria per Template standards
- Blocking Questions section contains only "No outstanding questions"
- Exit criteria for both **Requirements** and **Solution Design** still hold true
- No Breakout Issues remain in document (all have been separated into their own issues)
- Technical dependencies have been verified (tools, packages, APIs exist and work as needed)
- **CRITICAL** You explicitly asked: "The issue looks solid to me, ready to move to Delivery?", and operator responded affirmatively.  **NEVER** assume or infer this answer.

