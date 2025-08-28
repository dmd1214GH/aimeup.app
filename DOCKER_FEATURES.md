# Docker Environment Features

## Playwright Browser Support

The Docker development environment now includes Chromium browser support for Playwright testing.

### Default Browser Installation

- **Chromium** is installed by default with all required system dependencies
- Browser binaries are stored in `/ms-playwright` within the container
- The environment variable `PLAYWRIGHT_BROWSERS_PATH` is set automatically

### Running Playwright Tests

```bash
# From within the container
cd apps/eatgpt
npx playwright test

# From the host machine
docker-compose exec aimeup-dev npx playwright test --project=apps/eatgpt
```

### Installing Additional Browsers (Optional)

Firefox and WebKit browsers can be installed on-demand if needed:

```bash
# Install Firefox
docker-compose exec aimeup-dev npx playwright install firefox

# Install WebKit
docker-compose exec aimeup-dev npx playwright install webkit

# Install both
docker-compose exec aimeup-dev npx playwright install firefox webkit
```

Note: Only Chromium is installed by default to minimize the Docker image size.

## VS Code and Cursor IDE Integration

The repository now includes devcontainer configuration for seamless IDE integration.

### VS Code Setup

1. Install the "Remote - Containers" extension in VS Code
2. Ensure Docker containers are running: `docker-compose -f docker-compose.yml -f docker-compose.claude.yml up -d`
3. Open the command palette (Cmd/Ctrl + Shift + P)
4. Run "Remote-Containers: Open Folder in Container" or "Attach to Running Container"
5. Select the `aimeup-dev` container
6. The workspace will open at `/aimeup` with full access to the development environment

### Cursor IDE Setup

Cursor IDE supports the same devcontainer configuration:

1. Open Cursor IDE
2. Open the repository folder
3. Cursor will detect the `.devcontainer/devcontainer.json` configuration
4. Follow the prompts to connect to the container

### Features

- Automatic port forwarding for Expo (8081) and DevTools (19000-19002)
- Pre-configured VS Code extensions (ESLint, Prettier, Playwright)
- Runs as non-root user (`node`) for security
- Automatic `pnpm install` on container creation
- Container remains running when VS Code/Cursor disconnects

## Docker Commands Reference

### Building the Images

```bash
# Build base image
docker-compose build

# Build with Claude Code support
docker-compose -f docker-compose.yml -f docker-compose.claude.yml build
```

### Starting the Environment

```bash
# Start base environment
docker-compose up -d

# Start with Claude Code support
docker-compose -f docker-compose.yml -f docker-compose.claude.yml up -d
```

### Accessing the Container

```bash
# Execute commands in the container
docker-compose exec aimeup-dev zsh

# Run as specific user
docker-compose exec -u node aimeup-dev zsh
```

### Stopping the Environment

```bash
docker-compose down
```

## Environment Variables

When using `docker-compose.claude.yml`, the following environment variables are supported:

- `ANTHROPIC_API_KEY`: API key for Claude Code
- `LINEAR_API_KEY`: API key for Linear integration
- `GIT_USER_NAME`: Git user name for commits
- `GIT_USER_EMAIL`: Git user email for commits

These can be set in a `.env` file at the repository root.
