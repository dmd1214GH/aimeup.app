# Linear Initial Configuration
Version 1.0

*Note: This document addresses structural setup of the Linear workspace. Operational considerations such as SLA/SLO, backlog grooming cadence, and workflow metrics are beyond the scope of this initial configuration and will be established based on operational experience.*

## Backlog Structure in Linear

### Products
- Represent each **Product** (ChatableFW, EatGPT, AIDevOps) initially as a **Labels (PRD:Chatable, etc)** called *Product*.  
- Rationale: One shared workflow for now; Products tagged with field values.  
- When workflows are stable and more separation is needed, migrate Products into separate **Teams**.  
- Projects remain available for time-bound initiatives, but Products should not be modeled as Projects.

### Functional Areas
- Use a **Custom Field (single-select enum)** named *Functional Area* for canonical, stable classification.  
  - Values: ChatUI, File Management, Nutrition History, Authentication, etc.  
  - Workspace-wide, applies to all issues.  
- Governance: Functional Areas are stable; changes require deliberate review.

### Epics & Stories
- Model **Epics** as **parent issues**.  
  - Capture aspirational goals, vision, or large features.  
  - Include rationale and links to related design docs.
  - Epics are the primary focus of grooming efforts.
  - **Epics are not directly worked on** - work happens through their child Stories.
  - Owners manually close Epics when all children are complete (no automation required).
- Model **Stories** as **child issues** of Epics.  
  - Small, deliverable units of work (1–2 days).  
  - Include acceptance criteria and references.  
  - Stories flow through the delivery pipeline.
- **Epic State Management**
  - Epic state changes do NOT automatically cascade to children
  - When moving Epic to terminal states (Out of Scope, Duplicate):
    - Operator must explicitly handle all child Stories
    - Either move children to same terminal state
    - Or re-parent children to different Epic if work continues
  - Active children under terminal Epics are considered orphaned and should be resolved

### Best Practices
- **Templates**: maintain separate templates for Epics (vision/rationale) and Stories (acceptance criteria/deliverables).  
- **Ownership**: keep issues assigned to a single primary owner; use comments or sub-issues for collaborators.  
- **Cross-cutting work**: if an Issue spans multiple Products, house it in the most natural context and cross-link.  
- **Consistency**: enforce naming conventions (e.g. `[Area] Title`) if not using custom fields.  
- **Projects & Cycles**:
  - Treat **Projects** and **Cycles** as **planning constructs**, not backlog structure.  
    - Projects: time-bound initiatives or feature pushes.  
    - Cycles: sprints or iteration planning.  
  - Keep them separate from the structural backlog hierarchy.  
  - Issues (Stories) can be pulled into Projects or Cycles for execution planning, without affecting their parent Epic.
- As there is not way to switch the template used for an issue, unfortunate overhead might be required to promote stories to epics.

### Operational Flexibility
- **Human operators are not confined by this structure** and may expedite issues, skip states, or handle emergency requests as needed.
- The workflow provides guardrails and standard paths but does not prevent operators from using judgment.
- Risk: Bypassing standard workflow may reduce traceability and skip quality gates.

### Issue Relationships

#### Dependency Management
- Use **"blocks/blocked by"** relationships to capture execution dependencies between Stories
- Dependencies are actionable constraints that affect grooming order and delivery sequencing
- Avoid "related" relationships unless there's no directional dependency

#### Dependency Patterns
**Within Epics**: Model natural execution order between sibling Stories
- Foundation stories block dependent stories
- Parallel work has no blocking relationships
- Example: "Design schema" blocks "Implement API" blocks both "Add UI" and "Add tests"

**Cross-Epic Dependencies**: Capture when Stories in one Epic block progress in another
- Common with shared infrastructure (ChatableFW blocks EatGPT features)
- Critical for coordinating Product delivery timelines
- Helps identify which Epics should be prioritized for grooming

**Epic-Level Implications**:
- Epics themselves don't require specifying their blocking relationships (they're visions, not executions). They are not used to form the delivery pipeline.  Operator may use them to sequence backlog management, but these are only informational statuses.
- Epic grooming priority influenced by child Story dependencies
- An Epic with many outbound blocking dependencies should be groomed first
- Epic completion naturally unblocks dependent work in other Epics

#### Operational Usage
- **During Grooming**: Review blocking dependencies before detailed specification
- **Before Tasking**: Verify all blocking issues are in "Done" state
- **In Pipeline**: Blocked stories should not enter "Ready for Tasking" until unblocked
- **For Planning**: Use dependency view to identify critical path through backlog

---

## Workflow

*Note: "Triage" as used here refers to initial issue review and routing, distinct from Linear's Triage inbox feature for external submissions.*

### Backlog group
- **Triage**
  Purpose: Entry + cancellation review.  
  Next: Grooming, Needs Clarification, Deferred, Out of Scope, Duplicate

- **Grooming**
  Purpose: Full refinement/split; add comprehensive AC.  
  Next: Ready for Tasking, Needs Clarification, Deferred, Out of Scope, Duplicate

