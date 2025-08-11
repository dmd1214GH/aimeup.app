module.exports = {
  root: false,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended','plugin:@typescript-eslint/recommended'],
  env: { es2022: true, browser: true, node: true },
  ignorePatterns: ['dist','node_modules'],
}
