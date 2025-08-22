module.exports = {
  extends: ['../../../.eslintrc.cjs'],
  env: {
    node: true,
    jest: true,
  },
  overrides: [
    {
      files: ['tests/**/*.ts'],
      env: {
        jest: true,
      },
    },
  ],
};
