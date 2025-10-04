import React, { useMemo, useState } from 'react';
import { MessageSquare, Clock, Plus, Calendar, Archive, Search, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useConversation } from '@/contexts/ConversationContext';
import { useTranslation } from '@/hooks/useTranslation';
import { ConversationCard } from './ConversationCard';
import { NewChatButton } from './NewChatButton';
import { CollapsibleSection } from '@/components/common/CollapsibleSection';
import { Tooltip } from '@/components/common/Tooltip';
import { cn } from '@/lib/utils';

interface ConversationSidebarProps {
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ConversationSidebar({ onClose, isCollapsed = false, onToggleCollapse }: ConversationSidebarProps) {
  const { conversations, activeConversation, setActiveConversation, createNewConversation } = useConversation();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Group conversations by time periods
  const groupedConversations = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date(today);
    thisMonth.setMonth(thisMonth.getMonth() - 1);
    
    const groups = {
      today: [] as typeof conversations,
      yesterday: [] as typeof conversations,
      thisWeek: [] as typeof conversations,
      thisMonth: [] as typeof conversations,
      older: [] as typeof conversations,
    };
    
    conversations.forEach((conv) => {
      const convDate = new Date(conv.updatedAt);
      if (convDate >= today) {
        groups.today.push(conv);
      } else if (convDate >= yesterday) {
        groups.yesterday.push(conv);
      } else if (convDate >= thisWeek) {
        groups.thisWeek.push(conv);
      } else if (convDate >= thisMonth) {
        groups.thisMonth.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  }, [conversations]);

  const handleConversationClick = (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      setActiveConversation(conversation);
      onClose?.();
    }
  };

  if (isCollapsed) {
    return (
      <div className="flex h-full flex-col">
        {/* Collapsed Header */}
        <div className="border-b p-2 flex flex-col items-center gap-2">
          <Tooltip content={t('expandSidebar')} side="right">
            <button
              onClick={onToggleCollapse}
              className={cn(
                'p-2 rounded-lg transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
              aria-label={t('expandSidebar')}
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          </Tooltip>

          <Tooltip content={t('newChat')} side="right">
            <button
              onClick={createNewConversation}
              className={cn(
                'p-2 rounded-lg transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
              aria-label={t('newChat')}
            >
              <Plus className="h-5 w-5" />
            </button>
          </Tooltip>
        </div>

        {/* Collapsed Conversations */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-2">
            {conversations.slice(0, 10).map((conversation, index) => {
              const isFirst = index === 0;
              const showSeparator = index === 5 && conversations.length > 5;
              
              return (
                <React.Fragment key={conversation.id}>
                  {showSeparator && (
                    <div className="w-full border-t my-2" />
                  )}
                  <Tooltip content={conversation.title} side="right">
                    <button
                      onClick={() => {
                        setActiveConversation(conversation);
                        onClose?.();
                      }}
                      className={cn(
                        'w-full p-2 rounded-lg transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        activeConversation?.id === conversation.id && 'bg-accent'
                      )}
                    >
                      <MessageSquare className="h-5 w-5" />
                    </button>
                  </Tooltip>
                </React.Fragment>
              );
            })}
            
            {conversations.length > 10 && (
              <Tooltip content={t('moreConversations', { count: conversations.length - 10 })} side="right">
                <div className="text-center py-2 text-muted-foreground">
                  <span className="text-xs">+{conversations.length - 10}</span>
                </div>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Collapse Button */}
      <div className="absolute -right-3 top-20 z-10">
        <button
          onClick={onToggleCollapse}
          className={cn(
            'p-1.5 rounded-full bg-background border shadow-sm',
            'hover:bg-accent hover:text-accent-foreground',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'transition-all duration-200 hover:scale-110'
          )}
          aria-label={t('collapseSidebar')}
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
      </div>

      <CollapsibleSection
        title={t('newChat')}
        icon={<Plus className="h-4 w-4" />}
        defaultOpen={true}
        headerClassName="border-b-2"
        contentClassName="px-4"
      >
        <NewChatButton />
      </CollapsibleSection>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            {t('noConversations')}
          </div>
        ) : (
          <>
            {/* Search Box for Older Messages */}
            {(groupedConversations.yesterday.length > 0 || 
              groupedConversations.thisWeek.length > 0 || 
              groupedConversations.thisMonth.length > 0 || 
              groupedConversations.older.length > 0) && (
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t('searchConversations')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            )}

            {/* Today's Conversations */}
            {groupedConversations.today.length > 0 && (
              <CollapsibleSection
                title={t('today')}
                icon={<MessageSquare className="h-4 w-4" />}
                badge={groupedConversations.today.length}
                defaultOpen={true}
                contentClassName="px-2"
              >
                <div className="space-y-1">
                  {groupedConversations.today
                    .filter(conv => !searchQuery || 
                      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((conversation) => (
                      <ConversationCard
                        key={conversation.id}
                        conversation={conversation}
                        isActive={activeConversation?.id === conversation.id}
                        onClick={() => handleConversationClick(conversation.id)}
                      />
                    ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Yesterday's Conversations */}
            {groupedConversations.yesterday.length > 0 && (
              <CollapsibleSection
                title={t('yesterday')}
                icon={<Clock className="h-4 w-4" />}
                badge={groupedConversations.yesterday.length}
                defaultOpen={searchQuery.length > 0}
                contentClassName="px-2"
              >
                <div className="space-y-1">
                  {groupedConversations.yesterday
                    .filter(conv => !searchQuery || 
                      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((conversation) => (
                      <ConversationCard
                        key={conversation.id}
                        conversation={conversation}
                        isActive={activeConversation?.id === conversation.id}
                        onClick={() => handleConversationClick(conversation.id)}
                      />
                    ))}
                </div>
              </CollapsibleSection>
            )}

            {/* This Week's Conversations */}
            {groupedConversations.thisWeek.length > 0 && (
              <CollapsibleSection
                title={t('thisWeek')}
                icon={<Calendar className="h-4 w-4" />}
                badge={groupedConversations.thisWeek.length}
                defaultOpen={searchQuery.length > 0}
                contentClassName="px-2"
              >
                <div className="space-y-1">
                  {groupedConversations.thisWeek
                    .filter(conv => !searchQuery || 
                      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((conversation) => (
                      <ConversationCard
                        key={conversation.id}
                        conversation={conversation}
                        isActive={activeConversation?.id === conversation.id}
                        onClick={() => handleConversationClick(conversation.id)}
                      />
                    ))}
                </div>
              </CollapsibleSection>
            )}

            {/* This Month's Conversations */}
            {groupedConversations.thisMonth.length > 0 && (
              <CollapsibleSection
                title={t('thisMonth')}
                icon={<Calendar className="h-4 w-4" />}
                badge={groupedConversations.thisMonth.length}
                defaultOpen={searchQuery.length > 0}
                contentClassName="px-2"
              >
                <div className="space-y-1">
                  {groupedConversations.thisMonth
                    .filter(conv => !searchQuery || 
                      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((conversation) => (
                      <ConversationCard
                        key={conversation.id}
                        conversation={conversation}
                        isActive={activeConversation?.id === conversation.id}
                        onClick={() => handleConversationClick(conversation.id)}
                      />
                    ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Older Conversations */}
            {groupedConversations.older.length > 0 && (
              <CollapsibleSection
                title={t('older')}
                icon={<Archive className="h-4 w-4" />}
                badge={groupedConversations.older.length}
                defaultOpen={searchQuery.length > 0}
                contentClassName="px-2"
              >
                <div className="space-y-1">
                  {groupedConversations.older
                    .filter(conv => !searchQuery || 
                      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((conversation) => (
                      <ConversationCard
                        key={conversation.id}
                        conversation={conversation}
                        isActive={activeConversation?.id === conversation.id}
                        onClick={() => handleConversationClick(conversation.id)}
                      />
                    ))}
                </div>
              </CollapsibleSection>
            )}
          </>
        )}
      </div>
    </div>
  );
}