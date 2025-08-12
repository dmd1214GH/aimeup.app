import '@testing-library/jest-native/extend-expect'

// Mock NativeWind
jest.mock('nativewind', () => ({
  styled: () => (component) => component,
}))

// Mock React Native reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')
  Reanimated.default.call = () => {}
  return Reanimated
})

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')