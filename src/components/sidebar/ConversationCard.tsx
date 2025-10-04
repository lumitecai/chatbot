import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Conversation } from '@/types';
import { useConversation } from '@/contexts/ConversationContext';
import { useToast } from '@/contexts/ToastContext';
import { formatTimestamp, truncateText } from '@/utils/helpers';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { cn } from '@/lib/utils';

interface ConversationCardProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationCard({ conversation, isActive, onClick }: ConversationCardProps) {
  const { deleteConversation } = useConversation();
  const { showToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    // Add a small delay for visual feedback
    setTimeout(() => {
      deleteConversation(conversation.id);
      showToast(`Conversation "${conversation.title}" deleted`, 'success');
    }, 400);
  };

  return (
    <>
      <div
        className={cn(
          'overflow-hidden',
          'transition-all duration-300 ease-out',
          isDeleting ? 'max-h-0 opacity-0 mb-0' : 'max-h-32 mb-1'
        )}
      >
        <div
          className={cn(
            'group relative cursor-pointer rounded-lg px-3 py-2 text-sm',
            'transition-all duration-300 ease-out',
            'hover:bg-accent',
            isActive && 'bg-accent',
            isDeleting && 'opacity-0 scale-95 -translate-x-full'
          )}
          onClick={onClick}
        >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 overflow-hidden">
            <h3 className="font-medium truncate">
              {conversation.title}
            </h3>
            {conversation.lastMessage && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {truncateText(conversation.lastMessage, 50)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {formatTimestamp(conversation.updatedAt)}
            </p>
          </div>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={cn(
              'opacity-0 group-hover:opacity-100 transition-all duration-200',
              'p-1.5 rounded-md',
              'hover:bg-destructive/10 hover:text-destructive hover:scale-110',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label="Delete conversation"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Conversation"
        message={`Are you sure you want to delete "${conversation.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}