# _docs/epics/react-conversion    -    react-conversion-backlog.md

## References
- _docs/epics/react-conversion/react_conversion_design.md
- _docs/guides/monorepos.md
- _docs/prompts/claude-epic-prompt.md
- _docs/guides/steps-of-doneness.md

## Stories

### Phase 1 — Standup Sandbox Environment

**BL-0104 — Monorepo scaffold & tooling**
[X] Development environment has pnpm available globally for all project commands.
[X] Primary IDE is installed and project opens with working TypeScript/ESLint/Jest integration.
[X] Legacy scaffolding is removed (Ladle, shadcn, old Tailwind artifacts) with no residual references.
[X] Repository layout matches the documented monorepo specification.
[X] A clean clone installs and builds the entire workspace without manual fixes.
[X] The workspace builds via a single root build that orchestrates all packages.
[X] Toolchain versions are pinned and documented for consistent local setup.
[X] The test suite includes both a Node and a React Native project and both run successfully.
[X] A single local command performs type check, lint, and tests and fails on violations.
[X] A developer can rebuild a clean environment from scratch using only the written guides.
[X] A developer can build, run hygiene checks, and commit using only the written guides.
[X] Automated structure verification reports the repository as compliant with the documented spec.
[X] The verification is deterministic and can be executed locally by any developer.
[X] The developer guide explains how to invoke and interpret the verification.

**BL-0105 — UI/state stack locked & wired**
[X] A single Expo app serves native and web; routing is provided by Expo Router.
[X] App root provides TanStack Query and Redux Toolkit via `@aimeup/core-react`.
[X] Styling accepts `className` across RN and RN-Web (NativeWind + css-interop).
[X] All package-baring branches of monorepos have packages established.  See `_docs/guides/monorepo.md`
[X] Lint rules to prevent:  'No TanStack Query in Redux store files' and 'No Redux hooks in Tanstack API/query files'
[X] Clear, actionable guidance to enforce this policy is in written to the correct coding standards guide: "Clear Boundaries: Use Redux for client state and TanStack Query for server state, avoiding overlap"
[X] A specification defining aimeup's interactions between TanStack, Redux, and Firestore cacheing will be created in the `_doc/guides` clearly explaining the challenges in simple terms and defining actionable usage and interaction standards
[X] Human developer has clear, actionable instructions, scripts, and documented prerequisites to start and stop required services and experience the app on all platforms or emulators 

---
Q: How should RTK and TanStack Query be integrated to avoid redundancy? TanStack Query handles server state, RTK handles client state, but the integration pattern needs clarity.
A: From Claude:  "The pattern isn't inherently problematic - it depends on whether your app actually needs both types of state management and whether you're using RTK Query alongside TanStack Query (which would be redundant)."
  - Added step ACs for Lint and Standards updates
Status: Resolved
---
---
Q: @aimeup/core-react package doesn't exist yet - need to create this package structure before implementing the UI stack
A: All packages branches in monorepos should be setup during this early phase.  I added an AC to confirm this.
Status: Resolved
---

**BL-0106 — Environment & configuration baseline**
[] Environment variables are validated at startup; invalid/missing values are surfaced clearly.
[] Developer guide documents install, run, test, and environment setup end-to-end.
[-] A KitchenSink screen renders core `@aimeup/ui-native` components without runtime warnings on native and web. 
[-] Component smoke tests validate interactive basics using `@testing-library/react-native`.
[-] Remove @ts-ignore comments from UI components after NativeWind is properly configured, and ensure TypeScript recognizes className props without errors.
[-] Validate the state management additions from BL-0105 when UI controls are working


**BL-0107 — Tokens pipeline**
[] `@aimeup/tokens` generates artifacts consumed by styling systems.
[] Generated tokens are reproducible and versioned.
[] A sample screen demonstrates token-driven styling with consistent rendering on RN and RN-Web.

---
Q: Tokens pipeline depends on design token tooling not yet specified. Need to define the token format and build process before UI work can proceed.
Status: In Progress
---

**BL-0115 — UI KitchenSink (RN & RN-Web)**
[] The KitchenSink screen showcases Button/Input/Card variants in `@aimeup/ui-native`.
[] The screen loads without runtime warnings on native and on RN-Web.
[] Component smoke tests confirm visible state changes and basic interactions.

---
Q: KitchenSink references @aimeup/ui-native components that don't exist yet - this creates a circular dependency with BL-0105. Need to create basic components first.
Status: In Progress
---

### Phase 2 — Android → OpenAI shell (PreauthMode, no Firebase)

**BL-0108 — Core domain port**
[] Kotlin shared models are represented as TypeScript types in `@aimeup/core` and `@aimeup/helpers`.
[] zod schemas guard external data boundaries (preview I/O).
[] Unit tests for schemas pass and reject invalid inputs.
[] Repository hygiene checks confirm layering rules and export rules are honored and documented.
[] Importing helpers from core is flagged as an error and blocks lint.
[] Importing domain/UI/app/service packages from helpers is flagged as an error and blocks lint.
[] A workspace dependency audit reports "helpers deps: OK" when helpers declare only allowed dependencies.
[] The audit fails with a clear message if helpers declare disallowed workspace dependencies.
[] The developer guide explains how to invoke and interpret the audit.
[] `@aimeup/core` exposes only documented subpaths; root import resolution fails by design.
[] `@aimeup/helpers` exposes only documented subpaths; root import resolution fails by design.
[] Minimal import/compile checks confirm type and runtime resolution for published subpaths.
[] The guardrails are documented in the monorepo guide.

