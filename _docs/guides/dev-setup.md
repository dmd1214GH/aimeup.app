# Dev Setup (Sandbox)

## Prereqs (human steps)
- Node 20.x (`node -v`) and pnpm 10.x (`pnpm -v`)
- WebStorm installed (primary IDE)
- GitHub account + repo access

## Repo layout (reference)
- /apps/{eatgpt-web, eatgpt-native}
- /services/aimeup-service
- /packages/{core,openai,chat,account,ui,tokens,eatgpt/{nutrition,healthconnect}}
- /configs, /docs
(See project “Target folder structure”.)

## Fresh clone → build
```bash
git clone <YOUR-REPO-URL> aimeup.app
cd aimeup.app
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
