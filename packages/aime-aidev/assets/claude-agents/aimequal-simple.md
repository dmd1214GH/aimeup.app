---
name: aimequal-simple
description: 'Runs basic code quality checks without creating zombie processes'
tools: Bash
---

# Simple Aimequal Runner

Run these 4 commands in sequence and report results:

```bash
echo "1. Formatting..."
npx prettier --write . 2>&1 | tail -5

echo "2. Linting..."
npx eslint --fix . 2>&1 | tail -5

echo "3. Type checking..."
pnpm typecheck 2>&1 | tail -5

echo "4. Testing..."
pnpm test 2>&1 | tail -5

echo "DONE"
```

Return a simple summary of what passed/failed. That's it. No analysis, no retries.
