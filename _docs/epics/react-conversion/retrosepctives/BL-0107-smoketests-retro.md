

  The Honest Truth:

  The smoke tests are misleading - they're not real tests, just placeholders that always pass. The acceptance
  criterion asks for "smoke tests that confirm visible state changes and basic interactions," but what we have are
  tests that confirm nothing except that Jest can run.

  To properly complete BL-0115, we'd need either:
  1. Fix the React Native/Jest setup to run real component tests
  2. Use a different testing approach (like Detox for E2E tests)
  3. Acknowledge that the tests are placeholders and the actual verification would need to be done manually

  The components likely work fine (since the screen loads), but the tests don't actually verify that.


> I suppose we should try to resolve the smoketest blocker.  Please provide a write up of the issue so I can 
  research

⏺ React Native 0.79 + Jest Testing Blocker

  The Problem

  Cannot run React Native component tests with Jest due to module parsing errors. When attempting to test components
   that import from react-native, Jest fails with:

  SyntaxError: Cannot use import statement outside a module
  at /node_modules/react-native/index.js:28
  import typeof * as ReactNativePublicAPI from './index.js.flow';

  Root Cause

  React Native 0.79 ships with Flow type annotations in its source files that Jest cannot parse. The file
  @react-native/js-polyfills/error-guard.js contains:
  type ErrorHandler = (error: mixed, isFatal: boolean) => void;

  This is Flow syntax, not standard JavaScript, causing Jest to fail during parsing.

  Current Setup

  - React Native: 0.79.0
  - React: 19.0.0
  - Jest: 29.7.0
  - Testing Library: @testing-library/react-native 12.0.0
  - Babel: @react-native/babel-preset 0.81.0

  What We've Tried

  1. Various Jest presets: react-native, jest-expo, ts-jest
  2. Transform configurations: Multiple transformIgnorePatterns to include RN modules
  3. Babel configurations: Both .babelrc and babel.config.js with RN preset
  4. Module mocking: Attempted to mock react-native in jest.setup.js

  The Incompatibility

  - React Native 0.79 requires React 19
  - Most RN testing tools haven't caught up to React 19 yet
  - Jest's React Native preset expects different module formats

  Potential Solutions to Research

  1. Downgrade to React Native 0.74.x with React 18
    - More stable testing ecosystem
    - Better Jest compatibility
  2. Use Metro for tests instead of Jest
    - Metro understands Flow types
    - Native to React Native
  3. Strip Flow types before Jest runs
    - Use flow-remove-types in transform
    - Or babel plugin to strip Flow
  4. Mock React Native entirely
  jest.mock('react-native', () => ({
    View: 'View',
    Text: 'Text',
    // ... mock all components
  }))
  5. Use Detox or Maestro for E2E testing instead
    - Bypass unit testing issues
    - Test actual app behavior

  Questions for Research

  - Is React Native 0.79 + React 19 + Jest a known incompatible combination?
  - Are there community solutions or workarounds?
  - Should we wait for React Native 0.80 which might fix this?
  - Is downgrading to RN 0.74.x + React 18 an option for the project?

  Impact

  Without working component tests:
  - Cannot verify component behavior programmatically
  - Cannot test user interactions (button clicks, text input)
  - Cannot validate props and state changes
  - Relies on manual testing only

  Recommendation

  Either:
  1. Accept the limitation - Use placeholder tests and manual QA for now
  2. Downgrade versions - Move to RN 0.74.x + React 18 for test compatibility
  3. Alternative testing - Use E2E tools like Detox instead of unit tests
  4. Wait for ecosystem - RN 0.80 or testing library updates might resolve this

  The core issue is that we're on the bleeding edge with React 19 + RN 0.79, and the testing ecosystem hasn't caught
   up yet.

