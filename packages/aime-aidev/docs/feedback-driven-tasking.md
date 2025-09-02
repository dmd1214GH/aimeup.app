# Feedback-Driven Tasking Architecture

## Core Concept

The tasker agent should receive structured feedback and intelligently decide whether to regenerate or apply targeted fixes.

## Architecture

```
Main Operation
    │
    ├─1. Invoke Validator (possibly Opus/higher model)
    │    └─> Returns detailed feedback JSON
    │
    └─2. Invoke Tasker with feedback
         └─> Tasker decides: regenerate or fix
         └─> Applies feedback as additional success criteria
```

## Feedback Format

```json
{
  "validationResult": {
    "isValid": false,
    "confidence": 0.85,
    "modelUsed": "opus-3"
  },
  "issues": [
    {
      "type": "missing_coverage",
      "severity": "major",
      "location": "acceptance_criteria_3",
      "description": "No tasks address the error handling requirement",
      "suggestion": "Add tasks for error boundary implementation"
    },
    {
      "type": "vague_task",
      "severity": "minor",
      "location": "task_7",
      "description": "Task lacks specific file paths",
      "suggestion": "Specify exact files to modify"
    }
  ],
  "operatorFeedback": {
    "enabled": true,
    "suggestions": [
      "Consider using existing ErrorBoundary component",
      "Task 5 should come before Task 3 due to dependency"
    ]
  },
  "preserveRequests": [
    {
      "taskId": 4,
      "reason": "Human refined this task with domain knowledge"
    }
  ]
}
```

## Tasker Decision Logic

The tasker should analyze feedback and decide:

### Regenerate When:

- Structural issues (missing major requirements)
- Dependency problems affect >30% of tasks
- Confidence score < 0.5
- Operator explicitly requests regeneration

### Apply Fixes When:

- Isolated issues in specific tasks
- Minor clarity/detail problems
- Operator provided specific edits
- High-value tasks marked for preservation

### Hybrid Approach:

- Regenerate structure but preserve marked tasks
- Reorder/renumber but keep content
- Add missing tasks without disturbing valid ones

## Enhanced Success Criteria

When feedback is provided, the tasker adds it to the standard 8 criteria:

### Standard Criteria:

1. Requirements clarity
2. Complete AC coverage
3. Standards compliance
4. Testing included
5. Scope adherence
6. No blockers
7. Self-contained tasks
8. Verifiable results

### Additional Feedback Criteria:

9. **Address all feedback issues** marked major/critical
10. **Incorporate operator suggestions** where valid
11. **Preserve marked content** unless structurally impossible
12. **Validate fixes** against specific feedback points

## Implementation in lc-issue-tasker

```markdown
## Input Parameters

**Optional:**

- `validationFeedback`: Structured feedback from validator or operator

## Decision Process

If validationFeedback provided:

1. Analyze severity distribution
2. Check for preservation requests
3. Evaluate structural integrity
4. Decide approach:
   - Full regeneration
   - Targeted fixes
   - Hybrid preservation

## Success Validation

Include feedback issues in final validation:

- All major issues addressed?
- Operator suggestions incorporated?
- Preserved content maintained?
```

## Benefits of This Approach

### 1. Intelligent Decision Making

- Tasker uses context to decide best approach
- Not forced into binary regenerate/fix choice

### 2. Quality Assurance

- Dedicated validator can be thorough
- Can use higher-tier models for validation
- Separation of concerns

### 3. Human-in-the-Loop

- Operator feedback channel built-in
- Preservation of human value
- Guided improvements

### 4. Iterative Refinement

- Each cycle improves based on specific feedback
- Convergence toward optimal task list
- Learning from what works

## Example Flows

### Flow 1: Minor Issues

```
Validator: "2 minor issues with task clarity"
Tasker: "Applying targeted fixes to tasks 3 and 7"
Result: Quick convergence, minimal disruption
```

### Flow 2: Major Structural Issues

```
Validator: "Missing 40% of AC coverage, dependencies wrong"
Tasker: "Regenerating with feedback as constraints"
Result: Clean slate with lessons learned
```

### Flow 3: Operator Refinement

```
Operator: "Task 5 should use our existing library"
Validator: "Task 5 technically valid but noting operator preference"
Tasker: "Updating task 5 per operator guidance"
Result: Human knowledge incorporated
```

## Future Enhancements

### Model Selection

- Use Haiku for initial generation (fast/cheap)
- Use Sonnet for validation (balanced)
- Use Opus for complex conflict resolution

### Learning System

- Track which feedback leads to successful fixes
- Build patterns of common issues
- Improve decision heuristics over time

### Operator Preferences

- Learn operator's style preferences
- Adapt to project-specific patterns
- Maintain consistency across issues

## Conclusion

By making the tasker feedback-aware and letting it intelligently decide between regeneration and fixes, we get:

1. Better quality through dedicated validation
2. Preservation of human value
3. Flexibility for different scenarios
4. Continuous improvement through feedback loops

The key is **structured feedback** that the tasker can interpret and act upon intelligently.
