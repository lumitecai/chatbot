import React, { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string, file?: File) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder = "Type a message..." }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((message.trim() || selectedFile) && !isLoading) {
      // Input validation and sanitization
      const trimmedMessage = message.trim();

      // Validate message length
      if (trimmedMessage.length > 4000) {
        console.warn('Message too long, truncating to 4000 characters');
        return;
      }

      // Check for excessively repetitive content (potential spam/abuse)
      const uniqueChars = new Set(trimmedMessage.toLowerCase()).size;
      if (trimmedMessage.length > 100 && uniqueChars < 10) {
        console.warn('Message appears to be spam or invalid');
        return;
      }

      // Basic sanitization - remove control characters except newlines/tabs
      const sanitizedMessage = trimmedMessage.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

      onSend(sanitizedMessage, selectedFile || undefined);
      setMessage('');
      setSelectedFile(null);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <FileUpload
        ref={fileInputRef}
        onFileSelect={setSelectedFile}
        onRemove={() => setSelectedFile(null)}
        selectedFile={selectedFile}
      />
      
      <div className="flex items-end gap-2 rounded-lg border bg-background p-2">
        <button
          onClick={handleFileButtonClick}
          className={cn(
            'p-2 rounded-md transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
          aria-label="Upload file"
          disabled={isLoading}
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent px-2 py-1.5',
            'text-sm placeholder:text-muted-foreground',
            'focus:outline-none',
            'min-h-[40px] max-h-[200px]'
          )}
        />

        <button
          onClick={handleSend}
          disabled={(!message.trim() && !selectedFile) || isLoading}
          className={cn(
            'p-2 rounded-md transition-colors',
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50'
          )}
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

      {message.length > 3900 && (
        <p className="absolute -top-6 right-0 text-xs text-destructive">
          {4000 - message.length} characters remaining
        </p>
      )}
    </div>
  );
}