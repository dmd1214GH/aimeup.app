# Monorepo Guide

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
    /tokens          (@aimeup/tokens)         # design tokens & RN Elements theming
  /configs           # optional location for preset storage
    /tsconfig        # tsconfig.lib.json, tsconfig.app.json → packages/apps extend these
    /eslint          # base.cjs → root .eslintrc.cjs just extends this
    /jest            #preset.ts → used by subprojects
    /... others expected
  / (-- various config files @ root, eg.git, pnpm, turbo, package, eslint, prettier --)
```

## Namespaces

- **@aimeup** = underlying ai-chat framework, reusable across application domains
- **@eatgpt** = EatGPT specific implementation
- Keeping `/eatgpt` isolated in its own structure for easier extraction into a dedicated repo in the future.

## Package Dependency Levels

### Level 0 - Core Code

**Includes:** `@aimeup/core`, `@aimeup/tokens`, `@aimeup/core-react`
**Intention:** Trustworthy, low-weight table stakes components necessary for working within the aimeup ecosystem.
**Dependencies:** Ubiquitous, non-blocking, low-weight libraries only. No side effects (external calls, singletons, etc.). Core must not import any non-level 0 package.
**Export Rules:** No wholesale exports. Only subdomains may be exported. Use focused imports for dependency management.

### Level 1 - Helpers, Libraries, Utilities

**Includes:** `@aimeup/helpers`
**Intention:** Medium-weight resources required for deeper interactions without requiring full dependency on major packages.
**Dependencies:** Level 0, curated packages intended for consumption, well-documented side effects. Helpers may depend only on `@aimeup/core/*` and tiny ubiquitous libs; no domain/UI/app/service deps.
**Export Rules:** No wholesale exports. Only subdomains may be exported. Use focused imports for dependency management.

### Level 2 - Packages, Tools

**Includes:** `@aimeup/ui-native`, `@aimeup/account`, `@aimeup/chat`
**Intention:** Heavy-weight resources designed for delivering maximal functionality with minimal dependency constraints.
**Dependencies:** May have Level 0-2 dependencies so long as circular references are avoided.
**Export Rules:** Package export flexibility. Clients are all-in.

### Level 3 - Application Endpoint

**Includes:** `apps/eatgpt`, `services/aimeup-service`
**Intention:** Endpoint applications.
**Dependencies:** Dependencies are not constrained.
**Export Rules:** Code in these packages is not intended for export.

## Dependency Management Rules

- **No root exports** for Level 0 and Level 1 packages with multiple subdomains
- Use subpath imports (e.g., `@aimeup/core/aiapi` not `@aimeup/core`)
- **Subfolder vs Package Distinction:**
  - **Packages** have their own package.json and can be imported
  - **Subfolders** are just organized exports within packages
  - `@aimeup/core/aiapi` is a subfolder export, not a separate package
  - `@aimeup/ui-native` is a separate package
- Prevent circular dependencies between packages
- Level 0 and Level 1 packages cannot import from higher-level packages
- ESLint validation enforces dependency constraints

## Export Configuration Examples

### Banning Root Exports

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

### Preventing Unwanted Dependencies

ESLint validation to ensure level 0 and level 1 libraries do not import from packages.

```json
"no-restricted-imports": ["error", {
  "paths": [{ "name": "@aimeup/core", "message": "Use subpath import like @aimeup/core/aiapi" }],
  "patterns": [
    { "group": ["@aimeup/helpers/**"], "importNames": ["default"], "message": "Helpers cannot import from domain/UI/app/service" }
  ]
}]
```

## Standards

### Package Management

- Use consistent package manager across the project
- Follow workspace structure defined in package manager config
- Use build orchestration tools (Turbo, Lerna, Nx)
- Keep dependencies up to date and secure

### File Organization

- Place new components in appropriate package directories
- Follow existing import/export patterns
- Use index.ts files for clean exports
- Maintain consistent monorepo structure

### Development Workflow

- Use defined build scripts consistently
- Follow existing CI/CD patterns
- Use proper git commit messages
- Keep commits focused and atomic

### Package Structure

- Separate concerns between apps, packages, and services
- Use consistent naming conventions
- Implement proper dependency management
- Maintain clear package boundaries

### Build & Testing

- Use consistent build tools across packages
- Implement proper testing strategies
- Use shared configuration files
- Maintain consistent code quality standards

### Structural Standards

- Changes to core monorepo structure must be approved and documented
- Update this document along with git commits that apply structural changes
- Subfolder organization should be approached carefully until standards are refined
- Developers must adhere to the dependency and export rules defined above

### Validation & Enforcement

- ESLint rules enforce dependency constraints
- Package.json exports must match directory structure
- CI/CD pipelines can validate structural compliance
- Regular audits ensure architectural integrity

## Package Level Mapping

**Note:** Subfolders like `core/aiapi` are NOT separate packages - they are organized exports within the `@aimeup/core` package.

### Level 0 - Core Code

- `@aimeup/core` - Core domain types and API contracts
  - `@aimeup/core/aiapi` - AI service interfaces (subfolder export)
  - `@aimeup/core/chatapi` - Chat system contracts (subfolder export)
  - `@aimeup/core/menuapi` - Menu system contracts (subfolder export)
  - `@aimeup/core/securityapi` - Security contracts (subfolder export)
- `@aimeup/tokens` - Design tokens and theme system
- `@aimeup/core-react` - React context providers and state management

### Level 1 - Helpers, Libraries, Utilities

- `@aimeup/helpers` - Utility functions and services
  - `@aimeup/helpers/files` - File interaction utilities (subfolder export)
  - `@aimeup/helpers/chatable` - Chat plugin requirements (subfolder export)
  - `@aimeup/helpers/account` - Firebase security client (subfolder export)
  - `@aimeup/helpers/utility` - General utilities (changeDetector, etc.) (subfolder export)
  - `@aimeup/helpers/openai` - OpenAI proxy client (subfolder export)
  - `@aimeup/helpers/appframework` - App shell, context, and menu framework (subfolder export)

### Level 2 - Packages, Tools

- `@aimeup/ui-native` - Reusable React Native UI components
- `@aimeup/account` - Authentication and user profile domain
- `@aimeup/chat` - Chat functionality and domain logic
- `@aimeup/eatgpt` - EatGPT-specific implementations
  - `@eatgpt/nutrition` - Nutrition domain (renamed from nutritionProfile)
  - `@eatgpt/healthconnect` - HealthConnect integration (Android only)

### Level 3 - Application Endpoint

- `@eatgpt/app` - EatGPT React Native application
- `@aimeup/service` - Firebase Cloud Functions service
- `@aimeup/testharness` - Testharness for demonstration and testing, not for deployment
