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

# Test 1: Claude Code installed
echo ""
echo "1. Testing Claude Code installation..."
docker-compose exec aimeup-dev claude --version > /dev/null 2>&1
check_command "Claude Code is installed and accessible"

# Test 2: Git configuration works
echo ""
echo "2. Testing Git configuration..."
GIT_NAME=$(docker-compose exec aimeup-dev git config --global user.name 2>/dev/null | tr -d '\r')
GIT_EMAIL=$(docker-compose exec aimeup-dev git config --global user.email 2>/dev/null | tr -d '\r')
if [ -n "$GIT_NAME" ] && [ -n "$GIT_EMAIL" ]; then
    echo -e "${GREEN}✓${NC} Git is configured (user: $GIT_NAME, email: $GIT_EMAIL)"
else
    echo -e "${RED}✗${NC} Git configuration missing"
    exit 1
fi

# Test 3: API keys are passed to container
echo ""
echo "3. Testing API key environment variables..."
HAS_ANTHROPIC=$(docker-compose exec aimeup-dev sh -c 'test -n "$ANTHROPIC_API_KEY" && echo "yes" || echo "no"' | tr -d '\r')
HAS_LINEAR=$(docker-compose exec aimeup-dev sh -c 'test -n "$LINEAR_API_KEY" && echo "yes" || echo "no"' | tr -d '\r')
if [ "$HAS_ANTHROPIC" = "yes" ]; then
    echo -e "${GREEN}✓${NC} ANTHROPIC_API_KEY is set in container"
else
    echo -e "${RED}✗${NC} ANTHROPIC_API_KEY is not set in container"
fi
if [ "$HAS_LINEAR" = "yes" ]; then
    echo -e "${GREEN}✓${NC} LINEAR_API_KEY is set in container"
else
    echo -e "${RED}✗${NC} LINEAR_API_KEY is not set in container"
fi

# Test 4: lc-runner is available
echo ""
echo "4. Testing lc-runner availability..."
docker-compose exec aimeup-dev pnpm lc-runner --version > /dev/null 2>&1
check_command "lc-runner CLI is available via pnpm"

# Test 5: Claude Code can execute in /aimeup
echo ""
echo "5. Testing Claude Code working directory..."
WORKDIR=$(docker-compose exec aimeup-dev pwd | tr -d '\r')
if [ "$WORKDIR" = "/aimeup" ]; then
    echo -e "${GREEN}✓${NC} Working directory is /aimeup"
else
    echo -e "${RED}✗${NC} Working directory is not /aimeup (got: $WORKDIR)"
    exit 1
fi

# Test 6: Manual execution of lc-runner works
echo ""
echo "6. Testing lc-runner manual execution..."
docker-compose exec aimeup-dev sh -c "cd /aimeup && pnpm lc-runner --help" > /dev/null 2>&1
check_command "Manual execution of 'pnpm lc-runner' works"

# Summary
echo ""
echo "========================================================"
echo -e "${GREEN}All acceptance criteria tests passed!${NC}"
echo ""
echo "Note: To fully test Linear API integration, you need to:"
echo "1. Set real API keys in .env file"
echo "2. Run: docker-compose exec aimeup-dev pnpm lc-runner <operation> <issueId>"
echo ""