# Kotlin → React + TypeScript Conversion Plan

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
Plan moved to ReactConversionPlan.md


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

