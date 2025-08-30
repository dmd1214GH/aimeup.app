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

   **Note**: When using `aimedocker` script, it uses `docker-compose.claude.yml` overlay which maintains the same bind mount.

2. **Dockerfile**: ENTRYPOINT that:
   - Configures git from environment variables (GIT_USER_NAME, GIT_USER_EMAIL)
   - Copies Claude auth files from bind mount to home directory with proper ownership for CLI compatibility
   - Ensures files are owned by `aimedev` user after copying
   - Configures MCP Linear server while preserving `hasCompletedOnboarding` flag
   - Runs fix-claude-auth.sh in silent mode for additional verification

3. **Helper Scripts**:
   - `/aimeup/_scripts/fix-claude-auth.sh` - **Main diagnostic and fix script** (use this first!)
   - `/aimeup/_scripts/docker-claude-init.sh` - Manual verification/restoration
   - `/aimeup/_scripts/preserve-claude-auth.sh` - Backup/restore utilities
   - `/aimeup/_scripts/aimedocker` - Convenience script to enter Docker container as `aimedev` user (auto-backs up auth)
   - `/aimeup/_scripts/claude-backup.sh` - Automatic backup management with rotation

## How It Works

1. **Direct Bind Mount**: The `.claude-docker` directory in your project root IS the Claude config directory
2. **File Copying**: The ENTRYPOINT copies both `.claude.json` and `.credentials.json` from the bind mount to home directory (`~/`) with proper ownership
3. **Onboarding State**: The `hasCompletedOnboarding: true` flag is preserved to skip first-time setup
4. **MCP Configuration**: The ENTRYPOINT automatically configures the MCP Linear server if LINEAR_API_KEY is set, merging it with existing Claude configuration while preserving the onboarding flag
5. **Automatic Sync**: On container start, `/aimeup/_scripts/fix-claude-auth.sh` runs automatically in silent mode to:
   - Sync configs between container and host if needed
   - Restore from backup if primary configs are missing
   - Fix permissions
6. **Persistence**: Because it's a bind mount, the directory persists across container rebuilds
7. **Silent Operation**: The fix script runs silently on startup - you'll only see output if there's a problem

## Usage

### Automatic Backup System

The `aimedocker` script automatically backs up your Claude authentication if it's more than 7 days old. Backups are stored in `~/.claude-backups` with rotation (keeps last 3).

**Performance Impact**: Minimal (<50ms weekly, 3.6MB max storage)

**Manual backup commands**:

```bash
# Create backup
claude-backup

# List all backups
claude-backups

# Restore latest backup
claude-restore

# Restore specific backup
claude-restore 20240830_143022

# Check backup status
_scripts/claude-backup.sh check
```

**To disable automatic backups**: Comment out line 28 in `_scripts/aimedocker`

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

# Inside container (using aimedocker script):
./aimeup/_scripts/aimedocker
# Claude should already be authenticated!

# Or manually:
docker exec -it -u aimedev aimeup-aimeup-dev-1 zsh
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

## MCP Linear Server Integration

The container automatically configures MCP (Model Context Protocol) for Linear integration:

1. **Automatic Setup**: The ENTRYPOINT configures the MCP Linear server if `LINEAR_API_KEY` is present
2. **Server Used**: `mcp-linear` (installed globally via npm in Dockerfile)
3. **Configuration**: Merged into `.claude.json` under `mcpServers.linear`
4. **Environment**: Requires `LINEAR_API_KEY` environment variable in `.env` file

To enable MCP:

```bash
# In your .env file:
LINEAR_API_KEY=your_linear_api_key_here
```

The MCP configuration allows Claude Code to:

- Post operation reports directly to Linear as comments
- Search and update Linear issues
- Access Linear data through MCP tools (prefixed with `mcp__linear__`)

## Technical Details

- **Bind Mount**: Maps host `./.claude-docker` → container `/home/aimedev/.claude`
- **Persistence**: Survives `docker-compose down`, container removal, and Docker restarts
- **Permissions**: Automatically set to 700 for directory, 600 for files
- **Security**: The `.claude-docker` directory is gitignored
- **User Context**: Runs as `aimedev` user (UID 501) for proper permissions
- **MCP Server**: `mcp-linear` installed globally, configured via ENTRYPOINT
- **Automatic Backups**: Creates timestamped backups in `~/.claude-backups` when using `aimedocker`
  - Frequency: Weekly (if >7 days old)
  - Retention: 3 backups maximum
  - Size: ~1.2MB per backup (compressed)
  - Location: `~/.claude-backups/` (outside project)

## Key Files

- **`.claude-docker/.credentials.json`**: OAuth tokens and API credentials
- **`.claude-docker/.claude.json`**: Configuration including `hasCompletedOnboarding: true` flag and MCP server settings
- **`.claude-docker/config.toml`**: User preferences and settings
- **Environment variable `LINEAR_API_KEY`**: Required for MCP Linear server integration

## Docker Compose Configuration

- **Main setup**: `docker-compose.yml` - Base container configuration
- **Claude overlay**: `docker-compose.claude.yml` - Extends base with Claude-specific settings
- **Usage**: The `aimedocker` script automatically uses both compose files

## Known Issues (Resolved)

Previously, Claude would show first-time setup even with valid credentials. This was solved by:

1. Ensuring `.claude.json` exists with `"hasCompletedOnboarding": true`
2. Copying auth files from bind mount to home directory with proper `chown` to `aimedev` user
3. Installing `ccusage` globally to avoid npm permission prompts
4. Using `aimedev` user (UID 501) consistently to match host permissions
5. Ensuring `.zshrc` exists for `aimedev` user to prevent zsh setup prompts
6. Preserving `hasCompletedOnboarding` flag when merging MCP configuration
7. Setting proper file ownership after all file operations in ENTRYPOINT

If authentication still doesn't persist:

- Remove `.claude-docker` directory and re-authenticate fresh
- Check Docker Desktop file sharing settings
- Ensure the container user (aimedev, UID 501) matches your host user ID
