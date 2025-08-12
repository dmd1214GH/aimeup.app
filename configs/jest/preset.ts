import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  rootDir: '../../',
  testMatch: ['<rootDir>/packages/**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    '<rootDir>/packages/**/*.ts',
    '!<rootDir>/packages/**/*.d.ts',
    '!<rootDir>/packages/**/node_modules/**',
  ],
  moduleNameMapper: {
    '^@aimeup/core/(.*)$': '<rootDir>/packages/core/$1',
    '^@aimeup/helpers/(.*)$': '<rootDir>/packages/helpers/$1',
    '^@aimeup/(.*)$': '<rootDir>/packages/$1',
    '^@eatgpt/(.*)$': '<rootDir>/packages/eatgpt/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
      ],
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

export default config;