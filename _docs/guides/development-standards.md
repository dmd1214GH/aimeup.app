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

## Output Parsing

- Never parse stdout/stderr for operation results or status determination
- Operation status must come from structured files (e.g., operation-report\*.md) written to the working folder
- Use exit codes for basic success/failure, files for detailed status

## Monorepo Structure Changes

Any new folder or dependency change in the monorepo must comply with these standards:

- Be approved through the agreed task list or with explicit human concent.
- Changes must comply with the rules discussed in `_docs/guides/monorepo.md`
- `_docs/guides/monorepo.md` must be updated with the new structure
- The lint task which validates the monorepo structure against the specification must be addressed.
