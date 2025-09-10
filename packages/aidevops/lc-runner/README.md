# lc-runner

Linear/ClaudeCode runner CLI for AI-assisted development operations.

## Overview

The `lc-runner` CLI tool automates Linear issue operations by:

- Extracting issue details from Linear via API
- Creating organized working folders for operations
- Assembling operation-specific prompts for AI processing
- Tracking operation history and status

## Installation

From the monorepo root:

```bash
pnpm install
pnpm build
```

The CLI will be available as:

```bash
pnpm lc-runner <operation> <issueId>
```

## Configuration

### Linear API Setup

1. **Get a Linear API Key:**
   - Go to Linear Settings → API → Personal API keys
   - Create a new personal API key with read permissions
   - Copy the generated key

2. **Set the Environment Variable:**

   ```bash
   export LINEAR_API_KEY="your-linear-api-key-here"
   ```

3. **Verify Connection:**
   The CLI will automatically validate the API connection when running operations.

### Configuration File

The tool uses configuration from `.linear-watcher/config.json`:

```json
{
  "linear": {
    "apiUrl": "https://api.linear.app/graphql",
    "issuePrefix": "AM",
    "apiKeyEnvVar": "LINEAR_API_KEY"
  },
  "generalPrompt": "lc-runner-general-prompt.md",
  "lc-runner-operations": {
    "Delivery": {
      "operationName": "Delivery",
      "linearIssueStatus": "Code & Test",
      "promptFile": "delivery-prompt.md"
    }
  }
}
```

## Usage

### Command Structure

All commands follow the pattern:

```bash
pnpm lc-runner <operation> <issueId> [options]
```

**Required Parameters:**

- `operation`: The operation to perform (e.g., "Deliver", "Task", "Review")
- `issueId`: The Linear issue identifier (e.g., "AM-25")

### Running Operations

```bash
# Run an operation (extracts issue, creates working folder, invokes ClaudeCode)
pnpm lc-runner Deliver AM-25

# Run without ClaudeCode
pnpm lc-runner Deliver AM-25 --no-claude

# Run with timeout
pnpm lc-runner Deliver AM-25 --claude-timeout 10
```

**Operation Options:**

- `--no-claude`: Skip ClaudeCode invocation
- `--claude-timeout <minutes>`: Set ClaudeCode timeout in minutes
- `--headed`: Run Claude in headed/interactive mode for debugging
- `--seek-permissions`: Seek permission prompts in headed mode

### Uploading Results to Linear

After an operation completes, upload the results using the Claude-powered recovery system:

```bash
# Upload using folder tag (e.g., from a completed operation)
pnpm lc-runner Deliver AM-25 --upload-only op-Deliver-20250824060442

# Dry run to validate without uploading
pnpm lc-runner Deliver AM-25 --upload-only op-Deliver-20250824060442 --dry-run

# Test mode to simulate uploads without Linear API calls
pnpm lc-runner Deliver AM-25 --upload-only op-Deliver-20250824060442 --test-mcp-failure
```

**Upload Options:**

- `--upload-only <folderTag>`: Upload existing results from specified working folder
- `--dry-run`: Validate without performing actual upload
- `--test-mcp-failure`: Simulate uploads without Linear API calls (for testing)

### Listing Working Folders

```bash
# List all working folders for an issue
pnpm lc-runner Deliver AM-25 --list-uploads

# Show details for a specific folder
pnpm lc-runner Deliver AM-25 --list-uploads op-Deliver-20250824060442
```

**List Options:**

- `--list-uploads`: Show all available working folders
- `--list-uploads <folderTag>`: Show details for specific folder

### Examples

