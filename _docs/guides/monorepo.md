# Monorepo Guide

## Maintenance Standards

This document must reflect the source of truth about the monorepos. Every modification to the monorepos structure MUST be done so with these standards:
**New/Removed Packages\***

- The workspace configuration (pnpm-workspace.yaml) must be updated
- The this document must be updated as part of the task, not as a separate documentation task
- Package level classification (Level 0-3) must be determined and documented. Ambiguous specification blocks commit-ability
- Unit tests protecting the monorepos structure must be updated to reflect the changes

## Target Folder Structure

```
/aimeup              # Project root
  /_docs             # Markdown formatted for communication
    /delivery        # backlog item delivery tracking
    /epics           # epic-level planning and design documents
    /guides          # enduring documents carefully maintained as code evolves
    /prompts         # ai prompts for development and design
    /reference       # reference documentation and mappings
  /_scripts          # developer facing scripts (mac, zsh for now)
  /apps
    /eatgpt          (@eatgpt/app)            # Single endpoint for RN and RN-web
  /services
    /aimeup-service  (@aimeup/service)        # Firebase Cloud Functions (OpenAI proxy)
  /packages
    /account         (@aimeup/account)        # auth/profile domain
    /chat            (@aimeup/chat)           # reusable chat domain
    /config          (@aimeup/config)         # configuration management
    /core            (--no root export--)     # side-effect free type and api defs
      /aiapi         (@aimeup/core/aiapi)    # subfolder export, not separate package
      /chatapi       (@aimeup/core/chatapi)  # subfolder export, not separate package
      /menuapi       (@aimeup/core/menuapi)  # subfolder export, not separate package
      /securityapi   (@aimeup/core/securityapi) # subfolder export, not separate package
      /... others expected
    /helpers         (--no root export--)     # pragmatic utilities grab-bag
      /files         (@aimeup/helpers/files)    # subfolder export, not separate package
      /chatable      (@aimeup/helpers/chatable) # subfolder export, not separate package
      /account       (@aimeup/helpers/account)  # subfolder export, not separate package
      /utility       (@aimeup/helpers/utility)  # subfolder export, not separate package
      /openai        (@aimeup/helpers/openai)   # subfolder export, not separate package
      /... others expected
    /core-react      (@aimeup/core-react)     # React context providers
    /eatgpt                                   # container for eatgpt-specific code
      /nutrition     (@eatgpt/nutrition)      # Renamed from nutritionProfile
      /healthconnect (@eatgpt/healthconnect)  # RN only, does not apply to web or iOS
    /aidevops                                 # container for AI Dev Ops tools
      /lc-runner     (@aidevops/lc-runner)    # Linear/ClaudeCode runner CLI
    /aime-aidev      (@aimeup/aime-aidev)     # AI Dev profile package with prompts and config
    /tokens          (@aimeup/tokens)         # design tokens & RN Elements theming
  /configs           # optional location for preset storage
    /tsconfig        # tsconfig.lib.json, tsconfig.app.json → packages/apps extend these
    /eslint          # base.cjs → root .eslintrc.cjs just extends this
    /jest            #preset.ts → used by subprojects
    /... others expected
  / (-- various config files @ root, eg.git, pnpm, turbo, package, eslint, prettier --)
```

## Product Map

- How various conceptual products exist within the monorepo.
- Explains the products
- Defines operational rules for building and documenting

### Product: Chatable Framework

Namespace: **@aimeup**

**Intentions**

- Sharable TS/React packages which can be used by apps seeking similar chat + integration experience
- Design patterns to provide extensibility and customizatation, but also a rich starting point
- Jumpstart to: ChatUI, Authenticaition, Storage, Responsiveness,

**Chatable Packages**

- @aimeup/core
- @aimeup/helpers
- @aimeup/core-react
- @aimeup/tokens
- @aimeup/ui-native
- @aimeup/account
- @aimeup/chat
- @aimeup/aime-aidev

### Product: EatGPT

Namespace: **@eatgpt**

**Intentions**

- Specific, AI-driven, meal tracking app built on the Chatable Framework
- Deploy to iOS, Android, Web (RN-web)
- Coding and testing largely completed through automated AI supplied through AI Dev Ops

**EatGPT Packages**

- @eatgpt/nutrition
- @eatgpt/healthconnect

### Product: AI Dev Ops

Namespace: **@aidevops**

**Intentions**

- Development tools, processes, patterns for coding and testing with AI assistance

**AI Dev Ops Packages**

- @aidevops/lc-runner

## Package Levels

### Level 0 - Core Code

Trustworthy, low-weight table stakes components necessary for working within the aimeup ecosystem.

#### Includes

- `@aimeup/core` - Core domain types and API contracts
- `@aimeup/tokens` - Design tokens and theme system
- `@aimeup/core-react` - React context providers and state management

