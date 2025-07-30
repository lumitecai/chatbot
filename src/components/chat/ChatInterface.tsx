import React, { useState, useEffect } from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { QuickActions } from '@/components/actions/QuickActions';
import { SuggestedActions } from '@/components/actions/SuggestedActions';
import { Message } from '@/types';
import { generateId } from '@/utils/helpers';
import { chatAPI } from '@/services/api';
import { storageService } from '@/services/storage';

export function ChatInterface() {
  const { activeConversation, createNewConversation, addMessage } = useConversation();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions] = useState<string[]>([]);

  // Create a new conversation if none exists
  useEffect(() => {
    if (!activeConversation) {
      createNewConversation();
    }
  }, [activeConversation, createNewConversation]);

  const handleSendMessage = async (content: string, file?: File) => {
    if (!activeConversation || (!content.trim() && !file) || isLoading) return;

    let messageContent = content.trim();
    if (file) {
      messageContent = messageContent ? `${messageContent}\n\n[Attached: ${file.name}]` : `[Attached: ${file.name}]`;
    }

    const userMessage: Message = {
      id: generateId(),
      content: messageContent,
      role: 'user',
      timestamp: new Date().toISOString(),
      conversationId: activeConversation.id,
    };

    // Add user message
    addMessage(activeConversation.id, userMessage);
    setIsLoading(true);

    try {
      // Get user ID
      const userId = storageService.getUserId();

      // Prepare API request - simplified since n8n handles memory
      const request = {
        message: content,
        conversationId: activeConversation.id,
        userId,
        context: {}, // Empty since n8n handles memory
        metadata: {
          sessionId: storageService.getSessionId(),
          timestamp: new Date().toISOString(),
        },
      };

      // Send to API
      const response = await chatAPI.sendMessage(request);

      // Add assistant message
      const assistantMessage: Message = {
        id: response.messageId,
        content: response.response,
        role: 'assistant',
        timestamp: response.timestamp,
        conversationId: activeConversation.id,
      };

      addMessage(activeConversation.id, assistantMessage);

      // Get suggestions for the next interaction
      // Disabled for n8n webhook integration
      // const suggestionsResponse = await chatAPI.getSuggestions({
      //   lastMessage: content,
      //   conversationContext: [...activeConversation.messages, userMessage, assistantMessage].slice(-5),
      //   userId,
      //   conversationId: activeConversation.id,
      // });

      // setSuggestions(suggestionsResponse.suggestions.map((s) => s.text));
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: generateId(),
        content: 'I apologize, but I encountered an error processing your message. Please try again.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
        conversationId: activeConversation.id,
      };
      
      addMessage(activeConversation.id, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-muted-foreground">
            Loading conversation...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <MessageList
        messages={activeConversation.messages}
        isLoading={isLoading}
      />

      {/* Actions and Input */}
      <div className="border-t bg-background">
        {/* Suggested Actions */}
        {suggestions.length > 0 && (
          <div className="border-b p-3">
            <SuggestedActions
              suggestions={suggestions}
              onSelect={handleSendMessage}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="p-3">
          <QuickActions onSelect={handleSendMessage} />
        </div>

        {/* Chat Input */}
        <div className="p-4 pt-0">
          <ChatInput
            onSend={handleSendMessage}
            isLoading={isLoading}
            placeholder="Type your message..."
          />
        </div>
      </div>
    </div>
  );
}