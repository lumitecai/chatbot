import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Conversation, Message } from '@/types';
import { storageService } from '@/services/storage';
import { generateId, generateConversationTitle } from '@/utils/helpers';

interface ConversationContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversation: (conversation: Conversation | null) => void;
  createNewConversation: () => Conversation;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  updateConversation: (conversation: Conversation) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    return storageService.getConversations();
  });

  const [activeConversation, setActiveConversationState] = useState<Conversation | null>(() => {
    const activeId = storageService.getActiveConversationId();
    if (activeId) {
      return storageService.getConversation(activeId);
    }
    return null;
  });

  // Save conversations to storage whenever they change
  useEffect(() => {
    storageService.saveConversations(conversations);
  }, [conversations]);

  // Save active conversation ID to storage
  useEffect(() => {
    storageService.setActiveConversationId(activeConversation?.id || null);
  }, [activeConversation]);

  const setActiveConversation = useCallback((conversation: Conversation | null) => {
    setActiveConversationState(conversation);
  }, []);

  const createNewConversation = useCallback((): Conversation => {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationState(newConversation);
    return newConversation;
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
    storageService.deleteConversation(id);
    
    if (activeConversation?.id === id) {
      setActiveConversationState(null);
    }
  }, [activeConversation]);

  const addMessage = useCallback((conversationId: string, message: Message) => {
    setConversations((prev) => {
      return prev.map((conv) => {
        if (conv.id === conversationId) {
          const updatedConv = {
            ...conv,
            messages: [...conv.messages, message],
            lastMessage: message.content,
            updatedAt: new Date().toISOString(),
          };

          // Update title if it's the first user message
          if (conv.messages.length === 0 && message.role === 'user') {
            updatedConv.title = generateConversationTitle(message.content);
          }

          // Update active conversation if it's the current one
          if (activeConversation?.id === conversationId) {
            setActiveConversationState(updatedConv);
          }

          return updatedConv;
        }
        return conv;
      });
    });
  }, [activeConversation]);

  const updateMessage = useCallback((conversationId: string, messageId: string, updates: Partial<Message>) => {
    setConversations((prev) => {
      return prev.map((conv) => {
        if (conv.id === conversationId) {
          const updatedConv = {
            ...conv,
            messages: conv.messages.map((msg) =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
            lastMessage: updates.content || conv.lastMessage,
            updatedAt: new Date().toISOString(),
          };

          // Update active conversation if it's the current one
          if (activeConversation?.id === conversationId) {
            setActiveConversationState(updatedConv);
          }

          return updatedConv;
        }
        return conv;
      });
    });
  }, [activeConversation]);

  const updateConversation = useCallback((conversation: Conversation) => {
    setConversations((prev) => {
      return prev.map((conv) => {
        if (conv.id === conversation.id) {
          return conversation;
        }
        return conv;
      });
    });

    if (activeConversation?.id === conversation.id) {
      setActiveConversationState(conversation);
    }
  }, [activeConversation]);

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        activeConversation,
        setActiveConversation,
        createNewConversation,
        deleteConversation,
        addMessage,
        updateMessage,
        updateConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
}