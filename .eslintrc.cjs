module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: { node: true, es2022: true },
  rules: {
    'no-restricted-imports': ['error', {
      paths: [{ name: '@aimeup/core', message: 'Use subpath import, e.g., @aimeup/core/aiapi' }]
    }]
  },
  ignorePatterns: ['dist', 'build', 'node_modules']
};
