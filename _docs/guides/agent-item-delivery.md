# AI Agent Backlog Item Delivery Guide

**Purpose**:
Structured workflow for using AI Agents to deliver backlog items according to a formal process.

Process attempts to solve:

- Agent inconsistency in following the process
- Confusing inputs, improved input assets
- Context compaction in the middle of development

Roles:

- Operator: Human operator / Developer
- Agent: AI Developer Agent

## Setup

Dedicated folder and definition file for the backlog item delivery exists:

```
/_docs
  /delivery
    /BL-XXXX-item-tag    # <-- Dedicated folder
      /BL-XXXX-def.md    # <-- Definition, created & managed by Operator
```

## Phase 1: Groom

Agent / Operator Collaboration to prepare Backlog item for development.

### Groom Input Prompt

```
We are grooming a backlog item according to `Backlog Item Delivery` mode referenced `CLAUDE.md`.  The process is defined in `_docs/guides/agent-item-delivery.md`.

Our objectives
- Ensure this backlog item is clear, reasonably sized, and aligns with technology constraints.
- Raise questions and test assumptions in order to disambiguate the specification
- Collaborate on resolutions to make the backlog item and referenced documents clear and unambiguous.
- Validate assumptions by inspecting monorepo assets

Agent SHALL NOT take mutative actions in this phase other than backlog editing request.

Confirm understanding:
- Restate the objectives and constraints in your own words
- Request the focus backlog item's ID

When Operator provides the backlog item id:
- Locate the backlog item folder within `_docs/delivery/<BL-ID>*`
- Review it and its references
- Present the first round of briefly summarized questions
```

### Groom Operator Instructions

- Start with fresh context
- Refer Agent to backlog item folder
- Critically refine acceptance criteria and supporting design documents until all agree it is ready for development.
- Do not accept or overlook problems, non-clarity or ambiguity.

### Groom Phase Exit Prompt

```
It looks like we are near the end of grooming this item.

As a final check, lets review the grooming exit criteria to make sure we have captured everything correctly.

These are the grooming phase exit criteria. Do you agree we have met all of these?

- All resolutions and assumptions are reflected in official specification:
  - Backlog item acceptance criteria
  - Referenced design documents
- Acceptance criteria are:
  - Clear and unambiguously defined
  - Specification Will survive across a context reset
  - Demonstrable to the Operator in a showcase
- Required assets are clearly identified within the monorepo, or are marked "to be created" in the specification

Once confirmed, agent shall create or augment the Grooming Status of the backlog item definition according to this format:
- ## Grooming Status
- Status: Grooming, Ready for Tasking, Blocked, etc. (informal)
- ### Open Questions
- ### What changed during grooming

Once Operator and Agent agree that everything is set, context should reset before tasking.  Grooming related stories within this context might be useful in some cases.  Resolve together.
```

## Phase 2: Task

Agent creates and manages task list. Operator supports, oversees, and approves.

### Task Input Prompt:

```
We are tasking a backlog item according to `Backlog Item Delivery` mode referenced `CLAUDE.md`.  The process is defined in `_docs/guides/agent-item-delivery.md`.

Our objectives:
- List and sequence all tasks required to deliver the acceptance criteria, including, but not limited to (Setup, coding, testing, documentation, demonstration, and anything else)
- Clarify and disambiguate any remaining questions.  Stop tasking if large questions are uncovered
- Include `_docs/guides/steps-of-doneness.md` when tasking
- Validate required tasks by inspecting monorepos
- Generate a comprehensive task list in this format
  ## Task list for BL-XXXX
  1. [] Task 1
    - Task 1 component 1.1
    - Task 1 component 1.N
  2. [] Task 2
  N. [] Task N
    - Task N component N

Confirm understanding:
- Restate the objectives and constraints in your own words
- Request the focus backlog item's ID

When Operator provides the backlog item id:
- Locate the backlog item folder within `_docs/delivery/<BL-ID>*`
- Backlog definition file should be located in that folder with '<BL-ID>-def.md'
- Task list will be appended or updated in that file
- Review the definition and its references
- Present the first round of briefly summarized questions
```

### Task Operator Instructions

- Re-refer Agent to relevant backlog file and specific item(s), as context will have been rest.
- Collaborate to build a comprehensive task list Agent will work through independently. Be diligent in reviewing thoroughly. Ensure all work is accounted for, especially the non-dev work.
- If the story changes substantially during the tasking process, make the required adjustments and reset context before starting again

### Task Phase Exit

