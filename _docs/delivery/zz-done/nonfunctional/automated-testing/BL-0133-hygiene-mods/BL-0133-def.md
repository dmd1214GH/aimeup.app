# BL-0133 - Prettier and TypeCheck

## Overview

- Incorporate Prettier and TypeCheck into standard quality checks
- Rewrite monorepo folder structure verification
- Cleanup obsolete scripts

## Requirements and Design References

- `_docs/guides/automated-testing.md`
- `_docs/guides/monorepo.md`

## Open Questions

- NONE

## Assumptions

- Following BL-0131 Playwright (completed)
- `_reference` folder containing archived Kotlin code is excluded from structural validation
- Existing .prettierrc.json and .prettierignore configurations remain unchanged
- Jest configuration will be updated to exclude Playwright test files
- Prettier and typecheck will be added as separate steps in aimequal, not combined with hygiene

## Acceptance Criteria

1. [] Create and integrate `pnpm run prettier` script (`"prettier": "prettier --check ."`) that runs as a standard part of `_scripts/aimequal`. Script should fail with non-zero exit code if any files need formatting.
2. [] Existing script `pnpm run typecheck` runs as a standard part of `_scripts/aimequal` to confirm type-safety across our TypeScript code. Fail on all warnings and errors.
3. [] ~140 files currently failing prettier are either brought into compliance, or the tests are adjusted through collaboration with human partner. Consider using `npx prettier --write .`
4. [] `_docs/guides/automated-testing.md` is updated to reflect these capabilities and standards. Mirror the explanations of ESLint (Test types overview, Test Types and Tools sections)
5. [] A monorepo root level Jest test `monorepo-structure.test.ts` validates that exactly these top-level folders exist: `_docs`, `_scripts`, `apps`, `services`, `packages`, `configs`. Tests should ignore dot-folders, node_modules, and \_reference folder.
6. [] A monorepo root level Jest test `monorepo-structure-creep.test.ts` validates that the monorepo does not contain additional structural-level folders beyond: `_docs`, `_scripts`, `apps`, `services`, `packages`, `configs`. Tests should ignore dot-folders, node_modules, and \_reference folder.
7. [] Any inconsistencies between monorepo.md, the monorepo-structure tests, and the actual folder structure must be resolved before achieving a successful aimequal check
8. [] Obsolete scripts should be removed from '\_scripts/': `aime.hygiene`, `aime.unittest`, and `aime.verify`
9. [] All processes that may be impacted by the formatting changes, including those outside of our current automated testing scope, should continue working.

## Grooming Status

Status: Ready for Tasking

### Questions

- NONE (all resolved)

### What was changed in grooming

- Clarified AC#1: Added explicit prettier script definition `"prettier": "prettier --check ."`
- Clarified AC#5-6: Specified exact folders to validate (\_docs, \_scripts, apps, services, packages, configs)
- Added assumption about \_reference folder exclusion from structural validation
- Added assumption about Jest/Playwright test separation
- Added assumption about prettier/typecheck being separate aimequal steps
- Fixed typo: Changed "aime.hygiene" duplicate to "aime.unittest" in AC#8
- Updated ~138 to ~140 files needing prettier formatting (after actual count)
- Separated "Assumptions/Questions" into distinct sections

## Delivery Status

Status: DONE

### Compromises or shortcuts

- None. All acceptance criteria were fully implemented without shortcuts.

### Unexpected variations from expectations (positive or negative)

- **Positive**: Only 3 files needed prettier formatting instead of expected ~140 files
- **Positive**: Enhanced aimequal beyond requirements with robust failure detection and log verification
- **Resolved issue**: Fixed Jest/Playwright test conflict that was causing test failures
- **Critical issue resolved**: Fixed shell output buffering issues that prevented error messages from displaying when tests failed

### Technical debt delta or recommendations

- **Improved**: Removed obsolete scripts (aime.hygiene, aime.unittest, aime.verify)
- **Improved**: Added safety measures to aimequal preventing false positives
- **Improved**: Enhanced error output display for better debugging experience
- **Future consideration**: Monorepo structure test files could be organized in a dedicated test directory
- **Future consideration**: May want to add .prettierignore file as the codebase grows

### Feedback on development process

- Clear acceptance criteria made implementation straightforward
- The phased approach (Groom, Task, Deliver) worked well for this item
- Adding the aimequal enhancements during delivery improved overall quality
- **Critical process insight**: Shell script error handling requires careful attention to output buffering and error propagation to ensure failures are visible to users
- **Process improvement**: The monorepo structure tests evolved from simple top-level validation to comprehensive hierarchy validation based on user feedback during showcase

### Deferred work

- None. All planned work was completed.
