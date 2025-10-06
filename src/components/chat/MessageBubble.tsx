import React, { useState } from 'react';
import { User, Bot, Copy, Check } from 'lucide-react';
import { Message } from '@/types';
import { formatTimestamp } from '@/utils/helpers';
import { MarkdownMessage } from './MarkdownMessage';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isLoading?: boolean;
  isStreaming?: boolean;
}

function MessageBubbleComponent({ message, isLoading = false, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

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
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">ERA is thinking...</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-primary rounded-full dot-glow animate-wave-pulse animate-delay-0" />
              <span className="w-2.5 h-2.5 bg-primary rounded-full dot-glow animate-wave-pulse animate-delay-150" />
              <span className="w-2.5 h-2.5 bg-primary rounded-full dot-glow animate-wave-pulse animate-delay-300" />
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm">
              {isUser ? (
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              ) : (
                <>
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
                  {isStreaming && (
                    <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse" />
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <p
                className={cn(
                  'text-xs opacity-70',
                  isUser ? 'text-primary-foreground' : 'text-muted-foreground'
                )}
              >
                {formatTimestamp(message.timestamp)}
              </p>
              {!isUser && (
                <button
                  onClick={handleCopy}
                  className={cn(
                    'p-1 rounded transition-all duration-200',
                    'hover:bg-background/50',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                    copied ? 'text-green-600' : 'text-muted-foreground hover:text-foreground'
                  )}
                  aria-label={copied ? 'Copied!' : 'Copy message'}
                  title={copied ? 'Copied!' : 'Copy to clipboard'}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
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