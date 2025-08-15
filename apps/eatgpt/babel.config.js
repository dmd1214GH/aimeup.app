module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // Expo preset with NativeWind JSX import source for className prop support
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      // CRITICAL: In Expo SDK 53, nativewind/babel MUST be in presets, NOT plugins
      // This enables className->style transformation for React Native components
      'nativewind/babel',
    ],
    plugins: [
      // Other plugins can go here (e.g., 'react-native-reanimated/plugin')
      // But NOT 'nativewind/babel' - that causes "BABEL is not a valid plugin" error
    ],
  };
};
