# Kotlin → React + TypeScript Conversion Plan (Draft)

## 1. Conversion Overview

### 1.1 Goals of the Conversion
- Unify codebase so **Web, Android, and iOS** share the **same UI and business logic** wherever possible.
- Keep **feature parity** between Android app and Web app (matching UX for now).
- Prepare for easy support of Web an iOS.
- Maximize **code reuse** between Web, Android, iOS.
- Maintain:
  - Rich emulator/debug support.
  - Modular architecture.
  - Rich IDE support
  - Deployment into **Google Play Internal Testing** for Android.
- Enhance build process to support the endpoints and testing levels
- Introduce automated unit testing framework and processes

### 1.2 Conversion Strategies

#### Piecemeal
- Stand up the new development repo and convert code into it one piece at a time
- Fix known issues as we go: e.g. Firebase AI proxy, shared firebase instances
- Incorporate automated testing as we go
- Approach changes and package selection carefully so we don't need to repeat or churn

#### Conversion Phases
We will order the initiative to standup the android app with these phases:
1. Standup environment
  - Install tools
  - Setup repos
  - Setup environmental dependencies
  - Port foundational code
2. Android to OpenAI shell
  - Enable PreauthMode mode
    - Avoid firebase dependencies
    - OpenAI keys installed to avoid firebase ai proxy
    - Non-parity.  Just minimal UI to achieve an initial chat
3. Android PreauthMode-Only Parity
  - Restore UI parity with Kotlin PreauthMode mode
    - Avoid firebase dependency (local openai keys)
    - Maximize learnings with react conversion
4. Web PreauthMode parity spike
  - Stand up (or attempt to) the RN-Web in PreauthMode mode
    - Discover what is possible in a confined timeframe
5. iOS PreauthMode parity spike
   - Stand up (or attempt to) the RN-Web in PreauthMode mode
     - Discover what is possible in a confined timeframe
6. Android Full Parity
  - Port firebase authentication
  - Port Healthconnect 
7. Web parity spike
  - Stand up (or attempt to) the RN-Web in PreauthMode mode
    - Tactical assessment of full parity behavior on web
8. iOS PreauthMode parity spike
  - Stand up (or attempt to) the RN-Web in PreauthMode mode
    - Tactical assessment of full parity behavior on web

---

## 2. Current State - OLD KOTLIN CODE BEING RETIRED
- Kotlin/Jetpack Compose Android app.
- Modular code (`chat`, `account`, `nutritionProfile`, `healthconnect`, `openai`, `shared`).
- Firebase Auth, Firestore, Health Connect, OpenAI integration.
- Modular separation between UI, ViewModel, Service, Model.
- Rich Android Studio emulator/debug workflow.
- Known deployment pipeline for Google Play Internal Testing.
- No unit testing
- Manual configuration and steps required to deploy changes to Firebase and Playstore
- Kotlin code stored in github under project named dmd1214GH/EatGPT
- Firebase is stored in a project: EatGPT
- Code namespace root:  com.eatgpt...

---

## 3. Target State

### 3.1 Post conversion state
**Endpoints & tech**
- Android app (Expo dev client) - feature parity with kotlin
- Web (local preview via RN-Web with Expo Router).
- Firebase (all components)
**Environments**
- `sandbox`, `dev`

### 3.2 MVP release - Not available at the end of this conversion
**Endpoints & tech**
- Android app → **Play Internal Testing** (EAS).
- Web **if RN-Web is viable**
- iOS **hopefully**.
**Environments**
- `sandbox`, `dev`, `test`, `acceptance`


### 3.3 Ultimate target state - **this section states aspirational goals only, not a plan**
**Endpoints & tech**
- Android + iOS (React Native), Web (RN-Web or mixed with DOM where justified).
- Firebase Functions (streaming where needed), Firestore/Auth, hosting/CDN.
**Environments**
- `sandbox`, `dev`, `test`, `acceptance`, `production`.


### 3.4 Target monorepo folder structure
**See aimeup/_docs/guides/monorepo.md** 

