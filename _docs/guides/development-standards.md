# Development Standards (Code & Test)

## General directives

- When a material conflict exists in directions, consider the assigned task to be blocked, report the status, and ask for help

## Authoring Automated Tests

- Produce automated tests along with code delivery
- Maintain test coverage in compliance with `_docs/guides/automated-testing.md`
- Follow existing organizational and naming patterns in the project
- Use brief but descriptive test names
- Group related tests in describe blocks
- Test error states and edge cases
- Write maintainable and readable tests
- Use proper assertions and matchers
- Clean up after tests
- Avoid testing implementation details

## Dev-ops Standards

- use $REPO_PATH as the root of all commands. Fail if not set. Never use absolute path or relative path if the current directory is not known.

## Monorepo Structure Changes

Any new folder or dependency change in the monorepo must comply with these standards:

- Be approved through the agreed task list or with explicit human concent.
- Changes must comply with the rules discussed in `_docs/guides/monorepo.md`
- `_docs/guides/monorepo.md` must be updated with the new structure
- The lint task which validates the monorepo structure against the specification must be addressed.

## Development Quality Check

Perform these steps before considering work to be complete, and before checking in code

- merge code from the working branch or main into your local repo
- clean build free of errors and warnings
- run `_scripts/aimequal` to verify general quality. Resolve issues (never change the test to avoid the error without human approval)
