import React, { useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HoldToDeleteProps {
  onDelete: () => void;
  holdDuration?: number;
  className?: string;
}

export function HoldToDelete({ onDelete, holdDuration = 1000, className }: HoldToDeleteProps) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startHold = () => {
    setIsHolding(true);
    startTimeRef.current = Date.now();
    
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        endHold();
        onDelete();
      }
    }, 16); // ~60fps
  };

  const endHold = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsHolding(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <button
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      className={cn(
        'relative p-1.5 rounded-md overflow-hidden',
        'hover:bg-destructive/10 hover:text-destructive',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        'transition-all duration-200',
        isHolding && 'scale-110',
        className
      )}
      aria-label="Hold to delete"
    >
      <div
        className={cn(
          'absolute inset-0 bg-destructive/20 origin-left transition-transform',
          isHolding && 'animate-pulse'
        )}
        style={{ transform: `scaleX(${progress / 100})` }}
      />
      <Trash2 className="h-3.5 w-3.5 relative z-10" />
    </button>
  );
}