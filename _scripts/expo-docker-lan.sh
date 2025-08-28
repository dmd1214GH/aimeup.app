#!/usr/bin/env zsh
# Script to start Expo in Docker with LAN access for physical devices

set -euo pipefail

# Set REPO_PATH if not already set
: "${REPO_PATH:="/aimeup"}"

echo "Starting Expo for physical device access..."
echo "Your computer's IP: $(ifconfig | grep -A 1 "inet " | grep -v "127.0.0.1" | grep "inet " | head -1 | awk '{print $2}')"
echo ""

# Export environment variable for Docker to listen on all interfaces
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Change to the app directory
cd "$REPO_PATH/apps/eatgpt"

echo "Starting Expo in LAN mode..."
echo "After it starts, you'll see a QR code and exp:// URL"
echo ""

# Start Expo with explicit network configuration
npx expo start --lan --port 8081