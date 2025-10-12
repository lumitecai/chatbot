import React, { useState, useEffect } from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import { useTranslation } from '@/hooks/useTranslation';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { WorkflowStatus } from './WorkflowStatus';
import { QuickActions } from '@/components/actions/QuickActions';
import { SuggestedActions } from '@/components/actions/SuggestedActions';
import { useStreamingChat } from '@/hooks/useStreamingChat';

export function ChatInterface() {
  const { activeConversation, createNewConversation } = useConversation();
  const { sendMessage, isLoading, isStreaming } = useStreamingChat();
  const { t } = useTranslation();
  const [suggestions] = useState<string[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Load UI preferences
  useEffect(() => {
    const uiPrefs = localStorage.getItem('ui-preferences');
    if (uiPrefs) {
      const prefs = JSON.parse(uiPrefs);
      setShowQuickActions(prefs.showQuickActions ?? false);
    }
  }, []);

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

    try {
      await sendMessage(messageContent);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-muted-foreground">
            {t('loadingConversation', { ns: 'chat' })}
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
        isStreaming={isStreaming}
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
        {showQuickActions && (
          <div className="p-3">
            <QuickActions onSelect={handleSendMessage} />
          </div>
        )}

        {/* Chat Input */}
        <div className="p-4 pt-0">
          <ChatInput
            onSend={handleSendMessage}
            isLoading={isLoading}
            placeholder={t('typeMessage', { ns: 'chat' })}
          />
        </div>
      </div>

      {/* Workflow Status */}
      <WorkflowStatus
        conversationId={activeConversation.id}
        showConnectionStatus={false}
        autoHideDelay={5000}
      />
    </div>
  );
}