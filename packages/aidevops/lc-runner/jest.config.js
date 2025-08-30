const fs = require('fs');

// Auto-detect Docker environment
const isDocker = fs.existsSync('/.dockerenv') || process.env.DOCKER_CONTAINER;
const isCI = process.env.CI;

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/index.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  // Reduce workers in Docker/CI to prevent memory/resource issues
  ...(isDocker || isCI
    ? {
        maxWorkers: 2,
        maxConcurrency: 1,
      }
    : {}),
};
