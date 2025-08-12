module.exports = {
  extends: ['./base.cjs'],
  env: {
    browser: true,
    node: true,
    jest: true
  },
  plugins: ['react', 'react-hooks', 'react-native'],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  },
  
  overrides: [
    {
      // Redux slice files should not import TanStack Query
      files: ['**/store/**/*slice.ts', '**/store/**/*slice.tsx', '**/slices/**/*.ts', '**/slices/**/*.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@tanstack/react-query'],
                message: 'TanStack Query is forbidden in Redux slice files. Use Redux for client state, TanStack Query for server state. See _docs/guides/state-management-integration.md'
              }
            ]
          }
        ]
      }
    },
    {
      // API/query files should not import Redux hooks
      files: ['**/api/**/*.ts', '**/api/**/*.tsx', '**/queries/**/*.ts', '**/queries/**/*.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['react-redux'],
                importNames: ['useSelector', 'useDispatch'],
                message: 'Redux hooks are forbidden in TanStack Query API files. Use TanStack Query for server state, Redux for client state. See _docs/guides/state-management-integration.md'
              }
            ]
          }
        ]
      }
    }
  ]
};