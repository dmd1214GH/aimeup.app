# Automated Testing Guide

## Overview
- Purpose and scope of automated testing
- Testing philosophy and principles
- How testing fits into the development workflow

## Automated Testing Strategy

### Test types overview
- Unit Tests (Jest) - Business logic and utility functions
- Code Quality (ESLint) - Linting, formatting, type checking  
- Native E2E (Maestro) - Mobile app user workflows
- Web E2E (Playwright) - Web app user workflows
- Accessibility (axe-core) - WCAG compliance checks

### Developer Execution
Developers must execute these tests before pushing to a branch.

Consolidated execution script:
```bash
# All existing tests outputs to .temp/aimequal.[timestamp].txt
aimequal
```

Individual test execution options:
```bash
# Run all unit tests with Jest
pnpm test

# Run code quality checks (lint, format, typecheck)
pnpm hygiene

# Run type checking only
pnpm typecheck

# Run linting only
pnpm lint
```

### Timeout Standards
All automated tests must enforce reasonable timeouts to prevent runaway processes:

**Unit Tests (Jest)**
- Individual test: 5 seconds
- Test suite: 60 seconds
- Total run: 5 minutes

**E2E Tests (Playwright/Maestro)**
- Individual test: 30 seconds  
- Test suite: 2 minutes
- Total run: 5 minutes
- Browser/app launch: 30 seconds

**Implementation Examples:**
```bash
# Playwright with timeouts
npx playwright test --timeout=30000 --max-failures=3 --workers=1

# Jest with timeouts
jest --testTimeout=5000 --maxWorkers=2

# Custom script with timeout
timeout 300 pnpm test:e2e:web || exit 1
```

**Circuit Breaker Rules:**
- If a test fails 3 times with the same error, stop and investigate
- If any process runs >5 minutes without output, terminate
- If port conflicts occur repeatedly, abort and check environment


## Test Types & Tools
This section describes the types of automated tests to be implemented, as well as scope and strategy decisions:


### Unit Tests (Jest)
- **Purpose**: Test individual functions/components in isolation
- **Tools**: 
  - Jest - JavaScript testing framework that provides test runner, assertions, and mocking capabilities
  - React Testing Library - Utilities for testing React components by simulating user behavior
- **Coverage**: Business logic, utility functions, component behavior
- **Execution**: 
```bash
pnpm test
# or
pnpm test:unit
```
- **Current Status**: ✅ Implemented - Basic Jest setup working for utility functions and business logic
- **Location**: `__tests__/` directories alongside source files, or `*.test.ts` files
- **Naming Standards**: `*.test.ts` or `*.test.tsx` files, test functions named `describe('functionName', () => {})`. Examples: `utility.test.ts`, `auth-service.test.ts`, `date-helpers.test.ts`
- **Sample Test**: 
```typescript
// packages/helpers/utility/__tests__/utility.test.ts
import { formatDate } from '../utility';

describe('formatDate', () => {
  it('should format ISO date string to readable format', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toBe('Jan 15, 2024');
  });
});
```
- **Coverage Standards**: Minimum 80% line coverage for utility functions, 100% for critical business logic

### Code Quality Tests (ESLint)
- **Purpose**: Automated code quality checks and style enforcement
- **Tools**: 
  - ESLint - JavaScript/TypeScript linting and code quality rules
  - Prettier - Code formatting and style consistency
  - TypeScript - Static type checking and compilation validation
- **Coverage**: Code style, potential bugs, type safety, best practices
- **Execution**: 
```bash
pnpm hygiene
```
- **Current Status**: ✅ Implemented - Part of the hygiene pipeline
- **Location**: Configuration files in root and package directories (`eslint.config.js`, `prettier.config.js`, `tsconfig.json`)
- **Naming Standards**: Standard config file names, rules defined in `configs/` directory. Examples: `eslint.config.js`, `prettier.config.js`, `tsconfig.json`
- **Sample Configuration**: 
```javascript
// configs/eslint/base.cjs
module.exports = {
  extends: ['@aimeup/eslint-config-base'],
  rules: {
    'no-console': 'warn',
    'prefer-const': 'error'
  }
};
```
- **Coverage Standards**: All files must pass linting, formatting, and type checking before commit

