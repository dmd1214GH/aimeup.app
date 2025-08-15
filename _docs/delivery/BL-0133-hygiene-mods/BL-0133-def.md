# BL-0133 - Prettier and TypeCheck

## Overview
- Incorporate Prettier and TypeCheck into standard quality checks
- Rewrite monorepo folder structure verification
- Cleanup obsolete scripts

## Requirements and Design References
- `_docs/guides/automated-testing.md`
- `_docs/guides/monorepo.md`

## Assumptions / Questions
- Following BL-0313 PlayWright

## Acceptance Criteria
1. [] Existing script `pnpm run typecheck` runs as a standard part of `_scripts/aimequal` to check formatting of our files.  Fail on all warnings and errors.
2. [] Existing script `pnpm run typecheck` runs as a standard part of `_scripts/aimequal` to confirm type-safety across our TypeScript code.  Fail on all warnings and errors.
3. [] ~138 files currently failing prettier are either brought into compliance, or the tests are adjusted through collaboration with human partner.  Consider using `npx prettier --write .`
4. [] `_docs/guides/automated-testing.md` is updated to reflect these capabilities and standards.  Mirror the explanations of ESLint (Test types overview, Test Types and Tools sections)
5. [] A monorepo root level Jest test `monorepo-structure.test.ts` validates that the structural-level folders defined in `_docs/guides/monorepo.md` exist
6. [] A monorepo root level Jest test `monorepo-structure-creep.test.ts` validates that the the monorepo does not contain additional structural-level folders that are not defined in `_docs/guides/monorepo.md`
7. [] Any inconsistencies between monorepo.md, the monorepo-structure tests, and the actual folder structure must be resolved before achieving a successful aimequal check
8. [] Obsolete scripts should be removed from '_scripts/':  `aime.hygiene`, `aime.hygiene`, and `aime.verify`
9. [] All processes that may be impacted by the formatting changes, including those outside of our current automated testing scope, should continue working.
