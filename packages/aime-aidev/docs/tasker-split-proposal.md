# Task List Validation Split Proposal

## Current Architecture (All-in-one)

The `lc-issue-tasker` subagent currently handles both:

1. Validating existing task lists
2. Generating new task lists

## Proposed Split Architecture

### New Subagent: `lc-task-validator`

**Purpose**: Validate existing task lists against the 8 success criteria

**Responsibilities**:

- Read issue from `<workingFolder>/updated-issue.md`
- Check if `## Task List` section exists
- If exists, validate against all 8 criteria:
  1. Requirements clarity
  2. Complete coverage of ACs
  3. Standards compliance
  4. Testing included
  5. Scope adherence
  6. No blockers
  7. Self-contained tasks
  8. Verifiable results
- Return detailed validation report

**Response Format**:

```json
{
  "status": "valid|invalid|missing",
  "taskListExists": true|false,
  "validationResults": {
    "requirementsClarity": "pass|fail",
    "completeCoverage": "pass|fail",
    "standardsCompliance": "pass|fail",
    "testingIncluded": "pass|fail",
    "scopeAdherence": "pass|fail",
    "noBlockers": "pass|fail",
    "selfContainedTasks": "pass|fail",
    "verifiableResults": "pass|fail"
  },
  "failureReasons": ["reason1", "reason2"],
  "summary": "Detailed validation summary"
}
```

### Modified: `lc-issue-tasker`

**Purpose**: ONLY generate new task lists (no validation of existing)

**Remove these sections**:

1. "Check for Existing Task List" logic
2. Validation of existing task lists
3. Decision logic about regenerating vs keeping

**Keep these sections**:

1. Generate new task lists from scratch
2. Codebase exploration
3. Success criteria awareness (for generation)
4. Assumptions and blocking questions handling
5. File writing

## Master Operation Loop Pattern

```
Main Operation (has Task tool)
│
├─1. Invoke lc-task-validator
│    └─> Returns: missing|invalid|valid
│
├─2. If invalid/missing:
│    └─> Invoke lc-issue-tasker
│        └─> Generates new task list
│
├─3. Invoke lc-task-validator again
│    └─> Verify new task list is valid
│
└─4. If still invalid (max 2 attempts):
     └─> Return Blocked status with details
```

## Benefits

1. **Clear Separation of Concerns**
   - Validator: checks quality
   - Tasker: creates content

2. **Iterative Refinement**
   - Can validate → regenerate → validate
   - Catches edge cases

3. **Better Error Handling**
   - Know exactly why task list failed
   - Can retry with specific improvements

4. **Simpler Subagents**
   - Each does one thing well
   - Easier to test and maintain

## Implementation Steps

1. Create new `lc-task-validator.md` subagent
2. Remove validation logic from `lc-issue-tasker.md`
3. Update main operation to use both subagents
4. Test the loop pattern with various scenarios

## Edge Cases Handled

- Empty task list
- Partially valid task list
- Task list missing key sections
- Ambiguous requirements
- Infinite loop prevention (max 2 generation attempts)
