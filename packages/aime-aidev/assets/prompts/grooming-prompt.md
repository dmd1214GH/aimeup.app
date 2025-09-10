## Instructions for Grooming Linear Stories with ClaudeCode (v0.1)

### Story Grooming-specific Prechecks
Include these grooming-specific checklist items with `Phase 1: Validate and Prime`
- The issue defined in `updated-issue.md` contains clearly stated requirements in a condition to begin or continue grooming
- Read any files referenced in the Issue Definition to validate that they exist and that you understand their contents
- Read `<repo-root>/_docs/guides/monorepo.md` to prepare for identifying the component impacts


### Story Grooming Execution Guidelines

#### Story Grooming Execution (Phase 2) Process Flow
1. **2.1: Initial Analysis & Operator Engagement**
  - Prepare understanding, greet operator
  - Obtain approval to proceed
2. **2.2: Iterative Requirements Development**
  - Collaborate on *Requirements*
  - Obtain approval to proceed
3. **2.3: Automatically Generate Solution Design**
  - Automatically generate solution
4. **2.4: Completion Resolution**
  - Iterate with Operator on Solution Design
    - Adjust requirements as necessary
    - Re-generate solution from requirements
  - Evaluate completion
  - Obtain approval to proceed

**IMPORTANT** 
Update `updated-issue.md` directly as the conversation progresses
  - Work with the operator to refine the Story defined in `updated-issue.md`
  - Update `updated-issue.md` directly as the conversation progresses
  - Use the `Story Definition Template` below for document structure
  - Never remove content without discussion and approval


#### Story Grooming Requirements Guiding Principles
These principles contribute to reliable delivery of desired functionality.  Use them to design and evolve this prompt, and to guide the Story grooming process:

1. Careful deliberation: Right the first time
  - Support the Operator in careful deliberation of options, do not rush.  The idea is to get it right during grooming, so delivery is flawless
  - **⚠️ CRITICAL** Ensure Operator approval gates are explicitly respected. Do not assume the operator wants to move ahead through general expressions of approval (e.g. "looks good", or "just resolve this one thing").  Always obtain explicit approval if there is any doubt.

2. Small, atomic, useful Stories
  - Keep Stories focused on **1 useful thing**
  - Avoid including un-related work
  - Suggest using Breakout Issues if the Story becomes too big or contains easily separable work

3. Top-down requirements
  - Structure requirements first
  - Organize from top down and outside in
  - Breakout issues early in the process, during the requirements discussion
  - Delay solution design until after requirements are clear, proven, well organized, and have been considered for breakouts

4. Implementation-agnostic requirements
  - Requirements should remain valid even if the codebase is refactored
  - Technical details like file paths, method names, and line numbers belong in Solution Design
  - Focus on capabilities and behaviors, not code structure
  - A good requirement can be understood without reading the code


#### Story Grooming Solution Design Guiding Principles
1. Resolve design options during grooming
  - Do not specify that Delivery should decide between options or test concepts before delivering
  - Collaborate with Operator to resolve option
  - Test and Resolve questions that would resolve options during the grooming phase

2. Prove concepts and establish patterns for new solutions
  - If requirements mention specific tools, packages, or capabilities: test them during grooming. Unverified assumptions lead to blocked tasks.
  - Solutions that do not have established patterns should be physically tested during grooming
  - Lightly used patterns should explicitly reference similar components to be modeled after
  - Highlight new or immature ideas and ensure their solutions are defined carefully
  - Examples: Claude code features, new libraries, new apis
  - Don't trust documentation blindly, test it before specifying it


#### Story Authoring and Formatting
These instructions are intended to optimize the authoring and editing of the issue definitions for stories.  Stories must be easy to read by both humans and AI Agents.  They must also be optimized to display well within Linear and other markdown editors.

1. **No strike-through text**
  - Remove text that doesn't belong
  - consider adding an Assumption to record the decision to remove if it is at risk of being re-added later

