module.exports = {
  extends: ['./base.cjs'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          { 
            name: '@aimeup/helpers', 
            message: 'Use subpath import like @aimeup/helpers/files' 
          }
        ],
        patterns: [
          {
            group: ['@aimeup/ui-native*', '@aimeup/chat*', '@aimeup/account*', '@eatgpt/*', '@aimeup/service*'],
            message: 'Helpers cannot import from domain/UI/app/service packages'
          }
        ]
      }
    ]
  }
};