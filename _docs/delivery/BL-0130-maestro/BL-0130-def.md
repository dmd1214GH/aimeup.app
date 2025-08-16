# BL-0130 - Maestro Native E2E

## Overview

- Incorporate Maestro into the automated testing process
- Configure testing for Android Emulator (iOS out of scope)
- Cleanup obsolete scripts

## Requirements and Design References

- `_docs/guides/automated-testing.md`


## Open Questions

- **Maestro Installation Scope**: What is the expected installation scope for Maestro? Global installation on developer machines, project-level dependency in package.json, or other approach? How should developers get Maestro set up initially?
- **Environment Requirements**: We need to refine and reference the environment setup documentation before finishing grooming. What specific Android Emulator requirements and setup steps are needed?
- **aimequal Integration**: We need to strongly define aimequal in the automated testing page. How should the mobile testing integration be documented and standardized?

## Assumptions

- iOS testing is out of scope for this story
- Tests run in local development environment (not CI/CD)
- Metro bundler automation should follow the same pattern as web server management for Playwright tests
- Maestro artifacts should be written to project root `.temp` directory and cleaned up automatically

## Acceptance Criteria
1. [] Work in this story requires thorough understanding of `_docs/guides/automated-testing.md`
2. [] Maestro is installed and available to use for Native E2E testing in our monorepo
3. [] Existing, Jest-based, non-functional, component smoke tests have already been removed by BL-0131 (dependency)
4. [] A new Maestro "smoke-test" executes the identical test to the one established by BL-0131 without encountering errors:
   - Mirrors `smoke.spec.ts` (navigation-focused, visits all pages)
5. [] A second Maestro "fullpoc-test" executes the identical test to the one established by BL-0131 without encountering errors:
   - Mirrors `interaction.spec.ts` (component interaction-focused, tests buttons, inputs, Redux)
6. [] Developer can run `pnpm test:smoke:mobile` to sanity check their code before pushing: Executes the new `smoke-test` defined by this story. Prepare for additional smoke tests.
7. [] Developer can run `pnpm test:e2e:mobile` to fully regression-test their code: Executes the new `fullpoc-test` defined by this story. Prepare for additional e2e tests.
8. [] Both tests should be exact mirrors to their Playwright peers (see details above)
9. [] Tests should run on Android Emulator by default. iOS Simulator support is out of scope for this story. Success is only required on Android Emulator.
10. [] The `pnpm test:smoke:mobile` is included in a consistent way inside \_scripts/aimequal: sequential to others, fail fast, log output, return reliable success/failure result
11. [] Developers can use `_docs/guides/automated-testing.md` to learn 1. How to run the tests 2. Examples for writing Maestro flows 3. A brief description of the smoketest (in the smoketest section)
12. [] All tests run in the Sandbox Environment. Prep and Cleanup are not required at this time.
13. [] Starting the Metro bundler and launching the app on Android Emulator should be automated following the same pattern as web server management for Playwright tests in `_scripts/aimequal`
14. [] `pnpm test:smoke:mobile` runs successfully on Android Emulator
15. [] `pnpm test:e2e:mobile` runs successfully on Android Emulator
16. [] Maestro artifacts (recordings, logs) are written to project root `.temp` directory and cleaned up automatically
17. [] `_docs/guides/environment-setup.md` mentions requirements for Android Emulator and iOS Simulator (optional).
18. [] Remember steps-of-doneness
