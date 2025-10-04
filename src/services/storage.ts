import { Conversation } from '@/types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'ai-chat-conversations',
  THEME: 'ai-chat-theme',
  USER_ID: 'ai-chat-user-id',
  ACTIVE_CONVERSATION: 'ai-chat-active-conversation',
  SESSION_ID: 'ai-chat-session-id',
};

// 30-day retention policy
const RETENTION_DAYS = 30;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

export const storageService = {
  // Clean up conversations older than 30 days
  cleanupOldConversations(): number {
    try {
      const conversations = this.getConversations();
      const now = Date.now();
      const cutoffTime = now - RETENTION_MS;

      const validConversations = conversations.filter((conv) => {
        const lastMessageTime = conv.messages.length > 0
          ? new Date(conv.messages[conv.messages.length - 1].timestamp).getTime()
          : new Date(conv.createdAt).getTime();

        return lastMessageTime >= cutoffTime;
      });

      const removedCount = conversations.length - validConversations.length;

      if (removedCount > 0) {
        this.saveConversations(validConversations);
        console.log(`Cleaned up ${removedCount} conversation(s) older than ${RETENTION_DAYS} days`);
      }

      return removedCount;
    } catch (error) {
      console.error('Error cleaning up old conversations:', error);
      return 0;
    }
  },

  // Conversations
  getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      const conversations = data ? JSON.parse(data) : [];

      // Automatically clean up old conversations on load
      const now = Date.now();
      const cutoffTime = now - RETENTION_MS;

      const validConversations = conversations.filter((conv: Conversation) => {
        const lastMessageTime = conv.messages.length > 0
          ? new Date(conv.messages[conv.messages.length - 1].timestamp).getTime()
          : new Date(conv.createdAt).getTime();

        return lastMessageTime >= cutoffTime;
      });

      // Save cleaned conversations if any were removed
      if (validConversations.length < conversations.length) {
        this.saveConversations(validConversations);
      }

      return validConversations;
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  },

  saveConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  },

  getConversation(id: string): Conversation | null {
    const conversations = this.getConversations();
    return conversations.find((conv) => conv.id === id) || null;
  },

  saveConversation(conversation: Conversation): void {
    const conversations = this.getConversations();
    const index = conversations.findIndex((conv) => conv.id === conversation.id);
    
    if (index !== -1) {
      conversations[index] = conversation;
    } else {
      conversations.push(conversation);
    }
    
    this.saveConversations(conversations);
  },

  deleteConversation(id: string): void {
    const conversations = this.getConversations();
    const filtered = conversations.filter((conv) => conv.id !== id);
    this.saveConversations(filtered);
  },

  // Theme
  getTheme(): 'light' | 'dark' {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | null;
    return theme || 'light';
  },

  saveTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // User ID
  getUserId(): string {
    let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    }
    return userId;
  },

  // Session ID
  getSessionId(): string {
    let sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    }
    return sessionId;
  },

  // Active conversation
  getActiveConversationId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
  },

  setActiveConversationId(id: string | null): void {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
    }
  },

  // Clear all data
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },
};