### Native End-to-End Tests (Maestro)
- **Purpose**: Test complete user workflows in React Native mobile app
- **Tools**: 
  - Maestro - Mobile app testing framework that simulates real user interactions on React Native
- **Coverage**: Critical user journeys, mobile-specific functionality
- **Execution**: 
```bash
pnpm test:e2e:mobile
```
- **Current Status**: 🚧 Not Started - Tools identified but not yet configured or implemented
- **Location**: `__tests__/e2e/` directories in app packages
- **Naming Standards**: `*.flow.yaml` files, test suites named by user journey (e.g., `user-authentication.flow.yaml`, `nutrition-tracking.flow.yaml`, `chat-conversation.flow.yaml`)
- **Sample Test**: 
```yaml
# apps/eatgpt/__tests__/e2e/user-authentication.flow.yaml
appId: com.eatgpt.app
---
- launchApp
- tapOn:
    id: "login-button"
- inputText:
    id: "email-input"
    text: "test@example.com"
- inputText:
    id: "password-input"
    text: "password123"
- tapOn:
    id: "signin-button"
- assertVisible:
    id: "dashboard"
```
- **Coverage Standards**: 
  - All critical user flows should have E2E tests. Should mirror Playwright.
  - For MVP:
    - Android: Android Studio Emulator
    - iOS: iOS Simulator  TO BE ADDED LATER



### Web End-to-End Tests (Playwright)
- **Purpose**: Test complete user workflows in React Native Web app
- **Tools**: 
  - Playwright - Web testing framework that automates browser interactions for React Native Web
- **Coverage**: Critical user journeys, web-specific functionality
- **Execution**: 
```bash
# IMPORTANT: All Playwright commands must be run from the app directory
cd $REPO_PATH/apps/eatgpt

# Run smoke test only
pnpm test:smoke:web

# Run full POC test only  
pnpm test:e2e:web

# Run all E2E tests
pnpm test:e2e:web:all

# Run on different browsers (optional)
npx playwright test smoke.spec.ts --project=webkit     # Safari
npx playwright test smoke.spec.ts --project=firefox    # Firefox

# Run tests with visible browser (headed mode)
npx playwright test smoke.spec.ts --headed             # All browsers visible
npx playwright test smoke.spec.ts --project=firefox --headed  # Firefox visible
SLOW_MO=500 npx playwright test smoke.spec.ts --headed # Slow motion for debugging
```
- **Current Status**: ✅ Implemented - Smoke and POC tests configured for Chrome
- **Location**: `apps/eatgpt/__tests__/e2e/` directory
- **Naming Standards**: `*.spec.ts` files, test suites named by purpose (e.g., `smoke.spec.ts`, `fullpoc.spec.ts`)
- **Sample Test**: 
```typescript
// apps/eatgpt/__tests__/e2e/user-authentication.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test('should allow user to sign in with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="signin-button"]');
    await expect(page).toHaveURL('/dashboard');
  });
});
```
- **Coverage Standards**: 
  - All critical user flows should have E2E tests. Should mirror Maestro.
  - For MVP, Chromium only (covers Chrome/Edge) on a MacBook air





### Smoke Tests
- **Purpose**: Quick sanity checks of UI components after builds without running full E2E test suites
- **Tools**: 
  - Maestro (Mobile) - Subset of critical mobile user flows
  - Playwright (Web) - Subset of critical web user flows
- **Coverage**: Core app functionality, critical user journeys, basic component rendering
- **Execution**: 
```bash
pnpm test:smoke:mobile  # Coming in BL-0130
pnpm test:smoke:web     # Available now
```
- **Current Status**: 
  - Web: ✅ Implemented - Navigation tests for all 4 main pages
  - Mobile: 🚧 Not Started - Coming in BL-0130
