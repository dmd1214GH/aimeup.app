module.exports = {
  preset: './configs/jest/preset.ts',
  testMatch: ['<rootDir>/monorepo-structure*.test.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/e2e/', // Exclude Playwright tests
    '\\.spec\\.ts$', // Exclude Playwright spec files
  ],
  displayName: 'monorepo-structure',
};
