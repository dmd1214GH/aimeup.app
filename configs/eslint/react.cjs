module.exports = {
  extends: ['./base.cjs'],
  env: {
    browser: true,
    'react-native/react-native': true
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
  }
};