```bash
# 1. Run a Delivery operation
pnpm lc-runner Deliver AM-25

# 2. List available working folders
pnpm lc-runner Deliver AM-25 --list-uploads
# Output: ✓ op-Deliver-20250824060442 (8/24/2025, 6:04:42 AM)

# 3. Upload the results
pnpm lc-runner Deliver AM-25 --upload-only op-Deliver-20250824060442

# 4. Or just check what would be uploaded (dry run)
pnpm lc-runner Deliver AM-25 --upload-only op-Deliver-20250824060442 --dry-run

# 5. View details of a specific folder
pnpm lc-runner Deliver AM-25 --list-uploads op-Deliver-20250824060442
```

This will:

1. Validate the issue exists and is in the correct status
2. Extract the full issue body and metadata from Linear
3. Create a working folder with timestamp
4. Save issue content to `original-issue.md` and `updated-issue.md`
5. Generate a master prompt including the issue content
6. Log all operations for tracking
7. (After upload) Push operation reports as comments, update issue body, and transition status

### Output Structure

```
.linear-watcher/work/
└── lcr-AM-20/
    ├── issue-operation-log.md      # Operation history
    └── op-Delivery-20250823123045/  # Timestamped working folder
        ├── original-issue.md        # Original issue from Linear
        ├── updated-issue.md         # Working copy for updates
        └── master-prompt.md         # Combined prompt with issue
```

## Upload Recovery System

The upload feature uses a Claude Code command file (`lc-upload-files.md`) to orchestrate recovery of failed Linear uploads. This AI-driven approach provides intelligent file interpretation and comprehensive operation logging.

### How It Works

1. **File Recognition**: Automatically identifies files by pattern:
   - `operation-report-*.md` → Operation reports
   - `updated-issue.md` → Issue content updates
   - `breakout-*.md` → Breakout sub-issues

2. **Operation Logging**: Maintains an idempotent log at the issue level:
   - Located at `.linear-watcher/work/lcr-<issueId>/issue-operation-log.md`
   - Uses JSON Lines format for efficient append-only operations
   - Prevents duplicate uploads across recovery attempts

3. **Recovery Process**:
   - Checks operation log for already-uploaded files
   - Processes operation reports in chronological order
   - Invokes `lc-issue-saver` subagent for each pending file
   - Updates log after successful uploads
   - Fails fast on first error with clear reporting

### What Gets Uploaded

1. **Operation Reports**: All `operation-report-*.md` files are uploaded as Linear comments
2. **Issue Body**: The `updated-issue.md` content replaces the Linear issue body
3. **Status Transition**: Issue status is updated based on operation result:
   - `Complete` → Configured success status
   - `Blocked/Failed` → Configured blocked status
4. **Breakout Issues**: `breakout-*.md` files create new sub-issues with parent references

### Pre-Upload Validation

Before uploading, the tool validates:

- Required files exist (`original-issue.md`, `updated-issue.md`)
- At least one operation report exists
- Operation log is valid JSON Lines format (if exists)
- Working folder structure is correct

### Upload Process

1. Validates all pre-conditions
2. Uploads operation reports as comments (in sequence)
3. Updates issue body with `updated-issue.md` content
4. Transitions issue status based on result

### Error Handling

- Failed uploads generate an `UploadFailure` report
- Partial failures continue with remaining uploads
- All failures transition issue to blocked status
- Detailed logging for troubleshooting

## Linear Integration Features

### Issue Extraction

The CLI automatically extracts from Linear:

- Issue title and description (full body content)
- Current status
- Priority level
- Assignee information
- Creation and update timestamps
- Direct URL to the issue

### Status Validation

Before running any operation, the CLI validates:

- Issue exists in Linear
- Issue is in the expected status for the operation
- API credentials are properly configured

### Error Handling

The tool gracefully handles:

- Missing API keys (falls back to placeholder mode)
- Network failures (logs error and continues)
- Invalid issue IDs (clear error messages)
- Wrong issue status (prevents operation)

## MCP Integration

### Overview

The lc-runner supports MCP (Model Context Protocol) integration to enable Claude Code to post operation reports directly to Linear as comments during operation execution. This provides real-time visibility of operation progress.

### How It Works

