import { fixupConfigRules } from '@eslint/compat';
import expoConfig from 'eslint-config-expo';

const config = [
  ...fixupConfigRules(expoConfig),
  {
    ignores: [
      '**/node_modules/**',
      'dist/**',
      '.expo/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  {
    rules: {
      // Allow console logs in app code
      'no-console': 'off',
      // Allow unused vars prefixed with underscore
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];

export default config;
