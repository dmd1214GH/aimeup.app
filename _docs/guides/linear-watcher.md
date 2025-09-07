# linear-watcher

Custom tool designed to watch linear activity and initiate ClaudeCode agents to refine Issues and deliver functionality.

## Working Folder

At install time, a working folder is established into the workspace:
`./.linear-watcher`
This is the runtime folder used by the linear-watcher framework

```bash
/aimeup                                 # package root
  /.linear-watcher                      # .gitignore
    /prompts                            # Deployment target for all prompts. Packages install here for ic-runner to use
    /config.json                        # config file
    /work                               # Default location for the work folder
      /lcr-<linearid>                   # each issue processed gets a dedicted work folder
        /issue-operation-log.md         # High-level log that is appended to as operations are performed
        /op-<operation>-YYYYMMDDHHMMSS  # Each operation attempt gets a dedicated folder
          /master-prompt.md     # Merged prompt constructed for the operation run
          /original-issue.md # Issue body before being processed by the operation
          /updated-issue.md  # Issue body after updates were performed by the operation
          /-comment-<X>.md    # comments to be added to the issue, sequenced if multiple
          /context-dump.md              # CC's context dump at the end of its operation
          /operation-report.json        # Small json showing ClaudeCode's opinion about the status of the run
```

## lc-runner

This command-line tool (lc-runner) automates execution of predefined workflows based on Linear issue status. When a developer provides an issue ID, the tool checks its status, maps it to a configured command, prepares a run folder, and invokes Claude Code in headless mode. It persists execution context and updates Linear with success or failure.

It can support these operations:

- `Grooming` - Prepare and refine Issues that are in the state of `Grooming`
- `Delivery` - Develop the code required to deliver the Issue's specified functionality for issues in the state of `Delivery-ai`. This operation now includes integrated task list generation via the lc-issue-tasker subagent.

## Issue Status Workflow in Linear

Explains the exact statuses used in Linear. This solution maps AI Operations to certain statuses (Grooming, Delivering)

### Backlog
- **Triage**: 
  - transitions to **Grooming**, **Icebox**
- **Icebox**: transitions to **Grooming**

### Unstarted
- **Concepting**:
  - For Epics
  - Exploring idea, clarifying problem/opportunity, laying out requirements and delivery plan

- **Planning**:
  - For Epics
  - defining MVP scope, creating child Delivery issues, splitting off future scope.

- **Grooming**: 
  - Defining issues for Delivery.
  - AI assisted through lc-runner
  - transitions to **Delivery-ai**, **Icebox**
- **Delivery-Ready**: 
  - Optional holding status for defined issues that are ready for delivery
  - transitions to **Delivery-ai**, **Grooming**

### Started
- **Delivery**: 
  - Human-executed delivery
  - transitions: **Acceptance**, **Delivery-BLOCKED**
- **Delivery-ai**: 
  - AI Executed (includes task generation)
  - transitions: **Acceptance**, **Delivery-BLOCKED**
- **Delivery-BLOCKED**: 
  - transitions: **Grooming**, TODO: Restarting automated delivery requires definition
- **Acceptance**: 
  - transitions: **Done**, TODO: Restarting automated delivery requires definition

### Completed
- **Done**: 
  - (terminal)

### Cancelled
- **Duplicate**: 
  - (terminal)
- **Will not do**: 
  - (terminal)

## UUID Workaround for Linear Status Updates

### Overview
The Linear MCP server has a bug that prevents issue status updates using status names - it requires internal UUIDs instead. This workaround automatically fetches and caches UUID mappings to enable reliable status transitions.

### How It Works

1. **Automatic Refresh**: When lc-runner starts, it automatically checks for and refreshes state-mappings.json if:
   - The file doesn't exist
   - The file is older than 90 minutes (stale)
   - The LINEAR_API_KEY environment variable is configured

2. **File Location**: State mappings are stored at `.linear-watcher/state-mappings.json` in the repository root

3. **Thread Safety**: File locking ensures concurrent lc-runner invocations don't corrupt the mappings:
   - First process acquires lock and refreshes
   - Other processes wait up to 10 seconds for lock
   - If lock timeout occurs, processes continue with existing mappings (non-fatal)

4. **Status Updates**: The lc-issue-saver subagent:
   - Reads state-mappings.json to lookup UUID for status name
   - Calls MCP with the UUID instead of status name
   - Falls back gracefully if UUID not found (logs warning, continues operation)

### File Format
```json
{
  "stateUUIDs": {
    "Backlog": "uuid-123...",
    "Grooming": "uuid-456...",
    "Delivery-ai": "uuid-789...",
    "Acceptance": "uuid-abc...",
    "Done": "uuid-def..."
  },
  "_metadata": {
    "fetchedAt": "2025-09-05T12:00:00Z",
    "teams": ["Team Name"]
  }
}
```

### Troubleshooting

#### Manual Refresh
If automatic refresh fails, you can manually refresh state mappings:
```bash
# Set API key
export LINEAR_API_KEY=your_api_key

# Run manual refresh script
cd packages/aidevops/lc-runner/scripts
./fetch-state-uuids.sh
```

#### Common Issues

1. **No status updates occurring**
   - Check LINEAR_API_KEY is set
   - Verify state-mappings.json exists
   - Check file permissions on .linear-watcher directory

2. **Stale mappings**
   - File auto-refreshes after 90 minutes
   - Force refresh: Delete state-mappings.json and restart lc-runner

3. **Lock timeouts**
   - Check for stuck processes holding locks
   - Remove .lock files if processes crashed
   - Lock timeout is 10 seconds by default

4. **Unknown state names**
   - Verify state name matches exactly (case-sensitive)
   - Check if new states were added to Linear workflow
   - Refresh mappings to include new states

### Configuration

The UUID workaround behavior can be configured through environment variables:
- `LINEAR_API_KEY`: Required for fetching state mappings
- `REPO_ROOT`: Override repository root detection (optional)

### Non-Fatal Design

The UUID workaround is designed to be non-fatal:
- Operations continue without status updates if mappings unavailable
- Network failures use cached mappings if available
- Lock timeouts don't block operations
- All failures log warnings but don't stop execution

This ensures lc-runner remains resilient even when Linear API is unavailable or state mappings can't be refreshed.
