# Linear Watcher — Requirements Specification

## Overview

**Linear Watcher** is a local Node.js service (TypeScript) installed into a RN/TS monorepo via `pnpm`. It polls the Linear API for relevant issue updates, collects context, triggers `ClaudeCode` terminal sessions, and posts results back to Linear. It is designed for iterative automation, with future support for reentrant sessions and remote runners.

---

## Installation

- Installed as a PNPM workspace package in a monorepo
- Configurable via `.linear-watcher.config.ts` or environment variables

---

## Triggering Logic (MVP)

- Uses **polling** to detect actionable issues:
  - Polls Linear API every `N` seconds
  - Fetches recently updated issues
  - Filters issues:
    - Assigned to `claude-code` (service account)
    - Not previously handled
- Triggers ClaudeCode session for each new match
- Webhook-based triggering is deferred for future versions

---

## Core Capabilities

### 🕵️ Poll Linear
- Poll for issue updates (e.g. `updatedAt`)
- Filter by:
  - Assignee = `claude-code`
  - Optional: team, label, template, etc.
- Skip duplicates using in-memory or file-based tracking

### 📥 Gather Input
- Collect:
  - Title, description, status
  - Comments and linked issues
  - Custom fields, labels
  - Claude prompt (from issue body or dedicated field)
- Prepare input payload for ClaudeCode

### 🚀 Trigger ClaudeCode
- Launches **local terminal process**
- Passes prompt + metadata via CLI args or stdin
- Tracks PID and result file paths
- Future-proofed to support daemon or job-runner models

### 📤 Update Linear
- Post results to:
  - Issue comments
  - Issue description (if configured)
  - Attach files (e.g. output logs, generated code)
- May update status or reassign issue

---

## Priority Use Cases

| Use Case | Description |
|----------|-------------|
| **Feature Collaboration** | Refine specs at epic or story level |
| **Acceptance Criteria**  | Generate ACs or split into sub-issues |
| **Grooming**             | Clarify requirements, resolve ambiguity, smallerize |
| **Delivery**             | ClaudeCode drafts code, doc, or test artifacts |
| **Testing Support**      | Generate test plans, cases, or analysis |

---

## Nice-to-Have Features

- ✅ **Reentrant Claude Sessions**
  - ClaudeCode can pause and dump a `.json.gz` context file
  - Watcher stores it as attachment or comment
  - Resumes session when user responds

- ✅ **Prompt Authoring via Linear**
  - User can author prompts inline in issues
  - Support via custom templates or structured markdown blocks

- ✅ **Multi-Session Management**
  - Throttled concurrency (`maxSessions: 2`)
  - Per-session locking to avoid overlap

- ✅ **Git Integration (Configurable)**
  - Modes:
    - `suggest-only`: post code to Linear only
    - `commit`: create branch, commit changes
    - `pr`: open pull request
  - Multi-folder support (monorepo-aware)
  - Tracks Claude actions via manifest (`claude-actions.json`)

- ✅ **On/Off Control**
  - Opt-in via assignee (`claude-code`)
  - Optional fallback: labels (`claude-enabled`), checkboxes, custom fields

---

## Security Model

- ClaudeCode runs **with full access** to local dev environment
- No sandboxing or access scoping in v1
- Assumes trusted operator context
- Remote execution is out-of-scope for MVP

---

## State Storage

- Reentrant sessions store `.json.gz` file with:
  - Current task
  - Prompt
  - State/context object
- File stored as:
  - Issue attachment (preferred)
  - Base64 comment blob (fallback)
- ClaudeCode reads from this to resume work

---

## Future Considerations

- Webhook-based triggering (requires hosted endpoint)
- Remote Claude farms or daemonized runners
- Access scoping / least privilege model
- Claude session visualization or progress tracking