- **Needs Clarification**
  Purpose: Quick questions/minor spec gaps.  
  Next: Ready for Tasking, Grooming, Out of Scope, Duplicate

- **Deferred**
  Purpose: Parked for later.  
  Next: Grooming, Out of Scope

---

### Active group
- **Ready for Tasking**
  Purpose: Fully specified; ready to plan.  
  Next: Tasking, Grooming, Needs Clarification

- **Tasking** – *Agent*  
  Purpose: Produce explicit task/test plan.  
  Next: Ready for Delivery, Tasking Blocked

- **Tasking Blocked**
  Purpose: Planning failed/blocked; needs operator intervention.  
  Next: Tasking, Needs Clarification

- **Ready for Delivery**
  Purpose: Plan approved; ready to implement.  
  Next: Delivering, Needs Clarification

- **Delivering** – *Agent*  
  Purpose: Implementation.  
  Next: Smoke Testing, Delivery Blocked

- **Delivery Blocked**
  Purpose: Implementation blocked/failed; needs operator intervention.  
  Next: Tasking, Needs Clarification

- **Smoke Testing** – *Agent*  
  Purpose: Run standard QA/smoke tests.  
  Next: Final Review, Smoke Test Failed

- **Smoke Test Failed**
  Purpose: Tests failed; needs operator intervention/rework.  
  Next: Tasking, Needs Clarification

- **Final Review**
  Purpose: Human/senior validation post-tests.  
  Next: Done, Needs Clarification, Tasking
  Note: Bugs found here either become refined AC (delivery rejected) or new issues (delivery accepted).

---

### Completed group
- **Done**
  Purpose: Delivered + validated.  
  Next: terminal

- **Duplicate**
  Purpose: Closed as dupe.  
  Next: terminal

- **Out of Scope**
  Purpose: Won't do.  
  Next: terminal

### Workflow Principles
- **Agent States**
  - Some states reflect actions which may be performed by agents: Tasking, Delivering, Smoke Testing
  - These may transition only to success or failure states, where Operators can assess next steps
  - Agent states do **ONLY** move issues specific success or failure statuses
  - No automatic retries - operators must take action to improve success chances before retry

- **Active Operator States**
  - All other states are intended to be performed by human operators
  - May transition to their next happy-path state
  - May return to Grooming if full requirement re-specification is needed
  - May return to Needs Clarification for questions or minor gaps
  - Blocked/Failed states require operator intervention before retry
  - **Operators always intervene with Agent failures** and are responsible for resolution

- **Grooming Focus**
  - Grooming is the crucial operator responsibility
  - Clear requirements from grooming should enable smooth delivery
  - Epics are primarily groomed; Stories are derived and sent through pipeline

---

## User Configuration and Issue Assignment

### User Accounts
- **Human Operators**: Individual Linear accounts for each human team member
  - Initially one account (founder/operator)
  - Additional human accounts added as team grows
  - Humans maintain issue ownership throughout pipeline

- **Agent Account**: 
  - Short term, share the single operator's account
  - Longer term (as human teammates are added): Single shared "AI-Agent" user account for all agents
  - All automated agents share this account to minimize licensing costs
  - Generates distinct API token for programmatic access
  - Agent actions distinguishable from human actions in audit trail

### Assignment Philosophy
- **Single Owner Model**: Issues remain assigned to one human throughout entire pipeline
  - Owner is accountable for delivery even when agents are executing tasks
  - No reassignment during state transitions (avoids ownership ambiguity)
  - Owner monitors blocked/failed states and intervenes as needed

- **Agent Activity Tracking**: Agent participation tracked via:
  - Current state (Tasking, Delivering, Smoke Testing indicate agent activity)
  - Structured comments with agent identification and metadata
  - State transitions to blocked/failed states signal need for owner intervention

### Implementation Requirements
- Generate separate API tokens for human and agent accounts
- Establish comment conventions for agent actions (see Future Agent Framework)
- Configure Linear permissions to allow API-driven state transitions and comments
- No custom fields needed specifically for agent tracking (state + comments sufficient)

---

## Future Agent Framework Considerations

### Agent Integration Architecture
*These considerations inform Linear setup but will be implemented in the codebase as the sole result of this specification*

#### Agent Identity & Behavior
- Agents operate through shared "AI-Agent" Linear account via API
- Different agent types (Tasker, Developer, Tester) identified via structured comments
- Agents can only transition to success/failure states, never to Grooming/Triage
- No automatic retries - human operator must intervene and explicitly retry

#### Prompt Management Strategy
- Prompts stored in monorepo under version control (e.g., `/prompts/{state}/{product}.md`)
- Prompt selection based on:
  - Primary: Issue state (tasking, delivering, testing)
  - Secondary: Product Label field (e.g. ChatablePRD, etc)
  - Fallback: Default prompt for each state
- Each prompt file includes metadata header indicating the prompt and version used to complete the work

#### Agent Comment Standards
All agent actions MUST produce comments when updating issues. All agent-issued comments will begin with details about the action being performed (Issue State), prompt/version used, result of action, and relevant comments related to the work.

