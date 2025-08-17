# Linear Initial Configuration

## Backlog Structure in Linear

### Products
- Represent each **Product** (ChatableFW, EatGPT, AIDevOps) initially as a **Custom Field (enum)** called *Product*.  
- Rationale: One shared workflow for now; Products tagged with field values.  
- When workflows are stable and more separation is needed, migrate Products into separate **Teams**.  
- Projects remain available for time-bound initiatives, but Products should not be modeled as Projects.

### Functional Areas
- Use a **Custom Field (single-select enum)** named *Functional Area* for canonical, stable classification.  
  - Values: ChatUI, File Management, Nutrition History, Authentication, etc.  
  - Workspace-wide, applies to all issues.  
- Alternative (lighter-weight): **Labels** with a prefix (`Area:ChatUI`).  
- Governance: Functional Areas are stable; changes require deliberate review.

### Epics & Stories
- Model **Epics** as **parent issues**.  
  - Capture aspirational goals, vision, or large features.  
  - Include rationale and links to related design docs.
  - Epics are the primary focus of grooming efforts.
- Model **Stories** as **child issues** of Epics.  
  - Small, deliverable units of work (1–2 days).  
  - Include acceptance criteria and references.
  - Stories flow through the delivery pipeline.
- Relationship: Epic = "big why", Story = "small what/how".
- When all children of an Epic are completed, the Epic automatically completes.

### Best Practices
- **Templates**: maintain separate templates for Epics (vision/rationale) and Stories (acceptance criteria/deliverables).  
- **Ownership**: keep issues assigned to a single primary owner; use comments, labels, or sub-issues for collaborators.  
- **Cross-cutting work**: if an Issue spans multiple Products, house it in the most natural context and cross-link via labels.  
- **Consistency**: enforce naming conventions (e.g. `[Area] Title`) if not using custom fields.  
- **Projects & Cycles**:
  - Treat **Projects** and **Cycles** as **planning constructs**, not backlog structure.  
    - Projects: time-bound initiatives or feature pushes.  
    - Cycles: sprints or iteration planning.  
  - Keep them separate from the structural backlog hierarchy.  
  - Issues (Stories) can be pulled into Projects or Cycles for execution planning, without affecting their parent Epic.

---

## Workflow

### Backlog group
- **Triage**
  Purpose: Entry + cancellation review.  
  Next: Grooming, Needs Clarification, Deferred, Out of Scope, Duplicate

- **Grooming**
  Purpose: Full refinement/split; add comprehensive AC.  
  Next: Ready for Tasking, Needs Clarification, Deferred, Out of Scope, Duplicate

- **Needs Clarification**
  Purpose: Quick questions/minor spec gaps (not full re-grooming).  
  Next: Ready for Tasking, Grooming, Out of Scope, Duplicate

- **Deferred**
  Purpose: Parked for later (kept out of grooming).  
  Next: Grooming, Out of Scope

---

### Active group
- **Ready for Tasking**
  Purpose: Fully specified; ready to plan.  
  Next: Tasking, Grooming, Triage

- **Tasking** – *Agent*  
  Purpose: Produce explicit task/test plan.  
  Next: Ready for Delivery (success), Tasking Blocked (failure)

- **Tasking Blocked**
  Purpose: Planning failed/blocked; needs operator intervention.  
  Next: Tasking (after operator action), Grooming, Needs Clarification, Triage

- **Ready for Delivery**
  Purpose: Plan approved; ready to implement.  
  Next: Delivering, Grooming, Triage

- **Delivering** – *Agent*  
  Purpose: Implementation.  
  Next: Smoke Testing (success), Delivery Blocked (failure)

- **Delivery Blocked**
  Purpose: Implementation blocked/failed; needs operator intervention.  
  Next: Delivering (after operator action), Grooming, Needs Clarification, Triage

- **Smoke Testing** – *Agent*  
  Purpose: Run standard QA/smoke tests.  
  Next: Final Review (success), Smoke Test Failed (failure)

- **Smoke Test Failed**
  Purpose: Tests failed; needs operator intervention/rework.  
  Next: Delivering (after operator action), Grooming, Needs Clarification, Triage

- **Final Review**
  Purpose: Human/senior validation post-tests.  
  Next: Done, Grooming, Triage

---

### Completed group
- **Done**
  Purpose: Delivered + validated.  
  Next: (terminal)

- **Duplicate**
  Purpose: Closed as dupe.  
  Next: (terminal)

- **Out of Scope**
  Purpose: Won't do.  
  Next: (terminal)

### Workflow Principles
- **Agent States**
  - Some states reflect actions which may be performed by agents: Tasking, Delivering, Smoke Testing
  - These may transition only to success or failure states, where Operators can assess next steps
  - Agent states do **not** move issues to Grooming, Needs Clarification, or Triage
  - No automatic retries - operators must take action to improve success chances before retry

- **Active Operator States**
  - All other states are intended to be performed by human operators
  - May transition to their next happy-path state
  - May return to Grooming if full requirement re-specification is needed
  - May return to Needs Clarification for quick questions or minor gaps
  - May return to Triage if cancellation or other direction is needed/recommended
  - Blocked/Failed states require operator intervention before retry

- **Grooming Focus**
  - Grooming is the crucial operator responsibility
  - Clear requirements from grooming should enable smooth delivery
  - Epics are primarily groomed; Stories are derived and sent through pipeline



## User Configuration and Issue Assignment

### User Accounts
- **Human Operators**: Individual Linear accounts for each human team member
 - Initially one account (founder/operator)
 - Additional human accounts added as team grows
 - Humans maintain issue ownership throughout pipeline

- **Agent Account**: Single shared "AI-Agent" user account
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
*These considerations inform Linear setup but will be implemented in the codebase*

#### Agent Identity & Behavior
- Agents operate through shared "AI-Agent" Linear account via API
- Different agent types (Tasker, Developer, Tester) identified via structured comments
- Agents can only transition to success/failure states, never to Grooming/Triage
- No automatic retries - human operator must intervene and explicitly retry

#### Prompt Management Strategy
- Prompts stored in monorepo under version control (e.g., `/prompts/{state}/{product}.md`)
- Prompt selection based on:
 - Primary: Issue state (tasking, delivering, testing)
 - Secondary: Product custom field (ChatableFW, EatGPT, AIDevOps)
 - Fallback: Default prompt for each state
- Each prompt file includes metadata header indicating the prompt and version used to complete the work

#### Agent Comment Standards
All agent actions MUST produce add comments when updating issues.  All agent issued comments will begin with details about the action being performed (Issue State), prompt/version used, result of action, relevant comments related to the work

This enables:
- Clear distinction between human and agent comments
- Prompt version tracking for debugging/improvement
- Audit trail of which agent type performed which actions

#### API Integration Points
- State transitions triggered by agent completion
- Comment creation with execution results
- Read issue details (description, custom fields) for context
- No direct assignment changes (maintains single owner model)

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
  labels: {
    nodes: [{
      id: String!
      name: String!
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
- `UpdateLabels`: Modifies Issue.labels collection

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