```
Task Phase Exit Criteria include:
- Tasks are defined to deliver all acceptance criteria
- Tasks ensure compliance with:
  - `_docs/guides/mono-repo.md`
  - `_docs/guides/automated-testing.md`
  - `_docs/guides/development-standards.md`
  - `_docs/guides/steps-of-doneness.md`
- Automated testing tasks are included for both positive and negative conditions where feasible
- Tasks do not do things beyond explicit AC scope

If so, we can move on to dev, but don't start until I say go.
```

## Phase 3: Deliver

Agent codes and tests the required functionality.

### Deliver Input Prompt

```
We are preparing to begin the 'DeliveryRun' for this backlog item.

Acknowledge your understanding and prioritization of these `prime development directives` before we begin:
1. Agent will complete the task list with maximal autonomy to deliver the backlog item
2. Agent will update task status:
  - Update task status as it changes, not in batches
  - Update to [O] (In Progress) when a task is started
  - Update to [X] (Done) only after verifying that the task as been fully completed
  - Update to [-] (Blocked) if the task is determined to be blocked, or depends on a previously blocked task
  - Update to [D] (Deletion recommended) if the task is determined to no longer be needed
  - When updating to [-] Blocked or [D] Deletion recommended, capture the reason and recommendation according to the example
3. **When encountering errors or issues:**
  - If you can fix it, fix it immediately and continue
  - Agent should exhaust all reasonable options to solve issues before considering a task to be blocked.
  - If you cannot find a standards-compliant solution within 5 attempts, determine the task to be BLOCKED
4. If a task is determined to be BLOCKED:
  - Update the task status as specified
  - Move on to non-blocked tasks
5. Do not start a task that is known to be BLOCKED by other BLOCKED tasks.  Instead, determine the task to be BLOCKED with a reason of "Blocked by Task X"
6. When continuing work after operator intervention:
  - Guide operator to clearing all known blockers, updating task status as blockers are cleared
  - When no known blockers remain in the task status, resume the DeliveryRun with maximal autonomy after confirming with Operator.
7. Never commit to git.  Operator will do this after accepting delivery.
8. Stick to established patterns in the codebase and standards defined in `_docs/guides/development-standards.md`.  If a conflict arises, consider the task to be blocked.

Task status examples:
## Task list for BL-XXXX
1. [] Task 1
  - Task 1 component 1.1
  - Task 1 component 1.2
2. [-] Task 2 (BLOCKED example)
  - Task 2 component
  - BLOCKED: ALWAYS add reason and proposed resolution for BLOCKED items
3. [D] Task 3 (DELETE example)
  - Task 3 component
  - DELETE: : ALWAYS add reason for DELETE proposals
4. [X] Task 4 (DONE example)
N. [] Task N

```

### Deliver Operator Instructions

- Ensure Agent understanding and prioritization of these directives
- Monitor progress through agent output and task list updates
- Support agent in unblocking as needed
- Watch for agent to report completion
- Run `aimequal` and insist on a clean run before moving to exit

### Deliver Phase Exit

```
You have reported that all tasks to deliver this backlog item has completed.  I have run a valid aimequal.

Delivery phase exit criteria include the following. Do you agree we have met these?
- Agent affirms all work has been done
- Operator has executed aimequal successfully and does a quick spot-check
- Code is in a committable state
- Agent affirms readiness to showcase the work
- Agent creates or adds Delivery Status section in the backlog item definition providing details file:
  - ## Delivery Status
  - Status: <> In progress, In review, Accepted, Blocked, Failed, etc. (informal)
  - ### Compromises or shortcuts
  - ### Unexpected variations from expectations (+ or -)
  - ### Technical debt delta or recommendations (+ or -)
  - ### Feedback on development process (+ or -)
  - ### Deferred or revealed future work (if any)
- Agent must not perform git operations

```

## Phase 4: Showcase & Retrospective

Operator reviews and accepts the work.

### Showcase Initial Prompt:

```
Let's begin the showcase. I will update the status of the AC's as we go.  Do you have any recommendation about where to start?
```

### Operator Instructions

- Guide Agent through the most critical AC's first.
- Be critical and thorough in acceptance, but also respect scope boundaries, and record new backlog items or ACs for sticky issues
- Reflect on the process and update this document if improvements might be realized.

### Showcase Phase Exit

- Capture improvable conversations in a retrospective document
- AC's are accurately statused
- Residual or newly discovered work has been recorded in the backlog.

```
I accept this backlog item as DONE!

Showcase phase exit criteria include the following. Do you agree we have met these?
- All criteria have been marked as complete or have been removed from the backlog item's list
- Code is in a committable state
- Agent made updates to the "Delivery Status" report if any new information was revealed in the showcase, especially focus on critical process feedback.

```
