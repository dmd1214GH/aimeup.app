# Development Workflow

## Build & Test
```bash
pnpm run build     # Build all packages
pnpm run check     # Hygiene + typecheck + test
```

## Scripts
```bash
./_scripts/aime.hygiene     # ESLint + TypeScript + Prettier
./_scripts/aime.unittest    # Run all tests
./_scripts/aime.verify      # Verify repo structure
```

## Commit
Run hygiene before committing:
```bash
./_scripts/aime.hygiene
git add .
git commit -m "your message"
git push origin main
```