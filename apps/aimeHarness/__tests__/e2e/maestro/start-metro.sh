#!/bin/bash
set -euo pipefail

# Metro bundler automation script for Maestro tests
# Follows the same pattern as Playwright web server management

METRO_PORT=8081
METRO_PID=""

# Function to check if Metro is running
is_metro_running() {
    lsof -i :$METRO_PORT > /dev/null 2>&1
}

# Function to start Metro bundler
start_metro() {
    if is_metro_running; then
        echo "Metro bundler already running on port $METRO_PORT"
        return 0
    fi
    
    echo "Starting Metro bundler for mobile tests..."
    cd "$(dirname "$0")/../../.."
    
    # Start Metro in background with production settings
    npx expo start --no-dev --minify > /dev/null 2>&1 &
    METRO_PID=$!
    
    # Wait for Metro to be ready (max 30 seconds)
    echo "Waiting for Metro bundler to start..."
    for i in {1..30}; do
        if is_metro_running; then
            echo "Metro bundler started successfully (PID: $METRO_PID)"
            return 0
        fi
        sleep 1
    done
    
    # If we get here, Metro failed to start
    echo "Failed to start Metro bundler"
    if [[ -n "$METRO_PID" ]]; then
        kill $METRO_PID 2>/dev/null || true
    fi
    return 1
}

# Function to stop Metro bundler
stop_metro() {
    if [[ -n "${METRO_PID:-}" ]]; then
        echo "Stopping Metro bundler (PID: $METRO_PID)..."
        kill $METRO_PID 2>/dev/null || true
        METRO_PID=""
    elif is_metro_running; then
        echo "Stopping existing Metro bundler on port $METRO_PORT..."
        lsof -ti :$METRO_PORT | xargs kill 2>/dev/null || true
    fi
}

# Function to health check Metro
health_check() {
    if is_metro_running; then
        echo "✅ Metro bundler is healthy on port $METRO_PORT"
        return 0
    else
        echo "❌ Metro bundler is not running"
        return 1
    fi
}

# Handle script arguments
case "${1:-start}" in
    start)
        start_metro
        ;;
    stop)
        stop_metro
        ;;
    restart)
        stop_metro
        sleep 2
        start_metro
        ;;
    health)
        health_check
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|health}"
        exit 1
        ;;
esac