---
description: Run tests and automatically fix common issues
tools: Bash, Read, Edit, MultiEdit
---

# Run Tests and Fix Issues

You are running the test suite and will automatically fix common issues.

## Process

### Step 1: Run Initial Test

```bash
# Run aimequal with the simple reverted version (no E2E tests)
_scripts/aimequal
```

### Step 2: Analyze Results

If tests fail, check the latest output file:

```bash
OUTPUT_FILE=$(ls -t .temp/aimequal.*.txt 2>/dev/null | head -1)
if [ -n "$OUTPUT_FILE" ]; then
  echo "Checking $OUTPUT_FILE for issues..."
  head -100 "$OUTPUT_FILE"
fi
```

### Step 3: Fix Common Issues

Based on the errors found:

#### For formatting errors (prettier):

```bash
npx prettier --write .
```

#### For linting errors (eslint):

```bash
npx eslint --fix .
```

#### For snapshot failures:

```bash
pnpm test -- --updateSnapshot
```

### Step 4: Verify Fixes

Run aimequal again to check if fixes worked:

```bash
# Run again to verify fixes
_scripts/aimequal
```

### Step 5: Report Results

Provide a clear summary:

- What was the initial state
- What fixes were applied
- What is the final state
- Any remaining issues that need manual intervention

## Important Notes

1. This runs in a forked context, keeping the main conversation clean
2. Apply fixes selectively based on actual errors found
3. Maximum 2 test runs to avoid loops
4. If tests still fail after fixes, report what needs manual attention

$ARGUMENTS
