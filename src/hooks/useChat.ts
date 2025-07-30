import { useState, useCallback } from 'react';
import { Message } from '@/types';
import { generateId } from '@/utils/helpers';
import { chatAPI } from '@/services/api';
import { storageService } from '@/services/storage';
import { useConversation } from '@/contexts/ConversationContext';

export function useChat() {
  const { activeConversation, addMessage } = useConversation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeConversation || !content.trim() || isLoading) {
        return;
      }

      setIsLoading(true);
      setError(null);

      const userMessage: Message = {
        id: generateId(),
        content: content.trim(),
        role: 'user',
        timestamp: new Date().toISOString(),
        conversationId: activeConversation.id,
      };

      // Add user message immediately
      addMessage(activeConversation.id, userMessage);

      try {
        const userId = storageService.getUserId();

        const request = {
          message: content,
          conversationId: activeConversation.id,
          userId,
          context: {
            previousMessages: activeConversation.messages.slice(-10),
            conversationHistory: activeConversation.messages.map((m) => m.content),
          },
          metadata: {
            sessionId: `session-${Date.now()}`,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        };

        const response = await chatAPI.sendMessage(request);

        const assistantMessage: Message = {
          id: response.messageId,
          content: response.response,
          role: 'assistant',
          timestamp: response.timestamp,
          conversationId: activeConversation.id,
        };

        addMessage(activeConversation.id, assistantMessage);
        
        return { userMessage, assistantMessage };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setError(errorMessage);

        const errorResponseMessage: Message = {
          id: generateId(),
          content: 'I apologize, but I encountered an error processing your message. Please try again.',
          role: 'assistant',
          timestamp: new Date().toISOString(),
          conversationId: activeConversation.id,
        };

        addMessage(activeConversation.id, errorResponseMessage);
        
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [activeConversation, addMessage, isLoading]
  );

  return {
    sendMessage,
    isLoading,
    error,
  };
}