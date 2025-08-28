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

# Install pnpm 10.14.0 globally
RUN npm install -g pnpm@10.14.0

# Configure zsh prompt and history
RUN echo 'export PS1="🐳 docker:%~ %# "' >> /root/.zshrc && \
    echo 'export HISTFILE=~/.zsh_history' >> /root/.zshrc && \
    echo 'export HISTSIZE=1000' >> /root/.zshrc && \
    echo 'export SAVEHIST=2000' >> /root/.zshrc && \
    echo 'setopt HIST_IGNORE_DUPS' >> /root/.zshrc && \
    echo 'setopt SHARE_HISTORY' >> /root/.zshrc && \
    echo 'export PATH="/aimeup/_scripts:$PATH"' >> /root/.zshrc

# Set working directory to monorepo root
WORKDIR /aimeup

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
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Set environment variable to indicate Docker container
ENV DOCKER_CONTAINER=1

# Install Playwright Chromium browser
# This must be done after dependencies are available
RUN npx playwright@1.49.0 install --with-deps chromium

# The container will be kept running with a command specified in docker-compose.yml
# Developers will exec into the container to run commands