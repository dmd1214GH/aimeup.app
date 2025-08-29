# Use Node.js 22.18 slim image for minimal size
FROM node:22.18-slim

# Install zsh for consistency with host environment and scripts, plus git for development
# Also install dependencies required for Playwright Chromium browser
RUN apt-get update && apt-get install -y \
    zsh \
    git \
    lsof \
    curl \
    wget \
    procps \
    # Dependencies for Chromium
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libatspi2.0-0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libxcb1 \
    libxkbcommon0 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user 'aimedev' with same UID as typical macOS user (501)
# This helps with file permissions when volume mounting
RUN useradd -m -s /bin/zsh -u 501 aimedev

# Install pnpm 10.14.0 globally, Claude Code CLI, and ccusage
RUN npm install -g pnpm@10.14.0 @anthropic-ai/claude-code ccusage@latest

# Configure zsh prompt and history for both root and aimedev
# Create .zshrc files first, then populate them
RUN touch /root/.zshrc /home/aimedev/.zshrc && \
    chown aimedev:aimedev /home/aimedev/.zshrc && \
    # Root user configuration
    echo 'export PS1="🐳 docker:%~ %# "' >> /root/.zshrc && \
    echo 'export HISTFILE=~/.zsh_history' >> /root/.zshrc && \
    echo 'export HISTSIZE=1000' >> /root/.zshrc && \
    echo 'export SAVEHIST=2000' >> /root/.zshrc && \
    echo 'setopt HIST_IGNORE_DUPS' >> /root/.zshrc && \
    echo 'setopt SHARE_HISTORY' >> /root/.zshrc && \
    echo 'export PATH="/aimeup/_scripts:$PATH"' >> /root/.zshrc && \
    echo 'export REPO_PATH="/aimeup"' >> /root/.zshrc && \
    echo 'export AIME_ENV="sandbox"' >> /root/.zshrc && \
    echo '[ -f /aimeup/_scripts/aimeup-env.sh ] && source /aimeup/_scripts/aimeup-env.sh' >> /root/.zshrc && \
    # Aimedev user configuration
    echo 'export PS1="🐳 docker:%~ $ "' >> /home/aimedev/.zshrc && \
    echo 'export HISTFILE=~/.zsh_history' >> /home/aimedev/.zshrc && \
    echo 'export HISTSIZE=1000' >> /home/aimedev/.zshrc && \
    echo 'export SAVEHIST=2000' >> /home/aimedev/.zshrc && \
    echo 'setopt HIST_IGNORE_DUPS' >> /home/aimedev/.zshrc && \
    echo 'setopt SHARE_HISTORY' >> /home/aimedev/.zshrc && \
    echo 'export PATH="/aimeup/_scripts:$PATH"' >> /home/aimedev/.zshrc && \
    echo 'export REPO_PATH="/aimeup"' >> /home/aimedev/.zshrc && \
    echo 'export AIME_ENV="sandbox"' >> /home/aimedev/.zshrc && \
    echo '[ -f /aimeup/_scripts/aimeup-env.sh ] && source /aimeup/_scripts/aimeup-env.sh' >> /home/aimedev/.zshrc

# Configure git to trust the /aimeup directory (for both root and aimedev)
RUN git config --global --add safe.directory /aimeup && \
    su - aimedev -c "git config --global --add safe.directory /aimeup"

# Set working directory to monorepo root
WORKDIR /aimeup

# Create the .claude directory with proper permissions before switching user
RUN mkdir -p /home/aimedev/.claude && \
    chown -R aimedev:aimedev /home/aimedev/.claude && \
    chmod 700 /home/aimedev/.claude

# Switch to non-root user
USER aimedev

# Copy essential config files needed for pnpm to function
# These are copied during build to ensure pnpm can understand the workspace structure
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./

# Copy all package.json files to preserve workspace structure
# This allows pnpm to understand the full monorepo layout
COPY apps/*/package.json apps/
COPY apps/eatgpt/package.json apps/eatgpt/
COPY apps/aimeHarness/package.json apps/aimeHarness/
COPY packages/*/package.json packages/
COPY packages/*/*/package.json packages/
COPY services/*/package.json services/

# Note: We do NOT run pnpm install during build
# Dependencies will be installed in a volume mount for better performance
# and to avoid rebuilding the image when dependencies change

# Set environment variable for Playwright browsers path
# Use a path that the aimedev user can write to
ENV PLAYWRIGHT_BROWSERS_PATH=/home/aimedev/.cache/ms-playwright

# Set environment variable to indicate Docker container
ENV DOCKER_CONTAINER=1

# Install Playwright with the standardized version across all apps
# This ensures the browsers match the version all projects use
USER root
RUN npm install -g @playwright/test@1.54.2 && \
    npx playwright@1.54.2 install chromium --with-deps && \
    chown -R aimedev:aimedev /home/aimedev/.cache
USER aimedev

# Ensure Claude authentication persists and permissions are correct
# The bind mount from docker-compose.yml handles persistence
ENTRYPOINT ["/bin/sh", "-c", "\
    # Configure git from environment variables if provided \
    if [ -n \"$GIT_USER_NAME\" ]; then \
        git config --global user.name \"$GIT_USER_NAME\"; \
    fi && \
    if [ -n \"$GIT_USER_EMAIL\" ]; then \
        git config --global user.email \"$GIT_USER_EMAIL\"; \
    fi && \
    # Copy .claude.json from bind mount to home if it exists \
    if [ -f /home/aimedev/.claude/.claude.json ] && [ ! -f /home/aimedev/.claude.json ]; then \
        cp /home/aimedev/.claude/.claude.json /home/aimedev/.claude.json 2>/dev/null || true; \
    fi && \
    # Run the fix-claude-auth script if it exists (silent mode) \
    if [ -f /aimeup/_scripts/fix-claude-auth.sh ]; then \
        /aimeup/_scripts/fix-claude-auth.sh --silent 2>/dev/null || true; \
    fi && \
    # Fallback: ensure basic permissions if script doesn't exist \
    if [ -d /home/aimedev/.claude ]; then \
        chmod 700 /home/aimedev/.claude 2>/dev/null || true; \
        find /home/aimedev/.claude -type f -exec chmod 600 {} \\; 2>/dev/null || true; \
    fi && \
    exec \"$@\"", "--"]

# The container will be kept running with a command specified in docker-compose.yml
# Developers will exec into the container to run commands