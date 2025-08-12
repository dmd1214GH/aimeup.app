import type { AIRequest, AIResponse } from '../aiapi';

describe('AIRequest type', () => {
  test('should accept valid request structure', () => {
    const request: AIRequest = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Hello' }
      ],
      temperature: 0.7,
      max_tokens: 100
    };

    expect(request.model).toBe('gpt-3.5-turbo');
    expect(request.messages).toHaveLength(1);
    expect(request.temperature).toBe(0.7);
  });

  test('should work with minimal required fields', () => {
    const request: AIRequest = {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'What is 2+2?' }
      ]
    };

    expect(request.model).toBe('gpt-4');
    expect(request.messages).toHaveLength(2);
    expect(request.temperature).toBeUndefined();
    expect(request.max_tokens).toBeUndefined();
  });
});

describe('AIResponse type', () => {
  test('should accept valid response structure', () => {
    const response: AIResponse = {
      id: 'chatcmpl-123',
      object: 'chat.completion',
      created: 1677652288,
      model: 'gpt-3.5-turbo',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: 'Hello! How can I help you today?'
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: 9,
        completion_tokens: 12,
        total_tokens: 21
      }
    };

    expect(response.id).toBe('chatcmpl-123');
    expect(response.choices).toHaveLength(1);
    expect(response.choices[0].message.content).toBe('Hello! How can I help you today?');
  });
});