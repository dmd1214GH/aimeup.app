# DO NOT CREATE TESTS FOR aimequal-runner SUBAGENT

## Why This File Exists

The `aimequal-runner` subagent should NOT have unit tests because it would create a self-referential loop:

1. The aimequal-runner subagent's purpose is to fix failing tests in `_scripts/aimequal`
2. If we test the aimequal-runner itself, those tests become part of what aimequal runs
3. If those tests fail, the aimequal-runner might try to "fix" its own test by modifying itself
4. This creates confusion and potential infinite loops

## What to Do Instead

- The aimequal-runner subagent should be tested manually by invoking it
- Integration testing can be done by creating intentionally broken tests in a sandbox
- The subagent's YAML frontmatter can be validated by other means if needed

## Important

**DO NOT CREATE**:

- `aimequal-runner.test.ts`
- `test-aimequal-runner.ts`
- Any other test file that tests the aimequal-runner subagent

This is a deliberate design decision to prevent self-referential testing loops.
