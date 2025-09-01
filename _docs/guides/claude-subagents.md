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

### 5. Handling Agent Output

When a subagent returns JSON output, provide an accurate summary based on the actual JSON response:

- **Always show the actual status** from the JSON (success/blocked/partial), not assumptions
- **Display the key metrics** from the response (aimequalPassed, error counts, unfixable issues)
- **For aimequal-runner specifically**:
  - Report `status` field exactly as returned
  - Show `aimequalPassed` true/false status
  - List errors from `errorTracking` with their attempt counts
  - Report any `unfixableErrors` with reasons
  - Mention `circularDependencies` if present
- **Example based on actual JSON**:
  ```
  Status: partial
  Aimequal passed: false
  Fixed: 2 prettier errors, 1 TypeScript error
  Unfixable: 3 business logic errors (report-only), 1 flaky test (exceeded 5 attempts)
  ```

### 6. Avoiding Unnecessary Re-runs

Time-consuming agents like aimequal-runner should not be reflexively re-run:

- These agents are expensive and time-consuming (3+ minutes)
- Only re-run if there's a specific reason (e.g., user request, new code changes)
- Trust the agent's report - if it says tests pass, they pass
- If the agent reports unfixable errors, investigate the specific issues rather than re-running

## Available Subagents

### lc-operation-reporter

**Purpose**: Atomically writes operation reports and uploads them to Linear, ensuring reliable report generation and tracking.

**Key Features**:

- **Atomic Operation**: Combines file writing and Linear upload
- **Error Differentiation**: Fatal errors (file write) vs non-fatal (upload)
- **Structured Response**: Returns detailed status for each operation
- **Idempotent**: Can be safely re-invoked if needed

**Usage**:

```
Invoke the lc-operation-reporter subagent with all required parameters:
- issueId: <ArgIssueId>
- operation: <ArgOperation>
- action: Start|Finished
- operationStatus: InProgress|Complete|Failed|Blocked
- summary: Brief summary
- payload: Detailed content
```

**Integration**: Used by all lc-runner operations (Groom, Task, Deliver)

### aimequal-runner

**Purpose**: Makes `_scripts/aimequal` pass by automatically fixing common test failures with smart retry logic and circular dependency detection.

**Key Features**:

- **Direct Execution**: Runs `_scripts/aimequal` directly, synchronously
- **Per-Error Tracking**: Each unique error gets up to 5 fix attempts before being marked unfixable
- **Circular Dependency Detection**: Detects and stops oscillating fixes (A breaks B, B breaks A)
- **Pattern-Based Fixes**: Reads fix patterns from `/aimeup/_docs/guides/automated-testing.md#aimequal-fix-patterns`
- **Detailed Reporting**: Comprehensive reports with fix history, error tracking, and unfixable issues

**Usage**:

```
Invoke the aimequal-runner subagent:
- No parameters needed
- Runs automatically and returns JSON with results
```

**No Parameters Required**: The subagent runs in smart mode automatically, no configuration needed.

**Example Invocation**:

```
Run the aimequal-runner subagent, then summarize results
```

That's it! The subagent will:

1. Run `_scripts/aimequal`
2. Fix any auto-fixable issues it encounters
3. Track attempts per unique error (max 5)
4. Detect and avoid circular dependencies
5. Return detailed report of what was fixed and what couldn't be fixed

**Auto-Fixable Patterns**:

- Prettier formatting issues
- ESLint errors with auto-fix available
- Missing TypeScript annotations
- Jest snapshot mismatches
- Simple test assertion updates
- Mock signature mismatches
- Monorepo configuration issues
- E2E selector updates
- Timeout adjustments

**Report-Only Patterns** (won't attempt fixes):

- Business logic failures
- Security test failures
- Performance regressions
- Integration test failures
- Complex conditional logic issues

**Integration**: Can be invoked manually during development or as part of delivery operations to ensure tests pass

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