---
Q: Core domain port needs Kotlin source analysis first - we can't port models without seeing the originals. Need to examine _reference/EatGPT/ for model structure.
Status: In Progress
---

**BL-0110 — OpenAI contracts (in core)**
[] Shared contracts for chat request/response exist in `@aimeup/core/aiapi` and validate preview I/O at runtime.
[] Type/shape compatibility for preview flows is enforced via shared schemas.

---
Q: OpenAI contracts should potentially come before BL-0119 (Android shell) since the shell needs to use these contracts. Need to define the contract interface that the shell will consume.
Status: In Progress
---

**BL-0119 — Android OpenAI shell (new)**
[] The app presents a minimal temporary UI that permits one round-trip OpenAI exchange for PreauthMode purposes.
[] PreauthMode mode can be enabled to operate without Firebase and without persisting data.
[] PreauthMode credentials are local/dev-scoped and excluded from version control.
[] A local build demonstrates a successful PreauthMode chat round-trip on an emulator or device.

---
Q: "minimal temporary UI" is vague - needs more specific acceptance criteria. What exactly should the UI look like and contain for PreauthMode?
Status: In Progress
---

### Phase 3 — Android PreauthMode-only parity

**BL-0109 — Account domain foundation**
[] `@aimeup/account` exposes auth/profile types and pure helpers with no side effects.
[] Unit tests exercise typical and edge scenarios for these helpers.
[] No client SDK dependencies are present in this package.

**BL-0116 — Chat screen assembly (web)**
[] The ChatScreen renders via RN components through RN-Web with expected behavior.
[] UI state (composer open, active chat) is observable via selectors and behaves predictably.

**BL-0114 — EatGPT domains (nutrition/healthconnect)**
[] `@eatgpt/nutrition` and `@eatgpt/healthconnect` expose typed public APIs.
[] RN-only capabilities are guarded by platform checks so web builds succeed without stubs leaking.
[] Unit tests cover the public API for these domains.

**BL-0117 — Native app scaffold, parity, and smoke**
[] A TypeScript RN app exists at `/apps/eatgpt` and boots reliably on android
[] App root composes providers from `@aimeup/core-react`.
[] NativeWind styles render as intended on device.
[] The chat list and composer achieve visual/behavioral parity with the Kotlin app within minimal drift.
[] All drift that cannot be addressed is recorded as future work in the backlog
[] A device/simulator smoke flow (launch → chat → send → see reply) succeeds in PreauthMode mode.


### Phase 4 — Web PreauthMode parity spike

**BL-0118 — Web app shell & routing**
[] The RN-Web shell renders via Expo Router and loads core components successfully.
[] Dev-only query devtools are available on web and absent from production builds.
[] Structured console logging is available in development.
[] A browser smoke flow (load → compose → send → reply → back/refresh) succeeds.
[] An embedded accessibility check reports no serious or critical issues on the Chat screen.


### Phase 5 — iOS PreauthMode parity spike

**BL-0120 — iOS PreauthMode parity spike (new)**
[] The app runs on an iOS simulator/device with PreauthMode mode enabled (no Firebase).
[] The same minimal chat flow demonstrated on Android works end-to-end on iOS.
[] Reasonable similarity is achieved android.  Where items cannot align, backlog items are recorded.
[] Feature/function gaps are recorded for the backlog
[] Build and run steps for iOS are documented for developers.


### Phase 6 — Android full parity (Firestore + Firebase Auth)

**BL-0113 — Account integration (client)**
[] The app authenticates against the Dev Firebase project in development.
[] Session state is represented with selectors and persists according to the defined policy.
[] Unit tests validate login, logout, rehydrate, and storage-failure handling.
[] Implications to state management standards defined in `_docs/guides/state-management-integration.md` have been considered, recorded in the design, and linted.

**BL-0123 — Cleanup legacy infrastructure**
[] The prior Kotlin Firebase project is retired or archived according to policy.
[] The legacy Kotlin repository is archived or removed from active development.
[] Unneeded local tools are either uninstalled or marked as optional in the docs.
[] Documentation confirms legacy components are retired and absent from active builds.

### Phase 7 — Web parity spike

**BL-0122 — Web parity spike (new)**
[] RN-Web demonstrates the same chat flow as Android for PreauthMode features.
[] Where Firebase-backed features exist, web supports sign-in and protected routes.
[] Playwright exercises authenticated and unauthenticated routes; accessibility checks remain green.

### Phase 8 — iOS parity spike

**BL-0121 — iOS parity spike (new)**
[] iOS demonstrates the same flows as Android full parity (auth + chat) where applicable.
[] Any iOS-specific permissions/capabilities are gated and documented.
[] A simulator/device smoke flow succeeds; developer steps are documented.





