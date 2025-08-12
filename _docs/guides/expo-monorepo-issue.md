# Expo + pnpm Monorepo Configuration Requirements

## Problem Statement
Expo and React Native require specific pnpm configuration to work properly in a monorepo due to their implicit dependencies and Metro bundler's module resolution expectations.

## Issue Details
When running Expo within a pnpm monorepo, the following issues occur:
1. React Native peer dependencies are not properly resolved
2. Missing modules cascade endlessly (whatwg-fetch → invariant → expo-asset → expo-modules-core → react-devtools-core → regenerator-runtime...)
3. The pnpm hoisting mechanism conflicts with Metro bundler's module resolution

## Verification
- ✅ All BL-0105 acceptance criteria code is correctly implemented
- ✅ The Kitchen Sink demo works in the pnpm monorepo with shamefully-hoist=true
- ✅ Verified working on Android device and web browser

## Solution

### Required Configuration
Add to `.npmrc` in the monorepo root:
```
shamefully-hoist=true
```

This enables full hoisting of dependencies, making them available to Metro bundler.

### Additional Dependencies
Some implicit React Native dependencies need explicit installation:
- `regenerator-runtime`
- `whatwg-fetch`
- `invariant`
- `fbjs`

### Why This Works
- **shamefully-hoist=true** flattens the node_modules structure similar to npm/yarn
- Metro bundler expects dependencies to be accessible from the project root
- React Native has many implicit peer dependencies not declared in package.json


## Lessons Learned
- pnpm's strict dependency isolation conflicts with React Native's expectations
- Metro bundler expects a flatter node_modules structure
- Expo's dependency chain is complex and doesn't play well with pnpm hoisting

## Action Items
- [x] Configure shamefully-hoist in .npmrc
- [x] Install missing React Native dependencies
- [x] Verify app works on native and web platforms
- [x] Document configuration requirements

## BL-0105 Status
Despite the infrastructure issues, all acceptance criteria have been met:
- ✅ TanStack Query and Redux providers created
- ✅ Kitchen Sink screen implemented
- ✅ Component tests written
- ✅ Lint rules configured
- ✅ Documentation complete
- ✅ Kitchen Sink verified working on Android device

The issue has been resolved with proper pnpm configuration.