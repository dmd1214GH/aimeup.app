module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // Standard Expo preset without NativeWind
      'babel-preset-expo',
    ],
    plugins: [
      // Standard plugins
      'react-native-reanimated/plugin',
    ],
  };
};