## 4. Environment vision

### 4.1 *sandbox* Environment
Supports local development
- *Android:* Emulator, Hardwired Phone
- *iOS:* Emulator, Hardwired Phone  <=  Not in scope for initial conversion
- *Web:* http://localhost:xxxx/eatgpt
- *Firebase:* EatGPT.sandbox / Android, iOS, Web

### 4.2 *dev* Environment
Supports Playstore internal testing, and manually configured IOS connectivity
- *Android:* Playstore (EatGPT/Internal Testing)
- *iOS:* Emulator, Hardwired Phone  << Not in scope for the conversion
- *Web:* http://dev.aimeup.app/eatgpt
- *Firebase:* EatGPT.dev / Android, iOS, Web

### 4.3 *test* Environment -- NOT IN SCOPE FOR INITIAL CONVERSION
Supports playstore closed testing
- *Android:* Playstore (EatGPT/Closed Testing)
- *iOS:* Appstore (EatGPT/Internal Testing)
- *Web:* http://test.aimeup.app/eatgpt
- *Firebase:* EatGPT.test / Android, iOS, Web

### 4.4 *acceptance* Environment -- NOT IN SCOPE FOR INITIAL CONVERSION
Supports playstore open testing
- *Android:* Playstore (EatGPT/Open Testing)
- *iOS:* Appstore (EatGPT/External Testing)
- *Web:* http://acceptance.aimeup.app/eatgpt
- *Firebase:* EatGPT.acceptance / Android, iOS, Web

### 4.5 *production* Environment -- NOT IN SCOPE FOR INITIAL CONVERSION
Supports playstore production
- *Android:* Playstore (EatGPT/production)
- *iOS:* Appstore (EatGPT/production)
- *Web:* http://aimeup.app/eatgpt
- *Firebase:* EatGPT.production / Android, iOS, Web

---


## 5. Conversion plan

### Doneness
These steps implicitly apply to every user story that touches code
[] aime.hygiene script runs without warnings or errors locally
[] aime.unittest script runs without errors
[] _docs/repo standard docs are updated if anything was changed by the story
[] Changes land via PR; hygiene & tests must pass in CI

#### Phase 1 — Standup Sandbox Environment

**BL-0104 — Monorepo scaffold & tooling**
[] Development environment has pnpm available globally for all project commands.
[] Primary IDE is installed and project opens with working TypeScript/ESLint/Jest integration.
[] Legacy scaffolding is removed (Ladle, shadcn, old Tailwind artifacts) with no residual references.
[] Repository layout matches the documented monorepo specification.
[] A clean clone installs and builds the entire workspace without manual fixes.
[] The workspace builds via a single root build that orchestrates all packages.
[] Toolchain versions are pinned and documented for consistent local setup.
[] The test suite includes both a Node and a React Native project and both run successfully.
[] A single local command performs type check, lint, and tests and fails on violations.
[] A developer can rebuild a clean environment from scratch using only the written guides.
[] A developer can build, run hygiene checks, and commit using only the written guides.
[] Automated structure verification reports the repository as compliant with the documented spec.
[] The verification is deterministic and can be executed locally by any developer.
[] The developer guide explains how to invoke and interpret the verification.

**BL-0105 — UI/state stack locked & wired**
[] A single Expo app serves native and web; routing is provided by Expo Router.
[] App root provides TanStack Query and Redux Toolkit via `@aimeup/core-react`.
[] Styling accepts `className` across RN and RN-Web (NativeWind + css-interop).
[] A KitchenSink screen renders core `@aimeup/ui-native` components without runtime warnings on native and web.
[] Component smoke tests validate interactive basics using `@testing-library/react-native`.

**BL-0106 — Environment & configuration baseline**
[] Environment variables are validated at startup; invalid/missing values are surfaced clearly.
[] Developer guide documents install, run, test, and environment setup end-to-end.

**BL-0107 — Tokens pipeline**
[] `@aimeup/tokens` generates artifacts consumed by styling systems.
[] Generated tokens are reproducible and versioned.
[] A sample screen demonstrates token-driven styling with consistent rendering on RN and RN-Web.

