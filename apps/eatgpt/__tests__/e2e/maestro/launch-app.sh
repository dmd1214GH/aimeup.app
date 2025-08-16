#!/bin/bash
set -euo pipefail

# Android app launch automation for Maestro tests
# Bundle ID and emulator configuration

APP_BUNDLE_ID="com.eatgpt.app"
APP_ACTIVITY=".MainActivity"

# Function to check if emulator is running
is_emulator_running() {
    adb devices 2>/dev/null | grep -q "emulator"
}

# Function to check if app is installed
is_app_installed() {
    adb shell pm list packages 2>/dev/null | grep -q "$APP_BUNDLE_ID"
}

# Function to check if app is running
is_app_running() {
    adb shell ps 2>/dev/null | grep -q "$APP_BUNDLE_ID"
}

# Function to launch app on emulator
launch_app() {
    if ! is_emulator_running; then
        echo "❌ No Android emulator detected"
        echo "Please start an Android emulator (Pixel 9a Play recommended)"
        return 1
    fi
    
    # Install app if not already installed
    if ! is_app_installed; then
        echo "App not installed, building and installing..."
        cd "$(dirname "$0")/../../.."
        npx expo run:android --no-dev --minify
    fi
    
    # Stop app if already running
    if is_app_running; then
        echo "Stopping existing app instance..."
        adb shell am force-stop "$APP_BUNDLE_ID" 2>/dev/null || true
        sleep 2
    fi
    
    # Launch the app
    echo "Launching app on Android emulator..."
    adb shell am start -n "$APP_BUNDLE_ID/$APP_BUNDLE_ID$APP_ACTIVITY" 2>/dev/null
    
    # Wait for app to be ready
    echo "Waiting for app to be ready..."
    for i in {1..10}; do
        if is_app_running; then
            echo "✅ App launched successfully"
            return 0
        fi
        sleep 1
    done
    
    echo "⚠️ App may not have launched properly"
    return 1
}

# Function to stop app
stop_app() {
    if is_app_running; then
        echo "Stopping app..."
        adb shell am force-stop "$APP_BUNDLE_ID" 2>/dev/null || true
        echo "App stopped"
    else
        echo "App is not running"
    fi
}

# Function to clear app data
clear_app_data() {
    if is_app_installed; then
        echo "Clearing app data..."
        adb shell pm clear "$APP_BUNDLE_ID" 2>/dev/null || true
        echo "App data cleared"
    else
        echo "App is not installed"
    fi
}

# Handle script arguments
case "${1:-launch}" in
    launch)
        launch_app
        ;;
    stop)
        stop_app
        ;;
    clear)
        clear_app_data
        ;;
    restart)
        stop_app
        sleep 2
        launch_app
        ;;
    status)
        if is_app_running; then
            echo "✅ App is running"
        else
            echo "❌ App is not running"
        fi
        ;;
    *)
        echo "Usage: $0 {launch|stop|clear|restart|status}"
        exit 1
        ;;
esac