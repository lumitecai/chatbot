import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollapsibleState } from '@/hooks/useCollapsibleState';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  persistKey?: string;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  className,
  headerClassName,
  contentClassName,
  icon,
  badge,
  persistKey,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useCollapsibleState(
    persistKey || title.toLowerCase().replace(/\s+/g, '-'),
    defaultOpen
  );

  return (
    <div className={cn('border-b', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between p-4 text-left',
          'hover:bg-accent/50 transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          headerClassName
        )}
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 transition-transform" />
          ) : (
            <ChevronRight className="h-4 w-4 transition-transform" />
          )}
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="font-medium">{title}</span>
          {badge !== undefined && (
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {badge}
            </span>
          )}
        </div>
      </button>
      
      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className={cn('pb-4', contentClassName)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}