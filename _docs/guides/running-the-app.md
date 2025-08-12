# Running the AimeUp/EatGPT App

## Prerequisites

### Required Software
- **Node.js**: v22.18.x (check with `node --version`)
- **pnpm**: v10.14.0 (check with `pnpm --version`)
- **Git**: For repository access

### Mobile Testing Options (choose one)
1. **Expo Go App** (Easiest)
   - iOS: Download from App Store
   - Android: Download from Google Play Store
   
2. **iOS Simulator** (Mac only)
   - Install Xcode from Mac App Store
   - Run `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`
   
3. **Android Emulator**
   - Install Android Studio
   - Create AVD (Android Virtual Device) via AVD Manager
   - Ensure `adb` is in PATH

## Initial Setup

```bash
# Clone repository (if not done)
git clone [repository-url]
cd aimeup

# IMPORTANT: Ensure .npmrc contains:
# shamefully-hoist=true
# This is required for React Native/Expo to work with pnpm

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

## Starting the Development Server

```bash
# Navigate to app directory
cd apps/eatgpt

# Start Expo development server
npx expo start
```

## Accessing the App

### Option 1: Physical Device with Expo Go
1. Ensure phone and computer are on same WiFi network
2. Open Expo Go app
3. Scan QR code shown in terminal OR
4. Enter URL manually: `exp://[YOUR-IP]:8081`
   - Find your IP in terminal output or run: `ifconfig | grep "inet "`

### Option 2: iOS Simulator (Mac only)
1. Start Expo: `npx expo start`
2. Press `i` in terminal
3. Simulator will launch automatically

### Option 3: Android Emulator
1. Start Android emulator first
2. Start Expo: `npx expo start`
3. Press `a` in terminal
4. App will install and launch

### Option 4: Web Browser (Development)
1. Start Expo: `npx expo start --web`
2. Open browser to http://localhost:8081
3. Note: Some native features may not work

## Navigation

### Home Screen
- **"Simple Test"** button: Basic React Native components (no styling libraries)
- **"Kitchen Sink"** button: Full UI component showcase with NativeWind styling

### Kitchen Sink Features
- Button variants (Primary, Secondary, Outline)
- Button sizes (Small, Medium, Large)
- Input components (Text, Password, Multiline)
- Card variants (Default, Elevated, Outlined)
- Redux state management demo

## Troubleshooting

### "New update available, downloading..." stuck
1. Kill Expo server (Ctrl+C)
2. Clear cache: `npx expo start --clear`
3. Restart Expo Go app

### Bundle stuck at 99%
1. Check for syntax errors in recent changes
2. Remove babel.config.js temporarily
3. Run: `npx expo start --clear`

### Android emulator not detected
```bash
# Check if adb sees device
adb devices

# If not listed, start emulator manually via Android Studio
```

### iOS Simulator not available
```bash
# Install Xcode command line tools
xcode-select --install

# Accept Xcode license
sudo xcodebuild -license accept
```

### Metro bundler errors
```bash
# Clear all caches
npx expo start --clear
rm -rf node_modules/.cache
pnpm install
```

## Useful Commands

```bash
# Development
pnpm dev           # Run development servers (all packages)
pnpm build         # Build all packages
pnpm test          # Run tests
pnpm typecheck     # Check TypeScript
pnpm hygiene       # Run linters

# Expo specific
npx expo start              # Start dev server
npx expo start --clear      # Start with cleared cache
npx expo start --web        # Start web version
npx expo start --ios        # Start iOS simulator
npx expo start --android    # Start Android emulator

# Debugging
npx expo doctor    # Check for common issues
adb devices        # List connected Android devices
```

## Known Issues

1. **NativeWind className styling**: TypeScript may show errors for `className` props. This is a development-only issue and doesn't affect runtime.

2. **Package version warnings**: Expo may warn about package versions. The app should still function despite these warnings.

3. **pnpm configuration**: Must use `shamefully-hoist=true` in `.npmrc` for React Native dependencies to resolve correctly.

## Support

- Check `CLAUDE.md` for project-specific conventions
- Review `_docs/guides/` for architecture decisions
- File issues in project repository