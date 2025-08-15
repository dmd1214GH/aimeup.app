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
      /BL-XXXX-tasks.md  # <-- Task list, created later & managed by Agent
```

## Phase 1: Groom

Agent / Operator Collaboration to prepare Backlog item for development.

### Groom Input Prompt

```
We are going to groom a backlog item according to `Backlog Item Delivery` mode defined in `CLAUDE.md`.  We need to make sure this backlog item is clear, reasonably sized, and aligns with the technical solution.  You are expected to ensure that all questions have been answered and codified in the acceptance criteria of supporting documentation during this phase.  Do not take any action to modify runtime code in this phase. Confirm your understanding by asking Operator for the BL-ID, then locate the backlog item folder and prepare questions.  The Backlog Item folder will be located in `_docs/delivery/<BL-ID>*`
```

### Groom Operator Instructions

- Start with fresh context
- Refer Agent to backlog item folder
- Critically refine acceptance criteria and supporting design documents until all agree it is ready for development.
- Do not accept or overlook problems, non-clarity or ambiguity.

### Groom Phase Exit

```text
Do you have any remaining requirement questions which we should apply to the ACs, assumptions, or design docs to make things more clear or explicit?  We need to prepare for doing this work without the context you just gained.

Grooming phase exit criteria include the following. Do you agree we have met these?
- Collaborated resolution on the item's clarity, scope, and size.
- All assets referenced exist or are marked "to be created"
- All file paths and folder names are explicit
- Success/failure criteria are measurable
- Relevant pre-existing conditions are documented as assumptions
- Agent creates or adds Grooming Status section:
  - ## Grooming Status
  - Status: <> Grooming, Ready for Tasking, Blocked, etc. (informal)
  - ### Questions
  - ### What was changed in grooming

```

**\*NOTE**: Check-in code and **reset context** between Design and Tasking to clear possible pre-readiness confusion.\*

## Phase 2: Task

Agent creates and manages task list. Operator supports, oversees, and approves.

### Task Input Prompt:

```
We need to "task" **this** backlog item according to `Backlog Item Delivery` mode defined in `CLAUDE.md`. You will list and sequence all tasks required to meet the acceptance criteria -- including setup, dev, tests, documentation, demonstration, and anything else.  Remember, everything must be tested before claiming the work is done. Your task list will be stored in the backlog item folder as /BL-XXXX-tasks.md using this format:

# Task list for BL-XXXX
1. [] Task 1
  - Task 1 component 1.1
  - Task 1 component 1.2
2. [] Task 2
N. [] Task N
  - Task N component N

Confirm your understanding by asking Operator for the BL-ID, then locate the backlog item folder and prepare questions.  The Backlog Item folder will be located in `_docs/delivery/<BL-ID>*`
```

### Task Operator Instructions

- Re-refer Agent to relevant backlog file and specific item(s), as context will have been rest.
- Collaborate to build a comprehensive task list Agent will work through independently. Be diligent in reviewing thoroughly. Ensure all work is accounted for, especially the non-dev work.
- If the story changes substantially during the tasking process, make the required adjustments and reset context before starting again

### Task Phase Exit
```
The task list looks good to me.  Task Phase Exit Criteria include:
- Tasks are defined to deliver all acceptance criteria
- Tasks ensure compliance with:
  - `_docs/guides/mono-repo.md`
  - `_docs/guides/automated-testing.md`
  - `_docs/guides/development-standards.md`
  - `_docs/guides/steps-of-doneness.md`
- Testing tasks are included for both positive and negative conditions where feasible
- Tasks do not do things beyond explicit AC scope

If so, we can move on to dev, but don't start until I say go.
```

## Phase 3: Deliver

Agent codes and tests the required functionality.

### Deliver Input Prompt

```
Acknowledge your understanding and prioritization of these `prime development directives` before we begin:
1. Never agree to begin a long running task list until all questions are adequately resolved in the backlog item definition: acceptance criteria, task list, design documentation, steps of doneness
2. Update task list after completing each task, not in batches
3. Report status accurately and honestly (key: `[X]`=Done, `[O]`=In Progress, `[-]`=Blocked, `[D]`=Deleted/Not Needed)
4. If a solution requires more than 3 attempts, indicate the task as blocked with `[-]`.
5. When a task is blocked, move on to other tasks that are not impacted by the blockage.  Pause to ask for human guidance when all work is blocked.
6. Never commit to git.  Human will do this after accepting delivery.
6. Stick to established patterns in the codebase and standards defined in `_docs/guides/development-standards.md`.  If a conflict arises, consider the task to be blocked.

Task status examples:
# Task list for BL-XXXX
1. [] Task 1
  - Task 1 component 1.1
  - Task 1 component 1.2
2. [-] Task 2 (BLOCKED example)
  - Task 2 component
  - BLOCKED: Blocking reason and proposed resolution
3. [D] Task 3 (DELETE example)
  - Task 3 component
  - DELETE: Delete recommendation reason
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

- Agent reports done
- Operator executes aimequal successfully and does a quick spot-check

```
You have reported that all tasks to deliver this backlog item has completed.  I have run a valid aimequal.

Delivery phase exit criteria include the following. Do you agree we have met these?
- Agent affirms all work has been done
- Agent has revealed any compromises made through the delivery process
- Operator executes aimequal successfully and does a quick spot-check
- Code is in a committable state
- Agent creates or adds Delivery Status section in the backlog item definition file:
  - ## Delivery Status 
  - Status: <> In progress, In review, Accepted, Blocked, Failed, etc. (informal)
  - ### Compromises or shortcuts
  - ### Unexpected variations from expectations (positive or negative)
  - ### Technical debt delta or recommendations
  - ### Feedback on development process
  - ### Deferred work (if any)


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
- Agent creates makes updates to the backlog item definition "Delivery Status" section if any new information was revealed in the showcase, especially focus on critical process feedback.

```
