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

### Basic Command

```bash
pnpm lc-runner <operation> <issueId>
```

**Parameters:**

- `operation`: The operation to perform (e.g., "Delivery", "Task", "Smoke")
- `issueId`: The Linear issue identifier (e.g., "AM-20")

### Example

```bash
# Extract issue AM-20 from Linear and prepare for Delivery operation
pnpm lc-runner Delivery AM-20
```

This will:

1. Validate the issue exists and is in the correct status
2. Extract the full issue body and metadata from Linear
3. Create a working folder with timestamp
4. Save issue content to `original-issue.md` and `updated-issue.md`
5. Generate a master prompt including the issue content
6. Log all operations for tracking

### Output Structure

```
.linear-watcher/work/
└── lcr-AM-20/
    ├── issue-operation-log.md      # Operation history
    └── op-Delivery-20250823123045/  # Timestamped working folder
        ├── original-issue.md        # Original issue from Linear
        ├── updated-issue.md         # Working copy for updates
        ├── master-prompt.md         # Combined prompt with issue
        └── operation-report.json    # Operation status report
```

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
