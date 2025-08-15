const config = require('../../configs/jest/preset.ts').default;

module.exports = {
  ...config,
  displayName: 'Core Package',
  rootDir: '.',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
};
