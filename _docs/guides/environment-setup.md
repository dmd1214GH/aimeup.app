# Environment Setup

## Prerequisites

- Node.js 22.18.x (use `.nvmrc`)
- pnpm 10.14.0+
- Expo CLI (installed automatically with project dependencies)
- iOS Simulator (Mac only) or Android Emulator (optional)
- Expo Go app on physical device (optional)

### Browser Requirements (for Web Development & Testing)

- **Chrome**: Required for Playwright E2E testing on MacBook Air
- **Safari**: Optional, for cross-browser testing (macOS only)
- **Firefox**: Optional, for cross-browser testing

### E2E Testing Requirements

#### Web (Playwright)

- Chrome/Chromium browser (automatically installed with `npx playwright install chromium`)
- Optional: WebKit/Safari (`npx playwright install webkit`)
- Optional: Firefox (`npx playwright install firefox`)

#### Mobile (Maestro)

**Maestro CLI Installation:**

```bash
# Install Maestro CLI (required for mobile E2E tests)
curl -fsSL https://get.maestro.mobile.dev | bash

# Add to PATH (add to your .bashrc/.zshrc for persistence)
export PATH="$PATH":"$HOME/.maestro/bin"

# Verify installation
maestro --version
```

**Android Testing:**

- Android Studio with Android SDK (required)
- Android Emulator with "Pixel 9a (Play)" AVD or similar
- Expo Go app installed on emulator (for development testing)
- Development bundle ID: `host.exp.exponent` (Expo Go)
- Production bundle ID: `com.eatgpt.app` (future EAS builds)

**iOS Testing (future):**

- Xcode and iOS Simulator (macOS only)
- Currently out of scope

## Initial Setup

### 1. Clone and Install

```bash
git clone <repo>
cd aimeup
nvm use
pnpm install
```

### 2. Environment Variables

The application validates environment variables at startup to ensure proper configuration. Missing or invalid variables will cause the app to fail with clear error messages.

```bash
# Copy the example environment file
cp apps/eatgpt/.env.example apps/eatgpt/.env.local

# Edit the file with your configuration
# For PreauthMode (no Firebase required):
# - Set EXPO_PUBLIC_PREAUTH_MODE=true
# - Add your OpenAI API key to EXPO_PUBLIC_OPENAI_API_KEY
```

#### Required Variables

- `NODE_ENV` - Environment mode (development/test/production)

#### Optional Variables (PreauthMode)

- `EXPO_PUBLIC_API_URL` - Backend API URL
- `EXPO_PUBLIC_OPENAI_API_KEY` - OpenAI API key for chat functionality
- `EXPO_PUBLIC_PREAUTH_MODE` - Enable preauth mode (true/false)
- `EXPO_PUBLIC_LOG_LEVEL` - Logging level (trace/debug/info/warn/error/fatal)

#### Optional Variables (Full Mode with Firebase)

- `EXPO_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `EXPO_PUBLIC_FIREBASE_APP_ID` - Firebase app ID

### 3. Verify Installation

```bash
# Run all quality checks
./_scripts/aimequal

# Or run individual checks
pnpm check
```

## Running the Application

### Native Development (iOS/Android)

```bash
cd apps/eatgpt
npx expo start

# iOS Simulator (Mac only)
# Press 'i' in the terminal or scan QR with Camera app

# Android Emulator
# Press 'a' in the terminal or scan QR with Expo Go app

# Physical Device
# Install Expo Go app and scan the QR code
```

### Web Development

```bash
cd apps/eatgpt
npx expo start --web

# Access at http://localhost:8081
```

### Clear Cache (if needed)

```bash
cd apps/eatgpt
npx expo start --clear
```

## Development Commands

### Workspace Commands (from root)

```bash
pnpm dev        # Start all dev servers
pnpm build      # Build all packages
pnpm test       # Run all tests
pnpm hygiene    # Run linting
pnpm typecheck  # Run type checking
pnpm check      # Run hygiene + typecheck + test
pnpm clean      # Clean all build artifacts
```

### App Commands (from apps/eatgpt)

```bash
pnpm start       # Start Expo dev server
pnpm start:web   # Start web dev server
pnpm start:clean # Start with cache cleared
pnpm ios         # Start iOS simulator
pnpm android     # Start Android emulator
pnpm web         # Start web server (opens browser)
pnpm web:ci      # Start web server (no browser auto-open)
pnpm stop        # Stop dev server

# E2E Testing Commands
pnpm test:smoke:web      # Run smoke tests (Chrome)
pnpm test:e2e:web        # Run full POC tests (Chrome)
pnpm test:e2e:web:all    # Run all E2E tests (Chrome)
pnpm test:e2e:web:webkit # Run tests in Safari (optional)
pnpm test:e2e:web:firefox # Run tests in Firefox (optional)
```

## Troubleshooting

### Environment Validation Errors

If the app fails to start with environment validation errors:

1. Check the console output for specific missing/invalid variables
2. Review your `.env.local` file against `.env.example`
3. Ensure all required variables are set based on your mode (PreauthMode vs Full)

### Metro Bundler Issues

```bash
# Clear Metro cache
cd apps/eatgpt
npx expo start --clear
```

### Dependency Issues

```bash
# Reinstall dependencies
pnpm clean
rm -rf node_modules
pnpm install
```

### iOS Simulator Not Starting

1. Ensure Xcode is installed (Mac only)
2. Open Xcode > Settings > Platforms
3. Download iOS simulator if needed

### Android Emulator Setup

1. **Install Android Studio**
   - Download from https://developer.android.com/studio
   - During installation, ensure Android SDK and Android Virtual Device are selected

2. **Add Android SDK tools to PATH**

   ```bash
   # Add to your ~/.zshrc or ~/.bashrc:
   export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"
   export PATH="$PATH:$HOME/Library/Android/sdk/emulator"

   # Reload your shell config:
   source ~/.zshrc  # or source ~/.bashrc
   ```

3. **Create an Android Virtual Device (AVD)**

   ```bash
   # Open Android Studio → Tools → AVD Manager
   # Click "Create Virtual Device"
   # Select: Pixel 9 or Pixel 8
   # System Image: API 34 (Android 14) with Google Play
   # Name it: "Pixel 9a (Play)" or similar
   ```

4. **Start the Emulator**

   ```bash
   # From command line (after adding to PATH):
   emulator -avd "Pixel_9a_Play"

   # Or from Android Studio:
   # Tools → AVD Manager → Launch
   ```

5. **Verify Emulator is Running**

   ```bash
   adb devices
   # Should show: emulator-5554  device
   ```

6. **Install Expo Go for Development Testing**

   ```bash
   # Download Expo Go APK (latest version)
   curl -L -o expo-go.apk https://d1ahtucjixef4r.cloudfront.net/Exponent-2.33.10.apk

   # Install on emulator
   adb install expo-go.apk
   ```

7. **Run the App**
   ```bash
   cd apps/eatgpt
   pnpm android
   # Or for E2E tests:
   pnpm test:smoke:mobile
   ```

## Testing the Setup

### Smoke Test

1. Start the app: `cd apps/eatgpt && npx expo start`
2. Open on your preferred platform
3. Navigate to `/kitchensink` to see UI components
4. Check console for environment validation success message

### Environment Validation Test

The app will automatically validate environment variables on startup. You should see:

- ✅ Environment validated successfully
- Environment configuration details (in development mode)

If validation fails, you'll see:

- ❌ Environment Validation Failed
- Specific error messages for each invalid/missing variable
- Available environment variables (in development mode)