This enables:
- Clear distinction between human and agent comments
- Prompt version tracking for debugging/improvement
- Audit trail of which agent type performed which actions

#### API Integration Points
- State transitions triggered by agent completion
- Comment creation with execution results
- Read issue details (description, custom fields) for context
- No direct assignment changes (maintains single owner model)

### Issue Action Selection

#### Dependency-Aware Sequencing
The agent framework will leverage Linear's blocking relationships to:
- **Query only unblocked work**: Filter issues where all blocking dependencies are "Done"
- **Prioritize by downstream impact**: Prefer issues that unblock the most other work
- **Prevent wasted cycles**: Never attempt work with unmet dependencies

#### Implementation Validation
Linear provides all necessary primitives via API:
- Query blocking relationships through `relations` field
- Filter issues by state and blocked status
- Calculate dependency chains for optimal ordering

#### Selection Algorithm (Conceptual)
1. **Fetch candidate issues** in "Ready for Tasking" state
2. **Filter out blocked issues** where any blocker.state != "Done"
3. **Score by unblocking potential** (count of issues this would unblock)
4. **Consider Product priority** 
5. **Select highest score** for agent execution

#### Protection Mechanisms
- Agents cannot override dependency constraints
- Blocked issues remain invisible to agent selection
- Operators can manually override if dependencies are soft/outdated
- Failed deliveries don't cascade to blocked dependent issues

#### Epic Consideration for Agents
- Agents work on Stories, never directly on Epics
- Epic's child Stories inherit any cross-Epic blocking relationships
- When all child Stories complete, Epic completion unblocks dependent Epics' children
- Agent selection naturally respects Epic-level strategic dependencies through Story-level blocks

This approach ensures agents work on the right things in the right order without requiring complex orchestration logic.

### Scaling Considerations
- Current setup supports 1-3 agent types without additional Linear users
- Product-specific prompts can be added without Linear changes
- If agent specialization increases, may need individual agent accounts
- Metrics/reporting on agent performance can be extracted from comments

### Expected Linear API Dependencies

*Data structures required for agent operations in the Linear GraphQL API*

#### Issue Object Structure
Used by: GetIssue query, IssueUpdate mutation responses

```
Issue {
  id: String!
  title: String!
  description: String
  state: {
    id: String!
    name: String!
    type: String!  # "backlog", "unstarted", "started", "completed", "canceled"
  }
  assignee: {
    id: String!
    name: String!
    email: String
  }
  parent: {
    id: String!
    title: String!
  }
  children: {
    nodes: [{
      id: String!
      title: String!
      state: {
        name: String!
      }
    }]
  }
  customFields: {
    nodes: [{
      id: String!
      name: String!        # "Product", "Functional Area"
      value: String        # "ChatableFW", "EatGPT", "AIDevOps"
      type: String!        # "text", "number", "select", "date"
    }]
  }
}
```

#### Comment Object Structure
Used by: CommentCreate mutation

```
Comment {
  id: String!
  body: String!          # Markdown supported
  createdAt: DateTime!
  user: {
    id: String!
    name: String!
  }
  issue: {
    id: String!
  }
}
```

#### WorkflowState Object Structure
Used by: GetWorkflowStates query, state transitions

```
WorkflowState {
  id: String!
  name: String!          # "Triage", "Grooming", "Tasking", etc.
  type: String!          # "backlog", "unstarted", "started", "completed", "canceled"
  position: Float!       # Order in workflow
  description: String
}
```

#### Team Object Structure
Used by: GetWorkflowStates query

```
Team {
  id: String!
  name: String!
  key: String!           # Team identifier (e.g., "ENG")
  states: {
    nodes: [WorkflowState]
  }
}
```

#### CustomField Definition Structure
Used by: Workspace custom field configuration

```
CustomField {
  id: String!
  name: String!          # "Product", "Functional Area"
  type: String!          # "text", "select", etc.
  options: [{            # For select/enum types only
    id: String!
    value: String!       # "ChatableFW", "EatGPT", "AIDevOps"
    position: Float!
  }]
}
```

#### API Operation Mapping

**Read Operations:**
- `GetIssue`: Fetches complete Issue object with nested relations
- `GetWorkflowStates`: Fetches Team object with available WorkflowStates

**Write Operations:**
- `TransitionIssueState`: Updates Issue.state, returns updated Issue
- `AddComment`: Creates Comment object linked to Issue
- `UpdateCustomField`: Modifies Issue.customFields values

#### Agent-Specific Data Patterns

**Agent Comment Structure** (convention within Comment.body):
```
**[AGENT-{TYPE}]** {Action}

{Output/Results}

---
_Agent: {type} | Prompt: {id} v{version} | Execution: {timestamp}_
```

**Custom Field Values for Prompt Selection:**
- Product: "ChatableFW" | "EatGPT" | "AIDevOps"
- Functional Area: "ChatUI" | "File Management" | "Authentication" | etc.

**State Names for Agent Transitions:**
- Agent Success States: "Ready for Delivery", "Smoke Testing", "Final Review"
- Agent Failure States: "Tasking Blocked", "Delivery Blocked", "Smoke Test Failed"