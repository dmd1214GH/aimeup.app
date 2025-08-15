import type { ChatMessage } from '@aimeup/core/chatapi';

export interface ChatPlugin {
  id: string;
  name: string;
  description: string;
  canHandle: (message: string) => boolean;
  process: (message: string) => Promise<string>;
}

export const formatMessages = (messages: ChatMessage[]): string => {
  return messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n\n');
};

export const extractUserIntent = (message: string): string => {
  // Simple intent extraction - would be more sophisticated in real implementation
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('nutrition') || lowerMessage.includes('calories')) {
    return 'nutrition';
  }
  if (lowerMessage.includes('health') || lowerMessage.includes('fitness')) {
    return 'health';
  }

  return 'general';
};
