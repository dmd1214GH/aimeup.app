const config = require('../../configs/jest/preset.ts').default;

module.exports = {
  ...config,
  displayName: 'Helpers Package',
  rootDir: '.',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
};
