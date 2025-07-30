export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  conversationId: string;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface SuggestedAction {
  id: string;
  text: string;
  category: 'code' | 'explanation' | 'help' | 'general';
  priority: number;
  reasoning?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

export interface ChatCompletionRequest {
  message: string;
  conversationId: string;
  userId: string;
  sessionId?: string;
  context?: {
    previousMessages?: Message[];
    conversationHistory?: string[];
  };
  metadata?: {
    sessionId?: string;
    userAgent?: string;
    timestamp?: string;
    sessionMetadata?: Record<string, any>;
  };
}

export interface ChatCompletionResponse {
  response: string;
  conversationId: string;
  messageId: string;
  timestamp: string;
  metadata: {
    processingTime: number;
    model: string;
    tokens: {
      prompt: number;
      completion: number;
      total: number;
    };
  };
  error?: string | null;
}

export interface SuggestionsRequest {
  lastMessage: string;
  conversationContext: Message[];
  userId: string;
  conversationId: string;
}

export interface SuggestionsResponse {
  suggestions: SuggestedAction[];
  metadata: {
    analysisTime: number;
    confidence: number;
    fallbackUsed: boolean;
  };
  error?: string | null;
}