**BL-0115 — UI KitchenSink (RN & RN-Web)**
[] The KitchenSink screen showcases Button/Input/Card variants in `@aimeup/ui-native`.
[] The screen loads without runtime warnings on native and on RN-Web.
[] Component smoke tests confirm visible state changes and basic interactions.

#### Phase 2 — Android → OpenAI shell (PreauthMode, no Firebase)

**BL-0108 — Core domain port**
[] Kotlin shared models are represented as TypeScript types in `@aimeup/core` and `@aimeup/helpers`.
[] zod schemas guard external data boundaries (Firestore/preview I/O).
[] Unit tests for schemas pass and reject invalid inputs.
[] Repository hygiene checks confirm layering rules and export rules are honored and documented.
[] Importing helpers from core is flagged as an error and blocks lint.
[] Importing domain/UI/app/service packages from helpers is flagged as an error and blocks lint.
[] A workspace dependency audit reports “helpers deps: OK” when helpers declare only allowed dependencies.
[] The audit fails with a clear message if helpers declare disallowed workspace dependencies.
[] The developer guide explains how to invoke and interpret the audit.
[] `@aimeup/core` exposes only documented subpaths; root import resolution fails by design.
[] `@aimeup/helpers` exposes only documented subpaths; root import resolution fails by design.
[] Minimal import/compile checks confirm type and runtime resolution for published subpaths.
[] The guardrails are documented in the monorepo guide.

**BL-0110 — OpenAI contracts (in core)**
[] Shared contracts for chat request/response exist in `@aimeup/core/aiapi` and validate preview I/O at runtime.
[] Type/shape compatibility for preview flows is enforced via shared schemas.

**BL-0119 — Android OpenAI shell (new)**
[] The app presents a minimal temporary UI that permits one round-trip OpenAI exchange for PreauthMode purposes.
[] PreauthMode mode can be enabled to operate without Firebase and without persisting data.
[] PreauthMode credentials are local/dev-scoped and excluded from version control.
[] A local build demonstrates a successful PreauthMode chat round-trip on an emulator or device.


#### Phase 3 — Android PreauthMode-only parity

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


#### Phase 4 — Web PreauthMode parity spike

**BL-0118 — Web app shell & routing**
[] The RN-Web shell renders via Expo Router and loads core components successfully.
[] Dev-only query devtools are available on web and absent from production builds.
[] Structured console logging is available in development.
[] A browser smoke flow (load → compose → send → reply → back/refresh) succeeds.
[] An embedded accessibility check reports no serious or critical issues on the Chat screen.


#### Phase 5 — iOS PreauthMode parity spike

**BL-0120 — iOS PreauthMode parity spike (new)**
[] The app runs on an iOS simulator/device with PreauthMode mode enabled (no Firebase).
[] The same minimal chat flow demonstrated on Android works end-to-end on iOS.
[] Reasonable similarity is achieved android.  Where items cannot align, backlog items are recorded.
[] Feature/function gaps are recorded for the backlog
[] Build and run steps for iOS are documented for developers.


#### Phase 6 — Android full parity (Firestore + Firebase Auth)

**BL-0113 — Account integration (client)**
[] The app authenticates against the Dev Firebase project in development.
[] Session state is represented with selectors and persists according to the defined policy.
[] Unit tests validate login, logout, rehydrate, and storage-failure handling.

**BL-0123 — Cleanup legacy infrastructure**
[] The prior Kotlin Firebase project is retired or archived according to policy.
[] The legacy Kotlin repository is archived or removed from active development.
[] Unneeded local tools are either uninstalled or marked as optional in the docs.
[] Documentation confirms legacy components are retired and absent from active builds.

#### Phase 7 — Web parity spike

**BL-0122 — Web parity spike (new)**
[] RN-Web demonstrates the same chat flow as Android for PreauthMode features.
[] Where Firebase-backed features exist, web supports sign-in and protected routes.
[] Playwright exercises authenticated and unauthenticated routes; accessibility checks remain green.

