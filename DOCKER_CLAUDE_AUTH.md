# Docker Claude Authentication Persistence

## Problem

When the Docker container is rebuilt, Claude authentication was being lost, requiring re-authentication each time.

## Current Implementation

We use a **bind mount** solution that directly maps the host's `.claude-docker` directory to the container's `/home/aimedev/.claude` directory.

### Key Components:

1. **docker-compose.yml**: Bind mount configuration

   ```yaml
   - ./.claude-docker:/home/aimedev/.claude
   ```

   This directly maps the host directory to the container, preserving authentication.

2. **Dockerfile**: Simplified ENTRYPOINT that only fixes permissions

3. **Helper Scripts**:
   - `/aimeup/_scripts/fix-claude-auth.sh` - **Main diagnostic and fix script** (use this first!)
   - `/aimeup/_scripts/docker-claude-init.sh` - Manual verification/restoration
   - `/aimeup/_scripts/preserve-claude-auth.sh` - Backup/restore utilities

## How It Works

1. **Direct Bind Mount**: The `.claude-docker` directory in your project root IS the Claude config directory
2. **Onboarding State**: The ENTRYPOINT copies `.claude.json` from the bind mount to `~/.claude.json` to preserve the `hasCompletedOnboarding: true` flag that skips first-time setup
3. **Automatic Sync**: On container start, `/aimeup/_scripts/fix-claude-auth.sh` runs automatically in silent mode to:
   - Sync configs between container and host if needed
   - Restore from backup if primary configs are missing
   - Fix permissions
4. **Persistence**: Because it's a bind mount, the directory persists across container rebuilds
5. **Silent Operation**: The fix script runs silently on startup - you'll only see output if there's a problem

## Usage

### After Container Rebuild

**The authentication now persists automatically!** The fix script runs silently on container start.

If you want to manually verify or diagnose issues:

```bash
# Inside the container - verbose diagnostic mode:
/aimeup/_scripts/fix-claude-auth.sh

# Or just check if config exists:
ls -la ~/.claude
# Should show your .credentials.json file
```

### First-Time Authentication

```bash
# Inside the container:
claude auth
# Follow the prompts - it will be saved permanently
```

### Rebuilding Container (No Auth Loss!)

```bash
# Outside container:
docker-compose down
docker-compose build
docker-compose up -d

# Inside container:
docker exec -it aimeup-aimeup-dev-1 zsh
# Claude should already be authenticated!
```

## Directory Structure

- **Host**: `./aimeup/.claude-docker/` - Persisted Claude config (gitignored)
- **Container**: `/home/aimedev/.claude/` - Active Claude config
- **Backup**: `/aimeup/.claude-backup/` - Legacy backup location

## Troubleshooting

If authentication is not persisting:

1. **Check the bind mount on host**:

   ```bash
   # Outside container:
   ls -la ./.claude-docker
   ```

   Should contain `.credentials.json` and other Claude config files.

2. **Verify inside container**:

   ```bash
   # Inside container:
   ls -la ~/.claude
   ```

3. **Check permissions**:

   ```bash
   # Inside container:
   stat ~/.claude
   ```

   Should show `700` permissions for directory.

4. **Manual restore if needed**:

   ```bash
   # Inside container:
   /aimeup/_scripts/preserve-claude-auth.sh restore
   ```

5. **Re-authenticate as last resort**:
   ```bash
   # Inside container:
   claude auth
   ```

## Technical Details

- **Bind Mount**: Maps host `./.claude-docker` → container `/home/aimedev/.claude`
- **Persistence**: Survives `docker-compose down`, container removal, and Docker restarts
- **Permissions**: Automatically set to 700 for directory, 600 for files
- **Security**: The `.claude-docker` directory is gitignored
- **User Context**: Runs as `aimedev` user (UID 501) for proper permissions

## Key Files

- **`.claude-docker/.credentials.json`**: OAuth tokens and API credentials
- **`.claude-docker/.claude.json`**: Configuration including `hasCompletedOnboarding: true` flag
- **`.claude-docker/config.toml`**: User preferences and settings

## Known Issues (Resolved)

Previously, Claude would show first-time setup even with valid credentials. This was solved by:

1. Ensuring `.claude.json` exists with `"hasCompletedOnboarding": true`
2. Copying this file from the bind mount to `~/.claude.json` on container start
3. Installing `ccusage` globally to avoid npm permission prompts

If authentication still doesn't persist:

- Remove `.claude-docker` directory and re-authenticate fresh
- Check Docker Desktop file sharing settings
- Ensure the container user (aimedev, UID 501) matches your host user ID
