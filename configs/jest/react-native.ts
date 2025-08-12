import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
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
};

export default config;