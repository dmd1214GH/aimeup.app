# Claude Code Subagents Guide

## Overview

Claude Code subagents are specialized AI agents that can be invoked from the main Claude Code session to perform specific, atomic tasks. This pattern enables better modularity, reliability, and maintainability of AI-driven operations.

https://docs.anthropic.com/en/docs/claude-code/sub-agents

## Subagent Architecture

### Directory Structure

```
/aimeup/
├── packages/
│   └── aime-aidev/
│       └── assets/
│           └── claude-agents/    # Subagent source definitions
│               └── *.md          # Individual subagent files
└── .claude/
    └── agents/                    # Runtime subagent location (gitignored)
        └── *.md                   # Deployed subagent files
```

### Deployment Process

1. **Source Management**: Subagents are defined as markdown files in `/aimeup/packages/aime-aidev/assets/claude-agents/`
2. **Build Process**: The `aime-aidev` package includes these files in its distribution
3. **Installation**: The postinstall script copies subagents to `.claude/agents/` during package installation
4. **Persistence**: The postinstall script ensures subagents persist across Docker container rebuilds

## Creating a New Subagent

### 1. Define the Subagent File

Create a new `.md` file in `/aimeup/packages/aime-aidev/assets/claude-agents/` with the following structure:

```markdown
---
name: your-subagent-name
description: 'Brief description of what this subagent does'
tools: Tool1, Tool2, Tool3 # List of tools the subagent needs
---

# Subagent Name

System prompt and detailed instructions for the subagent...

## Responsibilities

- What the subagent should do
- Its specific scope and limitations

## Input Parameters

- Parameter definitions and expectations

## Processing Steps

1. Step-by-step process the subagent should follow

## Response Format

- Expected output structure
```

### 2. YAML Frontmatter Requirements

- **name**: Unique identifier for the subagent (use kebab-case)
- **description**: One-line description shown in Claude Code
- **tools**: Comma-separated list of tools the subagent requires access to

### 3. Deploy the Subagent

After creating the subagent file:

1. Build the aime-aidev package: `cd packages/aime-aidev && pnpm build`
2. Run the postinstall script: `node dist/postinstall.js`
3. Verify deployment: Check that the file exists in `.claude/agents/`

## Invoking Subagents

### From Main Claude Code Session

Use the Task tool to invoke a subagent:

```javascript
// Example invocation
Use the Task tool with:
- subagent_type: "general-purpose"
- description: "Brief task description"
- prompt: "Detailed instructions including all parameters"
```

### From Prompts

In lc-runner prompts or other automated prompts:

```markdown
Use the lc-operation-reporter subagent with these parameters:

- issueId: <ArgIssueId>
- operation: <ArgOperation>
- action: Start
- workingFolder: <ArgWorkingFolder>
- operationStatus: InProgress
- summary: "Starting operation"
- payload: "Additional details..."
```

## Best Practices

### 1. Atomic Operations

- Each subagent should perform a single, well-defined task
- Avoid complex branching logic within subagents
- Keep subagents focused and predictable

### 2. Error Handling

- Clearly distinguish between fatal and non-fatal errors
- Return structured error information
- Document error handling expectations in the subagent prompt

### 3. Input Validation

- Define all required parameters clearly
- Validate inputs early in the processing
- Provide helpful error messages for invalid inputs

### 4. Response Structure

- Always return structured, predictable responses
- Include success/failure indicators
- Provide detailed status information

## Example: lc-operation-reporter Subagent

The `lc-operation-reporter` subagent demonstrates the pattern:

### Purpose

Atomically writes operation reports and uploads them to Linear, ensuring reliable report generation and tracking.

### Key Features

- **Atomic Operation**: Combines file writing and Linear upload
- **Error Differentiation**: Fatal errors (file write) vs non-fatal (upload)
- **Structured Response**: Returns detailed status for each operation
- **Idempotent**: Can be safely re-invoked if needed

### Integration Points

- Used by all lc-runner operations (Groom, Task, Deliver)
- Replaces legacy MCP-based upload process
- Ensures operation reports are never "forgotten"

## Troubleshooting

### Subagent Not Found

- Verify the subagent exists in `.claude/agents/`
- Run the postinstall script: `cd packages/aime-aidev && node dist/postinstall.js`
- Check file permissions (should be read-only: 0o444)

### Subagent Invocation Fails

- Verify the subagent has access to required tools
- Check that all required parameters are provided
- Review the subagent's error response for details

### Docker Container Issues

- Ensure `.claude/agents/` is in a mounted volume or
- Add postinstall execution to container startup scripts
- Verify the postinstall script runs on container initialization

## Maintenance

### Updating Subagents

1. Modify the source file in `assets/claude-agents/`
2. Rebuild the package: `pnpm build`
3. Run postinstall: `node dist/postinstall.js`
4. Test the updated subagent

### Version Control

- Source files in `assets/claude-agents/` are version controlled
- Runtime files in `.claude/agents/` are gitignored
- Changes are tracked through the aime-aidev package versioning

### Testing

- Unit tests validate subagent file structure and content
- Integration tests verify postinstall deployment
- End-to-end tests confirm subagent invocation works correctly

## Future Enhancements

### Planned Improvements

- Subagent versioning and compatibility checking
- Dynamic subagent loading without rebuild
- Subagent composition for complex workflows
- Performance monitoring and optimization

### Extension Points

- Custom subagent types beyond "general-purpose"
- Subagent chaining and orchestration
- Shared state between subagent invocations
- Subagent marketplace for reusable patterns
