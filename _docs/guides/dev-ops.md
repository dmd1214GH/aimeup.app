

# Terminal Scripts & Code Focus Scope

This setup streamlines aimeup development and supports visual multi-environment workflows.

## Scripts

### `aimeup-env.sh`
- Updates PATH to include `_scripts/`
- Sets aliases (`pn`, `web`, `ui`)
- Sets `NODE_OPTIONS` for memory tuning
- Loads `.env.local` if present

### `dev.sh`
- Detects repo root (`$REPO_PATH`)
- Sources `aimeup-env.sh`
- Drops into a shell at the repo root with env loaded

### `aimeterm`
- Thin wrapper for `dev.sh`
- Works from anywhere when `_scripts` is in PATH

### `term-color`
- Sets macOS Terminal background color, font, and size
- Chooses text color automatically (black/white) for readability
- Use different colors to distinguish environments (dev, stage, prod)

## Workflow
1. Open macOS Terminal
2. Run `aimeterm` → ready-to-code environment
3. Optionally run `term-color dev` / `term-color prod` to color-code environment

## Code Focus Scope
Configured in IDE to:
- Show only `_scripts/`, `apps/`, `packages/`, `services/`, `_docs/`, `configs/`
- Include key root files (`package.json`, lockfiles, configs)
- Hide `.idea/`, `node_modules/`, `.DS_Store`, and other clutter

## Benefits
- One-command environment entry
- Immediate visual context for environment
- Reduced cognitive load in IDE
- Clean git history and working tree
