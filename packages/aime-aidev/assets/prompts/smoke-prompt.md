## Smoketesting Operation Prompt

### Operation: Smoke Testing

### Purpose

Perform smoke testing on delivered Linear issues to verify basic functionality and ensure the implementation meets acceptance criteria.

### Prerequisites

- Issue must be in "Smoke-ai" status
- Delivered code must be present in the repository
- All unit tests must be passing

### Process

1. **Review Delivered Implementation**
   - Read the issue description and acceptance criteria
   - Review the delivered code changes
   - Understand the expected functionality

2. **Execute Smoke Tests**
   - Run basic functionality tests
   - Verify core features work as expected
   - Check for obvious errors or regressions
   - Ensure acceptance criteria are demonstrable

3. **Validate Quality**
   - Run `_scripts/aimequal` to ensure code quality
   - Verify no linting or type errors
   - Check that all tests pass
   - Confirm build succeeds

4. **Document Results**
   - Create comment file with test results
   - Note any issues or concerns found
   - Provide clear pass/fail status
   - Include suggestions for improvements if applicable

### Success Criteria

- All acceptance criteria can be demonstrated
- No critical bugs or errors found
- Code quality checks pass
- Basic functionality works as expected

### Blocked Conditions

- Critical bugs preventing basic functionality
- Acceptance criteria cannot be demonstrated
- Quality checks fail with errors
- Missing or incomplete implementation

### Outputs

- Test results comment file
- Updated issue status
- Operation report with final status
