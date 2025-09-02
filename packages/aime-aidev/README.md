# @aimeup/aime-aidev

AI Dev profile package that deploys configuration and prompt files for lc-runner.

## Problem

This package's postinstall script doesn't run automatically during `pnpm install` because:

- No other package depends on it
- pnpm only runs postinstall for packages that are actually installed as dependencies

## Solutions

### Option 1: Make it a dev dependency of the root (Recommended)

Add to root `package.json`:

```json
{
  "devDependencies": {
    "@aimeup/aime-aidev": "workspace:*"
  }
}
```

### Option 2: Make it a dependency of lc-runner

Add to `packages/aidevops/lc-runner/package.json`:

```json
{
  "dependencies": {
    "@aimeup/aime-aidev": "workspace:*"
  }
}
```

### Option 3: Add a prepare script

Add to root `package.json`:

```json
{
  "scripts": {
    "prepare": "pnpm --filter @aimeup/aime-aidev run postinstall"
  }
}
```

### Option 4: Manual deployment

Run manually when needed:

```bash
cd packages/aime-aidev && pnpm run postinstall
```

## Current Workaround

The files have been deployed manually. To redeploy after changes:

```bash
cd packages/aime-aidev
pnpm run build
node dist/postinstall.js
```

## Files Deployed

### Configuration

- `.linear-watcher/config.json` - Linear API configuration

### Prompt Templates

- `.linear-watcher/prompts/lc-runner-general-prompt.md` - General prompt template
- `.linear-watcher/prompts/delivery-prompt.md` - Delivery operation prompt
- `.linear-watcher/prompts/tasking-prompt.md` - Task operation prompt
- `.linear-watcher/prompts/grooming-prompt.md` - Grooming operation prompt
- `.linear-watcher/prompts/smoke-prompt.md` - Smoke test operation prompt

### Claude Code Subagents

- `.claude/agents/lc-operation-reporter.md` - Handles operation report creation and Linear uploads
- `.claude/agents/lc-issue-tasker.md` - Complete issue tasking with validation and task list generation

All files are deployed as read-only (444) to prevent accidental modification.

## Subagents

### lc-operation-reporter

Atomically writes operation reports and uploads them to Linear. Used by all lc-runner operations to create Start, Finished, and other operation reports.

### lc-issue-tasker

Complete issue tasking agent that:

- Generates or validates task lists for Linear issues
- Ensures requirements are clear and complete
- Validates against 8 success criteria
- Creates comprehensive task lists with proper sequencing
- Documents assumptions and blocking questions
- Invokes lc-operation-reporter once at completion

## Testing

Run the test suite to validate subagent configuration:

```bash
cd packages/aime-aidev
pnpm test
```

The test suite includes:

- Subagent file existence and YAML validation
- Postinstall script functionality
- Content validation for all required sections
- Integration test cases for tasking scenarios
