module.exports = {
  extends: ['../../configs/eslint/base.cjs'],
  parserOptions: {
    project: false,
  },
  globals: {
    __DEV__: 'readonly',
  },
  env: {
    browser: true,
    node: true,
  },
};
