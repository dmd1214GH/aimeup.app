export type ChatMessage = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  userId?: string;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export type CreateChatRequest = {
  title?: string;
  initialMessage?: string;
};

export type SendMessageRequest = {
  sessionId: string;
  content: string;
};
