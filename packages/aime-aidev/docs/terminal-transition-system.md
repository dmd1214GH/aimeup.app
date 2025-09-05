# Terminal Transition System Documentation

## Overview

The Terminal Transition System provides automatic saving of Linear issues when lc-runner operations reach terminal states (Complete, Blocked, or Failed). This system ensures work is never lost and maintains proper workflow state transitions in Linear.

## Key Features

- **Automatic Saves**: Issues are automatically saved to Linear when operations complete
- **Status Transitions**: Each terminal state triggers appropriate Linear status changes
- **Continuous Persistence**: All changes are written to disk immediately
- **Crash Recovery**: Detects and recovers orphaned work from crashed sessions
- **Session End Handling**: Graceful session termination with automatic saves
- **Reversion Capability**: Allows reverting saves to continue editing

## Terminal States and Transitions

### Grooming Operation
- **Complete** → Status: "Ready for Delivery"
  - Triggered when all success criteria are met
  - Requires explicit operator approval
- **Blocked** → Status: "Grooming-BLOCKED"
  - Triggered when operator indicates grooming cannot complete
  - Breakout issues remain unresolved
- **Failed** → Appropriate failure status
  - Pre-operation checks fail
  - Fatal configuration errors

### Delivery Operation
- **Complete** → Status: "Acceptance"
  - All tasks completed successfully
  - Tests pass
  - Acceptance criteria demonstrable
- **Blocked** → Status: "Delivery-BLOCKED"
  - Agent cannot proceed due to missing information
  - Dependencies unavailable
  - Tests fail and cannot be fixed
- **Failed** → Appropriate failure status
  - Pre-operation checks fail
  - Fatal errors prevent continuation

## State Persistence

### .terminal-transition-state File

The system maintains a state file in the working folder with the following structure:

```json
{
  "operation": "Grooming|Delivery",
  "phase": "Current operation phase",
  "terminalTransitionFlag": false,
  "lastFileUpdateTimestamp": "ISO 8601 timestamp",
  "lastLinearSaveTimestamp": "ISO 8601 timestamp"
}
```

### Continuous Persistence Rules

1. **Every Edit**: `updated-issue.md` is written to disk after each modification
2. **Phase Changes**: State file updated when operation phases change
3. **Task Updates**: Immediate persistence of task status changes (Delivery only)
4. **Terminal Transitions**: Flag set to `true` after successful Linear save

## Session End Handling

### Graceful Termination

When a Claude Code session ends normally:

1. SessionEnd hook checks `.terminal-transition-state` file
2. If terminal transition flag is `false`:
   - Compares `updated-issue.md` with `original-issue.md`
   - Checks if file modified after last Linear save
   - Creates timestamped recovery backup
   - Saves to Linear with Blocked status
   - Creates operation report documenting the save

### Hook Configuration

Place the SessionEnd hook script in your Claude Code hooks directory:

```bash
# Example hook invocation
session-end-hook.sh <working-folder> <issue-id> <operation>
```

Or use the TypeScript version:

```bash
tsx session-end-hook.ts <working-folder> <issue-id> <operation>
```

## Crash Recovery

### Detection

On session start, agents check for orphaned work:

1. Look for `.terminal-transition-state` file in working folder
2. Check if terminal transition flag is `false`
3. Compare file timestamps with last save timestamp
4. Detect unsaved changes in `updated-issue.md`

### Recovery Options

When orphaned work is detected:

```
"Found unsaved [operation] work. Would you like to recover and continue?"
```

- **Yes**: Resume operation from saved state
- **No**: Save current state as Blocked to Linear

## Post-Save Session Behavior

### After Successful Terminal Transition

1. **Session Active**: Session remains open for continued work
2. **Code Modifications**: Implementation files can be modified freely
3. **Issue Protection**: `updated-issue.md` protected from inadvertent changes

### Reversion Flow

If operator requests changes to the issue after save:

1. **Detection**: Agent checks terminal transition flag
2. **Offer**: "The issue has already been saved to Linear with [status]. Would you like me to revert the save?"
3. **Reversion Process**:
   - Fetch latest content from Linear via MCP tools
   - Replace local `updated-issue.md`
   - Reset Linear status to operation starting status
   - Clear terminal transition flag
   - Resume normal operations
4. **Multiple Reversions**: Supported within same session

## Operator Commands

### Manual Save Progress

Operators can request interim saves during grooming:

```
"save progress"
"save to Linear"
"checkpoint"
```

This triggers an immediate save without terminal transition.

## Integration with lc-issue-saver

All Linear saves go through the unified lc-issue-saver subagent:

```typescript
// Example invocation
{
  issueId: "AM-68",
  workingFolder: "/path/to/working/folder",
  operation: "Grooming|Delivery",
  action: "Start|Finished|Precheck|etc",
  operationStatus: "InProgress|Complete|Blocked|Failed",
  summary: "Brief summary",
  successStatusTransition: "Ready for Delivery|Acceptance",
  blockedStatusTransition: "Grooming-BLOCKED|Delivery-BLOCKED",
  payload: "Additional details"
}
```

## Configuration

### Status Transition Mapping

Configure in lc-runner config.json:

```json
{
  "statusTransitions": {
    "Grooming": {
      "success": "Ready for Delivery",
      "blocked": "Grooming-BLOCKED",
      "starting": "Grooming"
    },
    "Delivery": {
      "success": "Acceptance",
      "blocked": "Delivery-BLOCKED",
      "starting": "Delivery-ai"
    }
  }
}
```

## Testing

Run the terminal transition tests:

```bash
npm test -- terminal-transition.test.ts
```

Test coverage includes:
- State file management
- Continuous persistence
- Crash recovery detection
- SessionEnd hook scenarios
- Reversion flow
- Status transitions

## Troubleshooting

### Common Issues

1. **State File Missing**
   - Ensure working folder exists
   - Check write permissions
   - Verify agent initialization

2. **Recovery Not Offered**
   - Check terminal transition flag status
   - Verify file timestamps
   - Ensure state file is valid JSON

3. **Reversion Fails**
   - Check Linear API connectivity
   - Verify MCP tools configuration
   - Ensure issue exists in Linear

4. **SessionEnd Hook Not Triggering**
   - Verify hook script permissions
   - Check Claude Code hooks configuration
   - Review hook script logs

### Debug Information

Enable debug logging by checking:
- `.terminal-transition-state` file contents
- Operation report files in working folder
- Recovery backup files with timestamps
- Linear API responses in operation logs

## Best Practices

1. **Always Commit Before Operations**: Ensure clean git status
2. **Monitor State Files**: Check `.terminal-transition-state` for operation status
3. **Review Operation Reports**: Check reports for save confirmations
4. **Test Hooks**: Verify SessionEnd hooks work in your environment
5. **Backup Important Work**: Recovery backups are timestamped for safety

## Migration Guide

For existing lc-runner users:

1. Update grooming and delivery prompts to latest versions
2. Configure SessionEnd hooks if desired
3. Test with non-critical issues first
4. Monitor operation reports for successful saves
5. Verify status transitions match your workflow