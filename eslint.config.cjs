/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  { ignores: ['**/dist', '**/node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: require('@typescript-eslint/parser') },
    plugins: { '@typescript-eslint': require('@typescript-eslint/eslint-plugin') },
    rules: {
      // conservative defaults; we can tighten later
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
    }
  }
]
