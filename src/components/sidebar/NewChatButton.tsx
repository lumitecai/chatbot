import React from 'react';
import { Plus } from 'lucide-react';
import { useConversation } from '@/contexts/ConversationContext';
import { cn } from '@/lib/utils';

export function NewChatButton() {
  const { createNewConversation } = useConversation();

  return (
    <button
      onClick={createNewConversation}
      className={cn(
        'w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5',
        'bg-primary text-primary-foreground font-medium',
        'transition-colors hover:bg-primary/90',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      <Plus className="h-4 w-4" />
      New Chat
    </button>
  );
}