#### Phase 8 — iOS parity spike

**BL-0121 — iOS parity spike (new)**
[] iOS demonstrates the same flows as Android full parity (auth + chat) where applicable.
[] Any iOS-specific permissions/capabilities are gated and documented.
[] A simulator/device smoke flow succeeds; developer steps are documented.


## 6. Tools & Tech Choices
- **Core**:
  - TypeScript
  - WebStorm IDE
  - macOS terminal + zsh
- **React Native Web**:
  - React Native Web target 0.20+ (SDK 53 ships 0.20) current “happy path” with Expo + React 19.
- **React Native**:
  - React Native target 0.79+ via Expo SDK 53 (brings React 19 and RNW 0.20). Don’t pin 0.76.
  - css-interop (used by NativeWind)
- **Shared UI**:
  - React 19.x (upgrade from 18.x)
  - Expo-Managed (RN Runtime Platform)
  - Expo Router (routing for native and web)
  - NativeWind (RN component styling)
  - Tailwind CSS v4 (for NativeWind and RN‑Web css‑interop)
  - design-tokens to back Tailwind and NativeWind
- **Workspace & Builds**:
  - pnpm workspaces
  - Turborepo for caching/pipelines
  - Node version pin (.nvmrc)
  - Metro (RN's bundler/dev server. Used by Expo)
- **Remote services**: 
  - Firebase Auth
  - Firestore
  - Hosting (for web)
  - OpenAI - For conversion, call directly. Post conversion: Called from Functions to secure API keys
- **Testing**:
  - Pre-checkin hygiene
    - ESLint
    - Prettier
    - TypeScript
  - Unit testing
    - Jest-RN (RN tests)
    - Jest-node (javascript tests)
    - babel-jest (transformer for Metro)
    - jest-expo (wanted for RN tests)
    - axe-core a11y check (web unit test run through playwright)
  - e2e testing
    - Maestro (e2e for RN)
    - Playwright for web app
- **Code utilities**:
  - pino — level-based, per-message configuration, JSON structured logging
  - TanStack Query (state management from server)
  - Redux Toolkit (RTK) (state management across app)
  - zod for json schemas + runtime validation (data validation)
  - .env.* + env.ts validation (config)

**Tools OUT OF SCOPE**
- Firebase
  - Firebase Emulator Suite for Firestore/Auth tests
  - firebase-functions + logger (leveled logging to Google Cloud).  Move to backlog to follow conversion.
- Manual production promotion << Future
- No CI for this conversion
  - GitHub Actions (matrix builds)
  - pnpm/Turbo cache
  - This conversion will introduce developer initiated hygeine+unit tests to ensure quality between builds.
- No React Web app.  We will try a react navitve web app instead
  - shadcn/ui (Radix) v4
  - Ladle (light weight UI component dev)
  - Vite (alias react-native → react-native-web; css-interop for className) Not needed because Metro/Expo
- Charts
  - victory-native on mobile
  - victory on web (conditional import/alias). 
  - react-native-svg has a web compatibility layer
- next.js
  - if Expo Router + Metro don't work out, Next.js is Plan B
    - SSR/SEO/web-only features (marketing, edge middleware, image optimization)
    - split the web UI to React-DOM (e.g., desktop-grade tables/charts), first-class web framework
    - want the Expo↔Next integration for a web app that shares RN components, accepting the extra CLI/build surface.
- Testing
  - React Testing Library (web)
  - ts-jest - compiles with the TypeScript compiler, not the Expo/RN Babel chain. RN-specific Babel plugins won’t run, leading to mysterious failures (e.g., reanimated).
  - Git hook runner (e.g., lefthook) — run typecheck/lint/test on pre-push.  We'll do it ourselves
  - MSW (mock service wrapper).  Try to get by with manual mocks or actual service calls
  - Detox (possibly phase 4 for e2e for RN).  Start with Maestro.  Detox is more complicated, but might be needed if maestro doesn't have what we need.
  - Sentry (hosted error & performance monitoring).  Not needed for conversion















