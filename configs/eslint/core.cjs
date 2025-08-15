module.exports = {
  extends: ['./base.cjs'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@aimeup/core',
            message: 'Use subpath import like @aimeup/core/aiapi',
          },
        ],
        patterns: [
          {
            group: [
              '@aimeup/ui-native*',
              '@aimeup/chat*',
              '@aimeup/account*',
              '@eatgpt/*',
              '@aimeup/service*',
            ],
            message: 'Core packages cannot import from domain/UI/app/service packages',
          },
        ],
      },
    ],
  },
};
