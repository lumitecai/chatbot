import React from 'react';
import { Code, FileText, Lightbulb } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  onSelect: (prompt: string) => void;
}

function QuickActionsComponent({ onSelect }: QuickActionsProps) {
  const { t } = useTranslation();

  const quickActions = [
    {
      id: 'code-review',
      label: t('codeReview', { ns: 'chat' }),
      icon: Code,
      prompt: t('codeReviewPrompt', { ns: 'chat' }),
    },
    {
      id: 'summarize',
      label: t('summarize', { ns: 'chat' }),
      icon: FileText,
      prompt: t('summarizePrompt', { ns: 'chat' }),
    },
    {
      id: 'brainstorm',
      label: t('brainstorm', { ns: 'chat' }),
      icon: Lightbulb,
      prompt: t('brainstormPrompt', { ns: 'chat' }),
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => onSelect(action.prompt)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-2',
              'text-sm font-medium',
              'bg-secondary text-secondary-foreground',
              'transition-colors hover:bg-secondary/80',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

export const QuickActions = React.memo(QuickActionsComponent);