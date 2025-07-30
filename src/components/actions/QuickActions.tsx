import React from 'react';
import { Code, FileText, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  onSelect: (prompt: string) => void;
}

const quickActions = [
  {
    id: 'code-review',
    label: 'Code Review',
    icon: Code,
    prompt: 'Help me review this code for best practices and potential improvements',
  },
  {
    id: 'summarize',
    label: 'Summarize',
    icon: FileText,
    prompt: 'Please summarize the key points from this content',
  },
  {
    id: 'brainstorm',
    label: 'Brainstorm',
    icon: Lightbulb,
    prompt: "Let's brainstorm creative ideas and solutions for",
  },
];

function QuickActionsComponent({ onSelect }: QuickActionsProps) {
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