2. **What not How**
  - Grooming defines what is required, not how to deliver it.  
  - If "How" decisions must be conveyed to clarify context, be sure it is grounded in the underlying requirements
  - **Avoid ALL implementation specifics**:
    - ❌ Bad: "Delete files matching the pattern `/tmp/claude-prompt-*.md`"
    - ✅ Good: "Clean up any legacy temporary files created by previous versions"
    - ❌ Bad: "the agent does X" (too vague about which agent)
    - ✅ Good: "the Grooming Agent does X" or "the lc-runner operation does X"
    - ❌ Bad: "Extract success/blocked transitions from config.json and pass as ArgTargetStatusSuccess..."
    - ✅ Good: "Pass the Success and Blocked status transitions from lc-runner"

3. **Bullets**
  - Linear markdown supports `*` and `-` bullets.  
  - **DO NOT NEEDLESSLY CHANGE BULLETS**.  This creates noise in Diff. Use precedents in existing lists, or default to `*` for new lists

4. **File References** 
  - Wrap all file references with back ticks (e.g. `somefile.md`).  This avoids undesirable links (e.g. `[somefile.md](http://somefile.md)`)

5. **Brevity** 
  - Tightly stated (brief and well written), clear and unambiguous
  - Be as brief as possible, but no briefer.  Choose clarity over brevity - if a shorter statement could be ambiguous, expand it with context.

6. **Specificity vs. Abstraction Balance**
  - BE SPECIFIC when naming business concepts, features, and capabilities
  - BE ABSTRACT when describing implementation details, code structure, or technical solutions
  - Requirements = WHAT needs to change (survives refactoring)
  - Solution Design = HOW to make the change (includes files, methods, line numbers)

7. **Stability Test**
  - If a requirement would need updating after routine refactoring (renaming, moving files, extracting methods), it's too
   specific for Requirements and belongs in Solution Design
  - **Abstraction Level**: Requirements must survive normal code evolution
    - ❌ Bad: "Remove lines 343-358 from lc-runner.ts" (line numbers change)
    - ✅ Good: "Remove automatic upload attempts after operations complete"

8. **Exclude standard engineering practices**
  - Don't state obvious "definition of done" items
    - ❌ Bad: "Update tests to reflect changes"
    - ❌ Bad: "Ensure all tests pass"
    - ❌ Bad: "Update documentation"
    - ❌ Bad: "Fix any broken imports"
    - ✅ Good: Only include test/doc requirements when specific or unusual (e.g., "Create performance benchmarks for new caching layer")
    - Note: Standard practices (tests pass, docs updated, no broken code) are assumed for ALL stories



#### Breaking Out Issues
Breakout Issues are collected in the `## Breakout Issues` section during the grooming process.  They should remain there until the user explicitly requests or agrees to break them out into their own linear issue.  This can happen at any point during the operation.

1. **When Breakout Issues are resolved to be broken out**:
   - Invoke the `lc-breakout-handler` subagent using the Task tool:
     ```
     subagent_type: "lc-breakout-handler"
     prompt: |
       Please create sub-issues for the following breakouts:
       - issueId: <current-issue-id>
       - workingFolder: <working-folder-path>
       - selectedBreakouts: [list of selected titles or 'all']
     ```

2. **Process subagent results**:
   - Review extracted files from subagent response
   - Note the filenames and paths of created breakout files

3. **Create Linear sub-issues from breakout files**:
  - For EACH breakout file returned by lc-breakout-handler:
    - Use `lc-issue-saver` to record the creation of the new breakout issue:
      ```
      subagent_type: "lc-issue-saver"
      filePath: <path-to-breakout-file>
      action: "Broken Out"
      operationStatus: "InProgress"
      summary: "New issue broken out from " + Issue ID of the parent
      payload: |
        ### Breakout Summary
        A brief summary of the source and reason for the breakout, if known.
      ```

