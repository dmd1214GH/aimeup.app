# Development Workflow

## Build & Test

```bash
pnpm run build     # Build all packages
pnpm run check     # Hygiene + typecheck + test
```

## Scripts

```bash
./_scripts/aimequal     # Run all quality checks (tests, hygiene, prettier, typecheck, E2E)
```

## Commit

Run quality checks before committing:

```bash
./_scripts/aimequal
git add .
git commit -m "your message"
git push origin main
```
