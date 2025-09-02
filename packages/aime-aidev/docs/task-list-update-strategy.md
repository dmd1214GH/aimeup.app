# Task List Update Strategy Recommendation

## Current State

The `lc-issue-tasker` currently does full regeneration if any flaw is found in existing task lists.

## Recommendation: Severity-Based Approach

### With Planned Validator Agent

The validator agent should categorize issues by severity:

```json
{
  "status": "invalid",
  "severity": "minor|major|structural",
  "issues": [
    {
      "taskNumber": 3,
      "criterion": "testingIncluded",
      "severity": "minor",
      "fix": "Add test specification"
    },
    {
      "criterion": "requirementsClarity",
      "severity": "structural",
      "fix": "Requirements too ambiguous to task"
    }
  ]
}
```

### Update Strategy by Severity

#### Minor Issues (Targeted Fix)

**When**: 1-2 specific tasks fail criteria
**Examples**:

- Missing test coverage in specific task
- Task needs more specific file path
- Missing sub-bullet detail

**Action**: Update only affected tasks

#### Major Issues (Regeneration Recommended)

**When**: 3+ tasks fail OR critical criteria fail
**Examples**:

- Multiple tasks out of scope
- Significant gaps in AC coverage
- Dependencies incorrect

**Action**: Full regeneration with notes about what failed

#### Structural Issues (Regeneration Required)

**When**: Fundamental problems with requirements/structure
**Examples**:

- Requirements ambiguous
- Missing acceptance criteria
- Blocking questions exist

**Action**: Cannot fix tasks - need requirement clarification first

## Implementation Phases

### Phase 1: Current (Full Regeneration)

- Keep current approach
- Simple and predictable
- Good for initial deployment

### Phase 2: Add Validator Agent

- Validator provides detailed feedback
- Tasker still does full regeneration
- Collect data on common issues

### Phase 3: Intelligent Updates

- Implement severity detection
- Add targeted fix capability
- Use validator feedback effectively

## Benefits of Phased Approach

1. **Start simple** - Get working system first
2. **Learn patterns** - Understand common failures
3. **Gradual complexity** - Add intelligence over time
4. **Data-driven** - Use real usage to guide design

## Edge Cases to Consider

### Preserve Human Edits

If task list has manual edits (detected how?):

- Flag for human review before regeneration
- Or preserve edited tasks if they pass validation

### Iteration Limits

After 2 regeneration attempts:

- Switch to targeted fixes only
- Or escalate to human review

### Partial Validity

If 80% of tasks are valid:

- Consider targeted fixes first
- Full regeneration as last resort

## Conclusion

**For now**: Keep full regeneration (simpler, cleaner)

**Future**: Move to severity-based approach once validator agent provides structured feedback

**Key principle**: The validator and tasker agents should work together, with the validator providing actionable feedback that the tasker can use intelligently.
