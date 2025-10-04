import { useState, useCallback, useRef } from 'react';
import { Message } from '@/types';
import { generateId } from '@/utils/helpers';
import { sendStreamingMessage, createStreamController } from '@/services/streamingApi';
import { storageService } from '@/services/storage';
import { useConversation } from '@/contexts/ConversationContext';

export function useStreamingChat() {
  const { activeConversation, addMessage, updateMessage } = useConversation();
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeConversation || !content.trim() || isLoading) {
        return;
      }

      setIsLoading(true);
      setIsStreaming(true);
      setError(null);

      // Create abort controller for cancellation
      abortControllerRef.current = createStreamController();

      const userMessage: Message = {
        id: generateId(),
        content: content.trim(),
        role: 'user',
        timestamp: new Date().toISOString(),
        conversationId: activeConversation.id,
      };

      // Add user message immediately
      addMessage(activeConversation.id, userMessage);

      // Create placeholder assistant message for streaming
      const assistantMessageId = generateId();
      const assistantMessage: Message = {
        id: assistantMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date().toISOString(),
        conversationId: activeConversation.id,
      };

      // Add empty assistant message
      addMessage(activeConversation.id, assistantMessage);

      let accumulatedContent = '';

      try {
        const userId = storageService.getUserId();
        const sessionId = storageService.getSessionId();

        // Send streaming request
        const fullContent = await sendStreamingMessage(
          {
            message: content,
            conversationId: activeConversation.id,
            userId,
            sessionId,
          },
          {
            // Handle each chunk as it arrives
            onChunk: (chunk: string) => {
              accumulatedContent += chunk;

              // Update the assistant message with accumulated content
              updateMessage(activeConversation.id, assistantMessageId, {
                content: accumulatedContent,
              });
            },

            // Handle completion
            onComplete: (fullContent: string) => {
              // Final update with complete content
              updateMessage(activeConversation.id, assistantMessageId, {
                content: fullContent,
              });
              setIsStreaming(false);
            },

            // Handle errors
            onError: (error: Error) => {
              console.error('Streaming error:', error);
              setError(error.message);

              // Update message with error
              updateMessage(activeConversation.id, assistantMessageId, {
                content: 'I apologize, but I encountered an error processing your message. Please try again.',
              });
              setIsStreaming(false);
            },

            // Pass abort signal
            signal: abortControllerRef.current.signal,
          }
        );

        return { userMessage, assistantMessage };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';

        // Check if it was aborted
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Stream cancelled by user');
          updateMessage(activeConversation.id, assistantMessageId, {
            content: accumulatedContent || '[Message cancelled]',
          });
        } else {
          setError(errorMessage);
          updateMessage(activeConversation.id, assistantMessageId, {
            content: 'I apologize, but I encountered an error processing your message. Please try again.',
          });
        }

        setIsStreaming(false);
        throw error;
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [activeConversation, addMessage, updateMessage, isLoading]
  );

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setIsLoading(false);
    }
  }, []);

  return {
    sendMessage,
    cancelStream,
    isLoading,
    isStreaming,
    error,
  };
}