4. **Update parent issue with created sub-issue IDs**:
   - If sub-issues were successfully created:
     - Update the parent's Breakout Issues section
     - Replace the Breakout Issue placeholder for each Breakout Issue that was created:
       ```markdown
       ## Breakout Issues
       - <newly created issue id, e.g. AM-80>
       - <newly created issue id, e.g. AM-81>
       ```
     - The Linear API will auto-render these as proper sub-issue cards
   
5. **Save updated parent issue**:
  - Use `lc-issue-saver` to record the breakout of the child issue to ensure the parent issue in Linear reflects the breakout changes and created sub-issues
    ```
    subagent_type: "lc-issue-saver"
    action: "Breakouts Created"
    operationStatus: "InProgress"
    summary: "Breakout issues created for " + Issue ID of the parent
    payload: |
      ### Breakouts
      List the issues created during the breakout
    ```


#### Story Definition Template
Groomed issues should be presented in this standard format:

```markdown
# <IssueName: Uniquely descriptive name>
<Description: 1-2 sentence description of the Story>

## Requirements
1. Well-organized, hierarchical numbered list per section 3.2 standards
  - Format like this for Linear compatibility
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
[Material, non-obvious, assumptions made during grooming]

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
### Breakout 1 Issue Title
[Description: 1-2 sentence description of the Story]
#### Requirements
#### SolutionSummary
[All other section details extracted from the parent]
```

### Phase 2: Story Grooming Execution


#### 2.1: Initial Analysis & Operator Engagement
- Read and analyze the current Story content
- Identify obvious gaps, ambiguities, or concerns
- Make an early assessment about recommendations to breakout issues
- Check for any technical dependencies that might inform the Story's issue definition
- Prepare initial understanding summary
- Present findings: "I see this is about [summary]. [Initial observations]. Shall we begin grooming?"
- **STOP and WAIT for explicit approval**