1. **Claude Code Integration**: When Claude Code creates an operation report file, it immediately reads and posts it to Linear via MCP tools
2. **Immediate Posting**: MCP posting happens immediately after each operation report is written, before continuing with other tasks
3. **Graceful Fallback**: If MCP tools are not available or posting fails, operations continue without interruption
4. **Failure Logging**: MCP failures are logged to `issue-operation-log.md` in the issue's parent directory
5. **Upload Detection**: The upload orchestrator detects reports already posted via MCP and skips re-uploading them
6. **Local Files Remain**: Operation report files are always created locally as the source of truth

### Configuration

The MCP integration requires:

1. **Linear API Key**: Set the `LINEAR_API_KEY` environment variable with your Linear API token
2. **MCP Server**: A Linear MCP server that supports environment variable authentication (not the official @modelcontextprotocol/server-linear which requires hardcoded keys)
3. **Claude Code MCP Setup**: Claude Code must have the Linear MCP server configured and running

### MCP Posting Process

1. Claude Code creates an operation report file (e.g., `operation-report-Start-001.md`)
2. Claude Code immediately reads the file content
3. Claude Code posts the content to Linear via MCP (using tools like `mcp__linear__add_comment`)
4. If posting fails, the failure is logged to `../issue-operation-log.md` with timestamp and error details
5. Operation continues regardless of MCP success or failure

### MCP Failure Handling

- MCP posting failures do not block operations
- Failures are logged to the parent directory's `issue-operation-log.md` file with format:
  ```
  - [<timestamp>] MCP Failure: Failed to post <action> report for <issue-id>/<operation>. Error: <details>
  ```
- Failed posts are not retried (indicates configuration issue requiring investigation)
- Upload orchestrator will still upload reports that failed MCP posting

### Testing MCP Failures

Use the `--test-mcp-failure` flag to simulate MCP failures:

```bash
pnpm lc-runner Groom AM-52 --test-mcp-failure
```

This will:

- Attempt to post all reports to invalid issue ID "INVALID-TEST-999"
- Log all failures to `issue-operation-log.md`
- Complete the operation successfully despite failures
- Validate that MCP failures don't block operations

### Upload Orchestrator Behavior

When uploading operation results:

1. Checks Linear for existing comments containing operation report markers
2. Skips uploading reports that are already posted as comments
3. Logs the number of reports skipped due to MCP posting
4. Uploads any reports not found in Linear comments

### Troubleshooting MCP Integration

**"MCP tools not available"**

- Ensure Claude Code has MCP server configured
- Verify LINEAR_API_KEY environment variable is set
- Check that the MCP server supports environment variable authentication

**"MCP posting failed"**

- Check `mcp-failures.log` in the working folder
- Verify Linear API credentials for MCP server
- Ensure network connectivity to Linear

**Reports being uploaded twice**

- Check if `.mcp-posted` marker files are being created
- Verify MCP posting is actually succeeding
- Ensure upload orchestrator has read access to marker files

## API Key Not Configured

If the LINEAR_API_KEY is not set, the tool will:

- Warn about the missing configuration
- Continue with placeholder data for backwards compatibility
- Skip actual Linear API calls
- Allow local testing without Linear access

## Troubleshooting

### "Linear API key not found"

- Ensure LINEAR_API_KEY environment variable is set
- Check the variable name matches config.json's `apiKeyEnvVar`

### "Issue not in required status"

- Verify the issue's current status in Linear
- Check the operation's expected status in config.json
- Update the issue status in Linear if needed

### "Issue not found in Linear"

- Confirm the issue ID is correct
- Ensure you have access to the issue in Linear
- Check the issue prefix matches configuration

## Development

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test -- --coverage
```

### Building

```bash
# Build TypeScript
pnpm build

# Watch mode for development
pnpm dev
```

## Dependencies

- `@linear/sdk`: Official Linear API client
- `commander`: CLI argument parsing
- `zod`: Configuration validation

## License

MIT
