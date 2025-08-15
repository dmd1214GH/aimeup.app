module.exports = {
  preset: '../../configs/jest/react-native.ts',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/e2e/', // Exclude Playwright E2E tests
    '\\.spec\\.ts$', // Exclude .spec.ts files (Playwright convention)
  ],
  displayName: '@eatgpt/app',
};
