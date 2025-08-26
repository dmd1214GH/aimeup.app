export default {
  name: 'EatGPT',
  slug: 'eatgpt',
  scheme: 'eatgpt',
  version: '0.0.1',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  experiments: {
    typedRoutes: false,
  },
  android: {
    package: 'com.aimeup.eatgpt',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },
  ios: {
    bundleIdentifier: 'com.aimeup.eatgpt',
    supportsTablet: false,
    icon: './assets/icon.png',
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-router', 'expo-font'],
};
