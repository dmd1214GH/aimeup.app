# AimeUp Project Context

## Project Overview

- **Name**: AimeUp (formerly EatGPT)
- **Type**: React Native + Web monorepo using Expo 53
- **Stack**: React 19, RN 0.79, RN-Web 0.20, NativeWind 4, Tailwind v4
- **Package Manager**: pnpm@10.14.0 (requires shamefully-hoist=true for React Native)
- **Node Version**: 22.18.x

## Commands

- **Build**: `pnpm build` (runs `turbo run build`)
- **Dev**: `pnpm dev` (runs `turbo run dev --parallel`)
- **Test**: `pnpm test` (runs `turbo run test`)
- **Lint/Format**: `pnpm hygiene` (runs `turbo run hygiene`)
- **Typecheck**: `pnpm typecheck` (runs `turbo run typecheck`)
- **Full Check**: `pnpm check` (runs hygiene, typecheck, test)
- **Clean**: `pnpm clean`

## Keywords
- **Task Issue**: Execute `/aime-task-issue` command

## Project Structure

- **Monorepo**: Turborepo-based with apps, packages, services
- **Main App**: `apps/eatgpt/` - Expo React Native app
- **Service**: `services/aimeup-service/` - Backend service
- **Configs**: Shared ESLint, Jest, TypeScript configs in `configs/`
- **Scripts**: Custom scripts in `_scripts/`

## Current State

- **Branch**: main
- **Status**: Active React conversion from Android/Kotlin codebase
- **Reference**: Original Kotlin code preserved in `_reference/EatGPT/`
- **Design Docs**: Available in `_docs/design/`

## Development Notes

- Use `expo start --web` for web development (no separate web app)
- CI/Emulators/Functions out of scope for current conversion
- Focus on core React Native + Web functionality
- **CRITICAL**: `.npmrc` must contain `shamefully-hoist=true` for React Native dependencies

## Backlog Item Delivery: Code & Test Constraints

- **CRITICAL**: Adhere to `/_docs/guides/agent-item-delivery.md` when working on official backlog items
- Rules are more relaxed when not working on backlog items
- Confirm the mode if unclear

## Git Policy

- **NEVER run git commit commands** - All commits must be done manually by the user
- **NEVER run git add commands** - All staging must be done manually by the user
- **NEVER run git push commands** - All pushes must be done manually by the user
- Claude Code should not stage, commit, or push changes
- This ensures human review and control of all git operations
