module.exports = {
  extends: ['./configs/eslint/base.cjs'],
  ignorePatterns: ['node_modules/', 'dist/', '.expo/', 'build/', '*.config.js', '*.config.ts'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@aimeup/core',
            message: 'Use subpath import like @aimeup/core/aiapi',
          },
          {
            name: '@aimeup/helpers',
            message: 'Use subpath import like @aimeup/helpers/files',
          },
        ],
      },
    ],
  },
};
