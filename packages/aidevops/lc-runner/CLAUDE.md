# LC-Runner Architectural Guidelines

## Overview

LC-Runner is an orchestration tool for managing Linear issues through AI-assisted operations. It coordinates between Linear API, ClaudeCode, and various subagents to perform grooming, delivery, and other development operations.

## Architectural Constraints

### 1. LC-Runner is for Orchestration Only

LC-Runner's primary responsibility is to:
- Coordinate operations between Linear and ClaudeCode
- Manage working folders and file structures
- Invoke ClaudeCode with appropriate prompts
- Handle configuration and state management

**LC-Runner is NOT**:
- An API proxy for subagents
- A CLI tool for subagents to call via Bash
- A general-purpose Linear API wrapper

### 2. Subagent Communication Restrictions

Subagents (like lc-breakout-handler, lc-issue-saver) must follow these rules:

**ALLOWED**:
- File operations using Read, Write, Edit, MultiEdit tools
- MCP tools (mcp__linear__*) for Linear API access
- Direct GraphQL API calls via WebFetch when MCP is insufficient
- Return structured JSON responses to their callers

**NOT ALLOWED**:
- Calling lc-runner CLI commands via Bash tool
- Attempting to execute `lc-runner linear-api` commands (removed as of AM-56)
- Running any CLI commands to access APIs
- Direct process spawning or shell execution for API access

### 3. Linear API Access Patterns

There are three valid ways to access Linear API:

1. **MCP Tools** (Preferred for subagents):
   - `mcp__linear__create_issue`
   - `mcp__linear__update_issue`
   - `mcp__linear__search_issues`
   - `mcp__linear__add_comment`
   - `mcp__linear__get_user_issues`

2. **Direct GraphQL via WebFetch** (When MCP insufficient):
   - For operations not supported by MCP tools
   - Example: Creating issue relationships (blocks, depends-on)
   - Must handle authentication properly

3. **LinearApiService** (Internal to lc-runner only):
   - Used by lc-runner's TypeScript code
   - NOT exposed as CLI commands
   - Handles authentication and GraphQL queries

### 4. File-Based Communication

All communication between components should be file-based:

- **Operation Reports**: Written to working folders as `operation-report-*.md`
- **Issue Content**: Stored in `updated-issue.md` and `original-issue.md`
- **Deferred Saves**: Created as `deferred-issue-*.md` for recovery
- **Breakout Files**: Saved as `breakout-NNN-*.md` for processing

### 5. Test Mode Support

The `--test-mcp-failure` flag simulates API unavailability:

- Subagents must respect the `testMode` parameter
- File operations always complete (primary requirement)
- API operations are skipped in test mode
- Clear indication in reports when test mode is active

## Common Anti-Patterns to Avoid

### ❌ DON'T: Use lc-runner as API proxy

```bash
# WRONG - Subagents should not do this
lc-runner linear-api create-issue "$JSON_DATA"
```

### ✅ DO: Use MCP tools directly

```typescript
// CORRECT - Use MCP tools in subagents
mcp__linear__create_issue({
  title: "Issue title",
  teamId: "team-id",
  description: "Issue description"
})
```

### ❌ DON'T: Parse stdout for results

```bash
# WRONG - Don't parse command output
RESULT=$(lc-runner some-command | grep "success")
```

### ✅ DO: Use structured files

```typescript
// CORRECT - Write/read structured files
const report = {
  success: true,
  issueId: "AM-56",
  // ... other fields
};
fs.writeFileSync('operation-result.json', JSON.stringify(report));
```

## Subagent Development Guidelines

When creating or modifying subagents:

1. **Declare required tools** in the frontmatter
2. **Use only allowed tools** (no Bash for API access)
3. **Return structured JSON** responses
4. **Handle errors gracefully** with clear messages
5. **Respect test mode** when applicable
6. **Create files first**, then attempt API operations
7. **Document all parameters** clearly

## Historical Context

The `linear-api` command was removed in AM-56 because:
- It encouraged anti-pattern usage by subagents
- Subagents were attempting to hack CLI access via Bash
- MCP tools provide proper API access for subagents
- File-based communication is more reliable and auditable

## References

- AM-55: Initial sub-issue creation implementation (flawed)
- AM-56: Error recovery and architectural cleanup
- AM-80: Recovery handler for deferred operations (future)