- **Location**: 
  - Web: `apps/eatgpt/__tests__/e2e/smoke.spec.ts`
  - Mobile: Will be in `__tests__/e2e/` directories
- **Naming Standards**: `smoke.spec.ts` (Playwright), `smoke.flow.yaml` (Maestro)
- **Sample Tests**: 
```yaml
# Maestro smoke test - App launches and shows main screen
appId: com.eatgpt.app
---
- launchApp
- assertVisible:
    id: "main-screen"
- assertVisible:
    id: "navigation-menu"
```
```typescript
// Playwright smoke test - Basic web navigation works
import { test, expect } from '@playwright/test';
****
test.describe('Smoke Tests - Basic Navigation', () => {
  test('should load main page and show navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-menu"]')).toBeVisible();
  });
});
```
- **Coverage Standards**: Must test app launch, basic navigation, and core UI rendering. Should complete in under 2 minutes total. Focus on "does the app work at all?" rather than comprehensive testing.

### Accessibility Tests
- **Purpose**: Ensure app meets accessibility standards
- **Tools**: 
  - axe-core - JavaScript library that identifies accessibility violations in web content
  - Playwright accessibility checks - Built-in accessibility testing capabilities for web applications
- **Coverage**: Screen reader compatibility, keyboard navigation, color contrast
- **Execution**: 
```bash
pnpm test:a11y
```
- **Current Status**: 🚧 Not Started - Tools identified but not yet configured or implemented
- **Location**: Integrated with E2E tests and as standalone accessibility test suites
- **Naming Standards**: `*.a11y.spec.ts` files, test suites named by accessibility concern. Examples: `keyboard-navigation.a11y.spec.ts`, `screen-reader.a11y.spec.ts`, `color-contrast.a11y.spec.ts`
- **Sample Test**: 
```typescript
// apps/eatgpt/__tests__/a11y/keyboard-navigation.a11y.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
  test('should allow navigation through all interactive elements', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    // Test tab order and focus management
  });
});
```
- **Coverage Standards**: E2E tests are only added to the smoktest as needed.  Current inclusion:
  - Open the app, click on each high level button in the current testing solution





## Out-of-scope / Future

These elements are not considered for inclusion at this time:
- UI Component tests in Jest
- Integration tests in Jest
- Automated CI tests
- Exhaustive browser and platform testing with PlayWright
- Thorough native device testing on Maestro
- Automatically capturing screenshots during E2E testing

  

### (Out-of-scope) Component Tests
- **Purpose**: Test React Native components with mocked dependencies
- **Tools**: 
  - Jest - Test runner and mocking framework for React Native components
  - @testing-library/react-native - React Native-specific testing utilities that focus on user interactions
- **Coverage**: Component rendering, user interactions, props handling
- **Execution**: `pnpm test:components`
- **Current Status**: ❌ Blocked - RN 0.79 + Jest compatibility issues prevent component testing.  Will substitute with accelerated E2E testing capability.

### (Out-of-scope) Integration Tests
- **Purpose**: Test interactions between multiple components/services
- **Tools**: 
  - Jest - Orchestrates tests and provides mocking for external dependencies
  - React Testing Library - Enables testing component interactions and state changes
- **Coverage**: API integrations, state management, data flow
- **Execution**: `pnpm test:integration`
- **Current Status**: ❌ Blocked - RN 0.79 + Jest compatibility issues prevent component testing.  Will substitute with accelerated E2E testing capability.

### (Out-of-scope) CI/CD Pipeline
- **Purpose**: Automated test execution and quality gates
- **Tools**: 
  - GitHub Actions - Automated workflow execution
  - Turbo - Build caching and pipeline orchestration
  - pnpm - Package management and script execution
- **Coverage**: Automated testing, build verification, deployment gates
- **Execution**: Triggered on pull requests and commits
- **Current Status**: ❌ Out of scope - No CI for this conversion phase. Testing will be developer-initiated using local commands.