#### Allowed Dependencies

- Ubiquitous, non-blocking, low-weight libraries only. No side effects (external calls, singletons, etc.).
- Other level 0 packages (no circular references)

#### Export Rules

No wholesale exports. Only subdomains may be exported. Use focused imports for dependency management.

### Level 1 - Helpers, Libraries, Utilities

Medium-weight resources required for deeper interactions without requiring full dependency on major packages.

#### Includes

- `@aimeup/helpers` - Utility functions and services

#### Allowed Dependencies

- Level 0 packages
- Other level-1 packages (no circular dependencies)
- Curated packages intended for consumption, well-documented side effects.

#### Export Rules

- No wholesale exports. Only subdomains may be exported. Use focused imports for dependency management.

### Level 2 - Packages, Tools

Heavy-weight resources designed for delivering maximal functionality with minimal dependency constraints.

#### Includes

- `@aimeup/ui-native` - Reusable React Native UI components
- `@aimeup/account` - Authentication and user profile domain
- `@aimeup/chat` - Chat functionality and domain logic
- `@eatgpt/nutrition` - Nutrition domain (renamed from nutritionProfile)
- `@eatgpt/healthconnect` - HealthConnect integration (Android only)
- `@aidevops/lc-runner` - Linear/ClaudeCode runner CLI tool
- `@aimeup/aime-aidev` - AI Dev profile package with runtime config and prompts

#### Allowed Dependencies

May have Level 0-2 dependencies so long as circular references are avoided.

#### Export Rules

Package export flexibility. Clients are all-in.

### Level 3 - Application Endpoint

Endpoint applications

#### Includes

- `@eatgpt/app` - EatGPT React Native application
- `@aimeup/service` - Firebase Cloud Functions service
- `@aimeup/testharness` - Testharness for demonstration and testing, not for deployment

#### Allowed Dependencies

Dependencies are not constrained.

#### Export Rules

Code in these packages is not intended for export.

## Standards

### Root Exports

- **No root exports** for Level 0 and Level 1 packages **which bundle multiple subdomains**.
- Use subpath exports instead to promotes minimal dependencies and prepare for future refactoring. (e.g., `@aimeup/core/aiapi` not `@aimeup/core`)
- Prevent circular dependencies between packages
- Packages must not import from higher-level packages
- Use index.ts files for clean exports
- Enforce dependency constraints with ESLint for specific package hygiene

#### Prevent root exports

Level 0 and Level 1 packages which contain multiple subdomains MUST prevent root from being imported. (Intentionally omit "." so import '@aimeup/core' fails.)

```json
{
  "name": "@aimeup/core",
  "exports": {
    "./aiapi": "./aiapi/index.ts",
    "./chatapi": "./chatapi/index.ts",
    "./menuapi": "./menuapi/index.ts",
    "./securityapi": "./securityapi/index.ts"
  }
}
```

### Structural Standards

- Changes to core monorepo structure must be approved and documented.
- Update this document (`monorepo.md`), and include along with git commits that apply structural changes:
  - Modify the `Target Folder Structure` section to specify names, namespaces, and relative locations of folders
  - Modify the `Product Map` section to explain which product each package belongs to.
  - Update the `Package Levels` section to identify the product that the package belongs to.

## AI Dev Ops Tools

### lc-runner CLI

The `lc-runner` CLI tool is part of the AI Dev Ops product for automating Linear/ClaudeCode operations.

#### Installation and Build

1. **Package Location**: `/packages/aidevops/lc-runner/`
2. **Build Command**: `pnpm build` (from package directory or root)
3. **Output**: Compiles TypeScript to `/dist/lc-runner.js`
4. **Binary Linking**: pnpm creates symlink in `node_modules/.bin/lc-runner`

#### Runtime Configuration

The CLI depends on the `@aimeup/aime-aidev` profile package which:

- Installs during `pnpm install` via postinstall script
- Copies runtime assets to `/.linear-watcher/`:
  - `config.json` - Operation mappings and settings
  - `prompts/` - Operation-specific prompt templates

#### Usage

```bash
# From repository root after pnpm install
pnpm lc-runner <operation> <issueId>

# Or directly if in PATH
lc-runner <operation> <issueId>

# Example
pnpm lc-runner Task AM-123
# Output: Hello World (AM-123 : Task)
```

#### Configuration Schema

The `.linear-watcher/config.json` file defines:

- `issuePrefixes`: Valid issue ID prefixes (e.g., ["AM", "BUG", "FEAT"])
- `operations`: Mapping of operation names to Linear statuses
- `settings`: Runtime configuration options

#### Error Handling

The CLI validates:

- Configuration file exists and is valid JSON
- Operation name matches configured operations
- Issue ID starts with configured prefix
- Exits with non-zero status and clear error messages on failure
