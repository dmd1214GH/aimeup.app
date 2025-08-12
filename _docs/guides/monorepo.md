# aimeup Monorepo guide

This guide lays out the structure of the aimeup code monorepo and discusses constraints and rules for adding code to this structure.

## Target folder structure
``` 
/aimeup              # Project root
  /_docs             # Markdown formatted for communication
    /prompts         # ai prompts for development and design
    /design          # actionable architectural & planning documents
    /guides          # enduring documents carefully maintained as code evolves
  /_scripts          # developer facing scripts (mac, zsh for now)
  /apps
    /eatgpt          (@eatgpt/app)            # Single endpoint for RN and RN-web
  /services
    /aimeup-service  (@aimeup/service)        # Firebase Cloud Functions (OpenAI proxy)
  /packages
    /core            (--no root export--)     # side-effect free type and api defs
      /aiapi         (@aimeup/core/aiapi)
      /chatapi       (@aimeup/core/chatapi)
      /menuapi       (@aimeup/core/menuapi)
      /securityapi   (@aimeup/core/securityapi)
      /... others expected
    /helpers         (--no root export--)     # pragmatic utilities grab-bag
      /files         (@aimeup/helpers/files)    # file interaction 
      /chatable      (@aimeup/helpers/chatable) # Chat plugin requirements
      /account       (@aimeup/helpers/account)  # Firebase security client
      /utility       (@aimeup/helpers/utility)  # changeDetector, etc
      /openai        (@aimeup/helpers/openai)   #proxy client
      /... others expected
    /core-react      (@aimeup/core-react)     # React context providers
    /ui-native       (@aimeup/ui-native)      # reusable RN ui components
    /chat            (@aimeup/chat)           # reusable chat domain
    /account         (@aimeup/account)        # auth/profile domain
    /eatgpt                                   # container for eatgpt-specific code
      /nutrition     (@eatgpt/nutrition)      # Renamed from nutritionProfile
      /healthconnect (@eatgpt/healthconnect)  # RN only, does not apply to web or iOS
    /tokens          (@aimeup/tokens)         # design tokens
  /configs           # optional location for preset storage
    /tsconfig        # tsconfig.lib.json, tsconfig.app.json → packages/apps extend these
    /eslint          # base.cjs → root .eslintrc.cjs just extends this
    /jest            #preset.ts → used by subprojects
    /... others expected
  / (-- various config files @ root, eg.git, pnpm, turbo, package, eslint, prettier --)
```

## Namespaces
- Namespaces
  - @aimeup = underlying ai-chat framework, reusable across application domains
  - @eatgpt = EatGPT specific implementation
- keeping /eatgpt isolated in its own structure for easier extraction into a dedicated repo in the future.

---
## Dependency and exposed code rules

### Level 0 - Core code
**Includes:** @aimeup/core, @aimeup/tokens, @aimeup/core-react
**Intention:** Trustworthy, low-weight table stakes components necessary for working within the aimeup ecosystem.
**Allowed Dependencies:** Ubiquitous, non-blocking, low-weight libraries only.  Level 0 dependencies are ok as long as they do not introduce circular dependencies.  Free of side effects (external calls, singletons, etc.)  Core must not import any non-level 0 package
**Export rules:** Allow focused imports so dependencies can be carefully managed.  **No wholesale exports** for multi-domain packages of level 0 must not export their roots. Only subdomains may be exported.

### Level 1 - Helpers, libraries, utilities
**Includes:** @aimeup/helpers
**Intention:** Medium-weight required for deeper interactions with one or more major packages without requiring a full dependency on those packages.
**Dependencies:** Level 0, curated packages intended for consumption, well documented side effects.  Helpers may depend only on @aimeup/core/* (and tiny ubiquitous libs); no domain/UI/app/service deps.
**Export rules:** Allow focused imports so dependencies can be carefully managed.   **No wholesale exports** for multi-domain packages of level 1 must not export their roots. Only subdomains may be exported.

### Level 2 - Packages, Tools
**Includes:** @aimeup/ui-native, @aimeup/account, @aimeup/chat
**Intention:** Heavy-weight resources designed for delivering maximal functionality with minimal dependency constraints
**Dependencies:** May have Level 0-2 dependencies so long as circular references are avoided, package dependency flexibility
**Export rules:** Package export flexibility.  Clients are all-in.

### Level 3 - Application Endpoint
**Includes:** apps/eatgpt, services/aimeup-service
**Intention:** Endpoint applications
**Dependencies:** Dependencies are not constrained
**Export rules:** Code in these packages is not intended for export

---
## Standards & validation
1. Changes to the core monorepo structure must be approved and this document must be updated along with the git checkin that applies the change
2. Subfolders under these items is flexible, but should be approached carefully until a standards can be refined and published.
3. Developers must adhere to the rules in the **Dependency and exposed code rules** section


### Banning root exports
Level 0 and Level 1 packages which contain multiple subdomains MUST prevent root from being imported.  (Intentionally omit "." so import '@aimeup/core' fails.)

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

Validation in core and helper packages is being added by: BL-0108 — Core domain port.

### Preventing unwanted dependencies
ESLint validation to ensure level 0 and 1 libraries do not import from packages.
```json
"no-restricted-imports": ["error", {
  "paths": [{ "name": "@aimeup/core", "message": "Use subpath import like @aimeup/core/aiapi" }],
  "patterns": [
    { "group": ["@aimeup/helpers/**"], "importNames": ["default"], "message": "Helpers cannot import from domain/UI/app/service" }
  ]
}]
```


