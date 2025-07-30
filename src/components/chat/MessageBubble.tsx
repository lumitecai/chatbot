import React from 'react';
import { User, Bot } from 'lucide-react';
import { Message } from '@/types';
import { formatTimestamp } from '@/utils/helpers';
import { MarkdownMessage } from './MarkdownMessage';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isLoading?: boolean;
}

function MessageBubbleComponent({ message, isLoading = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 bg-current rounded-full animate-bounce" />
          </div>
        ) : (
          <>
            <div className="text-sm">
              {isUser ? (
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              ) : (
                <MarkdownMessage 
                  content={message.content}
                  className={cn(
                    "prose-p:mb-2 prose-p:last:mb-0",
                    "prose-headings:text-foreground",
                    "prose-strong:text-foreground",
                    "prose-code:text-foreground prose-code:bg-background/50",
                    "prose-pre:bg-background/50",
                    "prose-blockquote:text-muted-foreground",
                    "prose-ul:my-2 prose-ol:my-2",
                    "prose-li:my-0"
                  )}
                />
              )}
            </div>
            <p
              className={cn(
                'text-xs mt-2 opacity-70',
                isUser ? 'text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              {formatTimestamp(message.timestamp)}
            </p>
          </>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>
      )}
    </div>
  );
}

export const MessageBubble = React.memo(MessageBubbleComponent);