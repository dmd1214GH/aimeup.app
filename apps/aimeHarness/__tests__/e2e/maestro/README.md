# Maestro E2E Tests

## Android Emulator Setup

### Using Existing Emulator

The tests are configured to use the "Pixel 9a (Play)" AVD. If you have this emulator already:

1. Start Android Studio
2. Open AVD Manager
3. Launch "Pixel 9a (Play)" emulator

### Creating a New AVD (if needed)

If "Pixel 9a (Play)" is not available, create a similar AVD:

1. Open Android Studio → AVD Manager
2. Click "Create Virtual Device"
3. Select: Pixel 9 or similar device
4. System Image: API 34 (Android 14) with Google Play
5. AVD Name: "Pixel 9a (Play)" or update config.yaml with your AVD name
6. Finish and launch the emulator

### App Configuration

- Development Bundle ID: `host.exp.exponent` (Expo Go)
- Production Bundle ID: `com.eatgpt.app` (future EAS builds)
- Metro Port: 8081

## Running Tests

### Prerequisites

1. Maestro CLI installed (run `maestro --version` to verify)
2. Android emulator running
3. Expo Go installed on emulator:
   ```bash
   # Download and install Expo Go
   curl -L -o expo-go.apk https://d1ahtucjixef4r.cloudfront.net/Exponent-2.33.10.apk
   adb install expo-go.apk
   ```
4. Metro bundler running (`npx expo start` in apps/eatgpt)

### Execute Tests

#### Smoke Test

```bash
maestro test smoke.flow.yaml
```

#### Interaction Test

```bash
maestro test interaction.flow.yaml
```

#### All Tests

```bash
maestro test .
```

## Test Files

- `smoke.flow.yaml` - Basic navigation test mirroring Playwright smoke test
- `interaction.flow.yaml` - Component interaction test mirroring Playwright interaction test
- `config.yaml` - Maestro configuration
