# Claude Epic Development Guide

## Overview
This guide defines the structured workflow for Claude to work through epic backlog items systematically. Each epic is defined in `_docs/epics` and contains a `*_backlog.md` file with standardized backlog items (`BL-XXXX`) that Claude will address one at a time.

This process ensures systematic, high-quality delivery while maintaining clear communication and collaboration throughout the development cycle.

## Process Flow

### 0. **Setup**
- be confident in which epic this work applies to
- locate the epic folder in `_docs/epics`
- Identify the next story which needs to be completed.  Note completed stories have [X] status updates in their ACs, find the next one
- Confirm understanding with developer before continuing


### 1. **Read & Understand Backlog Item**
- Read the complete backlog item description
- Review all acceptance criteria marked with `[]`
- Understand the context and scope of the work
- Identify any dependencies or related requirements

**Example Backlog Item:**
```markdown
BL-0101 Create User Authentication Service
[] Service handles user sign-in with Google OAuth
[] Service manages user session state
[] Service provides user profile data
[] Service handles sign-out and session cleanup
[] Service integrates with existing security API
```

### 2. **Refine Requirements & Ensure Clarity**
- Work with developer to ensure the item is clear and unambiguous
- Add Q&A sections within the relevant backlog item using `---` separators
- Track clarifications and resolutions as work progresses
- Resolve any questions or uncertainties before proceeding

**Q&A Format:**
```markdown
---
Q: Full question with context, constraints, and clarifications needed
Status: In Progress
---
```

**Multiple questions can be tracked:**
```markdown
---
Q: How should RTK and TanStack Query be integrated to avoid redundancy? Need to define clear boundaries - RTK for client state, TanStack Query for server state
Status: In Progress
---
---
Q: What specific integration pattern should we use between the two libraries?
Status: In Progress
---
```

**Questions to ask:**
- Are the acceptance criteria specific enough?
- Are there any technical constraints I should know about?
- Are there options for solving the AC's which should be discussed?
- Are there any dependencies I should investigate first?

### 3. **Gather Context & Refine Requirements**
- Investigate relevant existing code and specifications
- Review related documentation and design files
- Understand the current implementation state
- Work with developer to refine AC's or solution direction based on findings
- Identify any gaps or inconsistencies that need resolution, record in the Q&A sections

**Information to gather:**
- Existing code structure and patterns
- Related specifications and design documents
- Current implementation state
- Dependencies and integration points
- Technical constraints and limitations

### 4. **Execute the Work**
- Implement the solution step by step
- Update acceptance criteria status as work progresses:
  - `[X]` = Completed successfully
  - `[-]` = Cannot be completed (with explanation)
- Document any decisions or trade-offs made
- Ensure code follows project standards and guidelines
- follow all steps of doneness (**except for cheking in code**. Do this after showcase approval.)

**Progress tracking example:**
```markdown
**Acceptance Criteria:**
- [X] Service handles user sign-in with Google OAuth
- [X] Service manages user session state
- [X] Service provides user profile data
- [X] Service handles sign-out and session cleanup
- [-] Service integrates with existing security API (requires security API to be implemented first)

---
Q: How should RTK and TanStack Query be integrated to avoid redundancy? Need to define clear boundaries - RTK for client state, TanStack Query for server state
Status: Resolved
---
Q: What specific integration pattern should we use between the two libraries?
Status: Resolved
---
```

### 5. **Showcase Completed Work**
- Present the completed solution to developer
- Walk through the implementation and key decisions
- Demonstrate how acceptance criteria were met
- Explain any trade-offs or limitations
- Get developer approval before proceeding to commit

**What to showcase:**
- Working functionality
- Code structure and organization
- How acceptance criteria were met
- Any limitations or known issues
- Testing results and validation

### 6. **Retrospective +Commit and Push to Git**
Once approved, follow these closeout procedures
- Retrospective
  - Review and codify changes to this process or related support documentation
  - Guide developer to creating new backlog items (possibly post-epic) if work was not completed or more work was discovered
- Peek ahead
  - Look ahead to the next sensible batch of work to see if upcoming stories need further refinement before they can or should start
  - If questions are found, add them to the backlog as open "Q:'s"
- Commit the changes to git
  - Use descriptive commit messages following project conventions
  - Push changes to the remote repository
- Guide developer to update any related documentation or tracking systems

**Commit message format:**
```
BL-0101 Create User Authentication Service
- Add Firebase Auth integration
- Create UserManager service class
- Implement session state management
- Add user profile data handling
- Handle sign-out and cleanup
```

## Q&A Management Guidelines

### **When to Add Q&A Sections:**
- When acceptance criteria need clarification
- When technical constraints are unclear
- When dependencies need investigation
- When implementation approach needs discussion

### **Q&A Status Values:**
- **In Progress** - Question is being investigated or discussed
- **Resolved** - Question has been answered and resolved
- **Blocked** - Question is blocked by external dependency
- **Deferred** - Question is deferred to future work

### **Q&A Resolution Process:**
1. Add Q&A section when clarification is needed
2. Update status as work progresses
3. Mark as "Resolved" when question is answered
4. Remove resolved Q&A sections if they're no longer relevant

## Communication Guidelines

### **When Clarification is Needed:**
- Add Q&A section to the relevant backlog item
- Use `---` separators for clear visual boundaries
- Include full context in the question
- Update status as progress is made

### **When Presenting Solutions:**
- Focus on the business value delivered
- Explain technical decisions and trade-offs
- Highlight any limitations or known issues
- Be prepared to iterate based on feedback

### **When Updating Progress:**
- Be specific about what was completed
- Explain any blockers or issues encountered
- Provide context for decisions made
- Keep you informed of significant progress

## Success Metrics

- **Clear Requirements:** All backlog items have unambiguous acceptance criteria
- **Efficient Execution:** Minimal back-and-forth during implementation
- **Quality Delivery:** Solutions meet acceptance criteria and project standards
- **Transparent Progress:** Clear visibility into work status and completion
- **Clean Git History:** Well-documented commits with clear traceability

