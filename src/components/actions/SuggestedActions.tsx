import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestedActionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function SuggestedActions({ suggestions, onSelect }: SuggestedActionsProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Suggested follow-ups:
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.slice(0, 3).map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-3 py-1.5',
              'text-sm',
              'bg-accent text-accent-foreground',
              'transition-colors hover:bg-accent/80',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            {suggestion}
            <ChevronRight className="h-3 w-3" />
          </button>
        ))}
      </div>
    </div>
  );
}