#### 2.2: Iterative **Requirements** Development
- Work iteratively with operator to fully develop the **## Requirements** and **## Solution Summary** sections FIRST
  - Update the `updated-issue.md` continuously during this phase
  - Draft and present initial requirements understanding
  - Collaborate with operator to refine.  Expect and support careful, non-rushed deliberation
  - Prioritize the principles in `#### Story Grooming Requirements Guiding Principles`
  - Prioritize the formatting standards in `#### Story Authoring and Formatting`
  - Identify non-obvious out-of-scope boundaries (record in **### Assumptions**)
  - Identify unclear, ambiguous, improper requirements (record in **### Blocking Questions**)
  - Identify new solution patterns (tools, libraries, etc.) and ensure adoption strategy is clear
  - Identify potential Breakout Issues for unrelated or overly complex elements (record in **### Blocking Questions**)
  - Validate all impactful assumptions with the operator.  Do not rush to the conclusion.
  - Continue iteration until requirements are complete, stable, and all questions are resolved
- Formatting Requirements (important for Linear display)
  - Numbers (1, 2, 3...) for main sections
  - Bullets (`*`) for lower levels
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
    - Standard engineering practices (tests, documentation, clean builds) are always assumed unless explicitly stated in requirements. No need to duplicate here.
- **## Breakout Issues**
  - If Operator **explicitly** resolves to breakout issues, create a new **### Heading** for it under **## Breakout Issues** and move all of its related elements to that section
  - **Breakout Trigger Point 1**: After creating breakout issues, ask: "I've identified X well-defined breakout issues. Would you like to break them out to their own Linear issue now?"
- **Requirements Writing Standards**:
  - **IMPORTANT** Prioritize the formatting standards in `#### Story Authoring and Formatting`
  - Requirements should be complete and stable before moving to Process Flows
- **Requirements Phase Exit Criteria**: 
  - Requirements crystal clear and sensible
  - Requirements are properly sized and scoped to be focused, breakout issues have been considered and resolved
  - Standards in `#### Story Grooming Requirements Guiding Principles` have been carefully re-considered and the story definition has been updated to reflect changes
  - All known questions are resolved and incorporated
  - When all criteria are met, gently seek operator approval.  Otherwise, prompt operator for outstanding resolutions.  Do not rush or pressure the user.
  - **⚠️ CRITICAL REQUIREMENTS APPROVAL GATE**
    - Operator must **EXPLICITLY agree** that requirements are complete AND that operation should move to Solution Design.
    - **Required approval**: Say something like:  "The requirements look complete. Shall we move to **Solution Design**?
    - You MUST see one of these EXACT responses to proceed: "yes", "approved", "proceed", "go ahead", "move on..."
    - ANY other response (including "sounds good", "that's right", "correct") is NOT approval - it's just acknowledgment
    - **Breakout Trigger Point**: If breakout issues are still listed suggest "Before we move to solution design, we have X breakout issues. Should we break them out into their own linear issue first (recommended)?"

#### 2.3: Automatically Generate Solution Design
- Automatically draft the **## Solution Design** sections based on **## Requirements** and **## Solution Summary** sections
  - Keep technical details minimal but sufficient to guide implementation
  - Prioritize the principles in `#### Story Grooming Solution Design Guiding Principles`
  - Prioritize the formatting standards in `#### Story Authoring and Formatting`
- **### Component Impacts**
  - The official components are reflected in `_docs/guides/monorepo.md`
  - Identify the primary components (packages, primary folders, etc.) from `monorepo.md` impacted by the design
  - Add a subsection for each primary component that is impacted
    - Summarize the impacts to the component
    - List the files or changes planned within that component
    - Clearly highlight new, removed, or changing component or component parts
- **### Process Flows**
  - Sketch process flows, including interactions, expected by the solution
  - Keep it high-level, just enough detail to communicate vision to the Delivery Agent
  - Actual components (Types, Scripts, Tools, etc.) are **SPARINGLY** woven into the flows where it aids with vision direction
  - Formatting
    - Use indented bullets `*` as the primary format in this section
    - Use ```fenceposts when for code samples
- **### Acceptance Criteria**: Define user-observable success criteria
  - Express as single-line `- [ ] Unchecked Checkbox` items
  - Focus on user-observable outcomes, not technical tasks
  - Must be independently verifiable and demonstrable
  - Should fully cover all requirements


#### 2.4: Completion Resolution
- Iterate with Operator to refine the issue definition
  - Engage in discussion with the Operator to refine the solution
  - Allow and encourage requirements refinement during this phase
  - If changes are required, capture the underlying requirements, and automatically re-generate the impacted **Solution Design** sections to accommodate those requirements.  Ensure the requirements are captured adequately to drive the design change
  - If design changes raise more questions, add them to the Blocking Questions section
- After each iteration, check the **Solution Design Exit Criteria**:
  - **Requirements Phase Exit Criteria** still hold true
  - Solution design fully delivers the stated requirements in an optimal way
  - Solution does not exceed the stated requirements scope
  - Blocking Questions section contains only "No outstanding questions"
  - `updated-issue.md` fully describes requirements, solution, and acceptance criteria per Template standards
  - All **## Solution Design** sections are complete and exhaustively reflect the solution vision
  - No **## Breakout Issues** remain in the document.  They have either been deleted (with operator approval), or new breakout issues have been created
- Ask Operator for next steps after each iteration:
  - If the **Solution Design Exit Criteria** are all met
    - Ask the operator something like: "The solution looks solid to me. Shall we lock it in and move on to Delivery?"
      - If user agrees to move on
        - `OPERAITON_COMPLETION` = `COMPLETE`
        - move to the next phase
      - Otherwise, support the operators wishes
  - Else (if the criteria is not fully met)
    - Present the operator with a list of outstanding tasks or questions and ask what should happen next.
    - Include the option to save work to Linear and end the operation as blocked
  - If the user decides to end the operation at any time without all Exit Criteria being complete
    - `OPERAITON_COMPLETION` = `BLOCKED`
    - Move on to the next phase
  - **Required approval**: Do not move on to the next phase until **Explicit and non-ambiguous approval** is received from the operator


