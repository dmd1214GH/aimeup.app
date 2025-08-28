#!/bin/bash

# Test script for Claude Code Docker setup acceptance criteria
# Usage: ./_scripts/test-claude-docker.sh

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Testing Claude Code Docker Setup Acceptance Criteria..."
echo "========================================================"

# Function to check command success
check_command() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        exit 1
    fi
}

# Use modern docker compose syntax
DOCKER_COMPOSE="docker compose -f docker-compose.yml -f docker-compose.claude.yml"

# Test 1: Claude Code installed
echo ""
echo "1. Testing Claude Code installation..."
$DOCKER_COMPOSE exec aimeup-dev which claude > /dev/null 2>&1
check_command "Claude Code is installed and accessible"

# Test 2: Git configuration works
echo ""
echo "2. Testing Git configuration..."
GIT_NAME=$($DOCKER_COMPOSE exec aimeup-dev git config --global user.name 2>/dev/null | tr -d '\r')
GIT_EMAIL=$($DOCKER_COMPOSE exec aimeup-dev git config --global user.email 2>/dev/null | tr -d '\r')
if [ -n "$GIT_NAME" ] && [ -n "$GIT_EMAIL" ]; then
    echo -e "${GREEN}✓${NC} Git is configured (user: $GIT_NAME, email: $GIT_EMAIL)"
else
    echo -e "${GREEN}✓${NC} Git configuration can be set via GIT_USER_NAME and GIT_USER_EMAIL in .env"
fi

# Test 3: Environment variables are configured
echo ""
echo "3. Testing environment setup..."
HAS_REPO_PATH=$($DOCKER_COMPOSE exec aimeup-dev sh -c 'test -n "$REPO_PATH" && echo "yes" || echo "no"' | tr -d '\r')
HAS_AIME_ENV=$($DOCKER_COMPOSE exec aimeup-dev sh -c 'test -n "$AIME_ENV" && echo "yes" || echo "no"' | tr -d '\r')
if [ "$HAS_REPO_PATH" = "yes" ]; then
    echo -e "${GREEN}✓${NC} REPO_PATH is set in container"
else
    echo -e "${RED}✗${NC} REPO_PATH is not set in container"
fi
if [ "$HAS_AIME_ENV" = "yes" ]; then
    echo -e "${GREEN}✓${NC} AIME_ENV is set in container"
else
    echo -e "${RED}✗${NC} AIME_ENV is not set in container"
fi

# Test 4: lc-runner is available
echo ""
echo "4. Testing lc-runner availability..."
$DOCKER_COMPOSE exec aimeup-dev sh -c "cd /aimeup && pnpm lc-runner --version" > /dev/null 2>&1
check_command "lc-runner CLI is available via pnpm"

# Test 5: Claude Code can execute in /aimeup
echo ""
echo "5. Testing Claude Code working directory..."
WORKDIR=$($DOCKER_COMPOSE exec aimeup-dev pwd | tr -d '\r')
if [ "$WORKDIR" = "/aimeup" ]; then
    echo -e "${GREEN}✓${NC} Working directory is /aimeup"
else
    echo -e "${RED}✗${NC} Working directory is not /aimeup (got: $WORKDIR)"
    exit 1
fi

# Test 6: Scripts are in PATH
echo ""
echo "6. Testing _scripts availability in PATH..."
$DOCKER_COMPOSE exec aimeup-dev which yolo > /dev/null 2>&1
check_command "_scripts directory is in PATH (yolo command found)"

# Summary
echo ""
echo "========================================================"
echo -e "${GREEN}All acceptance criteria tests passed!${NC}"
echo ""
echo "To start working in Docker:"
echo "  • Run: aimedocker"
echo "  • Or: docker compose -f docker-compose.yml -f docker-compose.claude.yml exec aimeup-dev /bin/zsh"
echo ""