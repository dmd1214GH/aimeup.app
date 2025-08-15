# Task list for BL-0133

1. [x] Setup and review current state
   - Review current prettier configuration (.prettierrc.json, .prettierignore)
   - Review current typecheck script in package.json
   - Analyze ~140 files failing prettier checks
   - Review current aimequal script implementation
   - Identify files/patterns that may need prettier ignore rules

2. [x] Add prettier script to package.json
   - Add `"prettier": "prettier --check ."` script to root package.json
   - Test the script runs correctly
   - Verify it returns non-zero exit code when files need formatting

3. [x] Fix prettier formatting issues
   - Run `npx prettier --write .` to auto-fix formatting issues
   - Review changes to ensure no breaking modifications
   - Handle any files that cannot be auto-fixed
   - Update .prettierignore if necessary for legitimate exceptions
   - Verify all files pass prettier check

4. [x] Integrate prettier into aimequal script
   - Add prettier as a separate test step in \_scripts/aimequal
   - Position it appropriately in the test sequence
   - Test the integration works correctly
   - Ensure proper error handling and output

5. [x] Integrate typecheck into aimequal script
   - Add typecheck as a separate test step in \_scripts/aimequal
   - Position it appropriately in the test sequence
   - Verify typecheck runs and reports errors correctly
   - Test the full aimequal flow with both new additions

6. [x] Create monorepo structure validation tests
   - Create monorepo-structure.test.ts at monorepo root
   - Implement test to validate exactly these folders exist: \_docs, \_scripts, apps, services, packages, configs
   - Ensure test ignores dot-folders, node_modules, and \_reference folder
   - Test the validation works correctly

7. [x] Create monorepo structure creep prevention test
   - Create monorepo-structure-creep.test.ts at monorepo root
   - Implement test to prevent additional structural folders beyond the approved list
   - Ensure test ignores dot-folders, node_modules, and \_reference folder
   - Verify both structure tests pass

8. [x] Update Jest configuration
   - Update root Jest config to include new monorepo structure tests
   - Ensure Jest excludes Playwright test files as per assumptions
   - Verify test discovery works correctly
   - Run tests to confirm configuration

9. [x] Remove obsolete scripts
   - Delete \_scripts/aime.hygiene
   - Delete \_scripts/aime.unittest
   - Delete \_scripts/aime.verify
   - Verify no references to these scripts remain in documentation or code

10. [x] Update automated testing documentation
    - Update \_docs/guides/automated-testing.md to document prettier capability
    - Add prettier to "Test types overview" section
    - Add prettier to "Test Types and Tools" section
    - Document prettier in individual test execution options
    - Update \_docs/guides/automated-testing.md to document typecheck integration
    - Ensure documentation matches implementation

11. [x] Resolve monorepo structure inconsistencies
    - Compare \_docs/guides/monorepo.md with actual folder structure
    - Compare monorepo-structure tests with documentation
    - Resolve any discrepancies found
    - Ensure all three sources align (docs, tests, actual structure)

12. [x] Final validation and testing
    - Run full aimequal script successfully
    - Verify all tests pass including new prettier and typecheck steps
    - Confirm monorepo structure tests work correctly
    - Test that processes outside automated testing still work
    - Verify no regression in existing functionality

13. [x] Demonstrate acceptance criteria
    - Show prettier script runs and fails appropriately (AC#1)
    - Show typecheck runs in aimequal (AC#2)
    - Demonstrate all files pass prettier formatting (AC#3)
    - Show updated automated-testing.md documentation (AC#4)
    - Demonstrate monorepo-structure.test.ts validation (AC#5)
    - Demonstrate monorepo-structure-creep.test.ts prevention (AC#6)
    - Confirm monorepo consistency across docs/tests/structure (AC#7)
    - Verify obsolete scripts are removed (AC#8)
    - Confirm all impacted processes still work (AC#9)
