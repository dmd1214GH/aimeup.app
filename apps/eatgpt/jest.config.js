module.exports = {
  displayName: 'EatGPT App - React Native Environment',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.(ts|tsx|js|jsx)'],
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
      ],
    }],
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  moduleNameMapper: {
    '^@aimeup/core/(.*)$': '<rootDir>/../../packages/core/$1',
    '^@aimeup/helpers/(.*)$': '<rootDir>/../../packages/helpers/$1',
    '^@aimeup/(.*)$': '<rootDir>/../../packages/$1',
    '^@eatgpt/(.*)$': '<rootDir>/../../packages/eatgpt/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};