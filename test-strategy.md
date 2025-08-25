# Test Strategy & Commands

## Current Test Organization Issues

1. **No clear e2e command** - `pnpm test:e2e` doesn't exist
2. **Scattered test types** - E2E tests only in apps/eatgpt
3. **Missing coverage** - lc-runner has no integration/e2e tests
4. **Unclear naming** - "smoke" vs "e2e" vs "interaction" confusion

## Proposed Test Structure

### Root Level Commands (package.json)

```json
{
  "scripts": {
    "test": "turbo run test", // All unit tests
    "test:integration": "turbo run test:int", // Integration tests
    "test:e2e": "turbo run test:e2e", // All e2e tests
    "test:all": "pnpm test && pnpm test:integration && pnpm test:e2e"
  }
}
```

### Test Types by Package

#### apps/eatgpt (UI Tests)

- `test` - Jest unit tests for components
- `test:e2e:web` - Playwright web UI tests
- `test:e2e:mobile` - Maestro mobile UI tests

#### packages/aidevops/lc-runner (CLI Tool Tests)

- `test` - Unit tests (mocked dependencies) - ✅ Has 260
- `test:int` - Integration tests (real files, mocked APIs) - ❌ Missing
- `test:e2e` - End-to-end tests (real CLI execution) - ❌ Missing

#### Other packages

- `test` - Unit tests only

## Test Pyramid for lc-runner

```
        /\
       /e2e\      <- 5-10 tests (full scenarios)
      /------\
     /  int   \   <- 20-30 tests (real file ops)
    /----------\
   /    unit    \ <- 260 tests (fully mocked)
  /--------------\
```

## Why lc-runner Keeps Breaking

Despite 260 unit tests, it breaks because:

1. **Unit tests mock everything** - Don't test real file operations
2. **No integration tests** - Don't test component interactions
3. **No e2e tests** - Don't test actual CLI usage

## Recommended Actions

1. **Add to root package.json:**

   ```bash
   "test:e2e": "pnpm --filter @eatgpt/app test:e2e:web && pnpm --filter @aidevops/lc-runner test:e2e"
   ```

2. **Add to lc-runner package.json:**

   ```bash
   "test:int": "jest tests/integration --testTimeout=10000",
   "test:e2e": "jest tests/e2e --runInBand --testTimeout=30000"
   ```

3. **Create test levels:**
   - `tests/unit/` - Current tests (mocked)
   - `tests/integration/` - Real files, mocked APIs
   - `tests/e2e/` - Full CLI execution

## Running Tests

```bash
# Quick feedback (seconds)
pnpm test                    # Unit tests only

# Medium feedback (minutes)
pnpm test:integration        # Integration tests

# Full validation (5-10 min)
pnpm test:e2e               # All e2e tests

# Pre-commit/CI
pnpm test:all               # Everything
```

## Test Examples

### Integration Test (Real Files)

```typescript
test('creates correct file structure', () => {
  // Use real temp directory
  const result = lcRunner.execute('Deliver', 'AM-25', {
    linearApi: mockApi, // Only mock external API
  });

  // Check REAL files were created
  expect(fs.existsSync('work/lcr-AM-25/op-Deliver-*')).toBe(true);
});
```

### E2E Test (Full CLI)

```typescript
test('full CLI execution', () => {
  // Actually spawn the CLI process
  const result = execSync('pnpm lc-runner Deliver AM-25');

  // Verify complete behavior
  expect(result.stdout).toContain('Operation completed');
});
```
