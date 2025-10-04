import React, { useEffect, useRef } from 'react';
import { Message } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isStreaming?: boolean;
}

export function MessageList({ messages, isLoading, isStreaming = false }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-2">{t('chat.startConversation')}</h2>
          <p className="text-muted-foreground">
            {t('chat.startConversationDesc')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6"
    >
      <div className="mx-auto max-w-3xl space-y-4">
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          const showStreamingIndicator = isLastMessage && isStreaming && message.role === 'assistant';

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={showStreamingIndicator}
            />
          );
        })}

        {isLoading && !isStreaming && (
          <MessageBubble
            message={{
              id: 'loading',
              content: '',
              role: 'assistant',
              timestamp: new Date().toISOString(),
              conversationId: '',
            }}
            isLoading
          />
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}