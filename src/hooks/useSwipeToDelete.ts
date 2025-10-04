import { useRef, useState, useEffect } from 'react';

interface SwipeToDeleteOptions {
  threshold?: number;
  onDelete: () => void;
  enabled?: boolean;
}

export function useSwipeToDelete({ 
  threshold = 100, 
  onDelete, 
  enabled = true 
}: SwipeToDeleteOptions) {
  const [isSwipedLeft, setIsSwipedLeft] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;
    let isMoving = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      currentX.current = startX.current;
      isMoving = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isMoving) return;
      
      currentX.current = e.touches[0].clientX;
      const offset = currentX.current - startX.current;
      
      // Only allow left swipe (negative offset)
      if (offset < 0) {
        setSwipeOffset(Math.max(offset, -threshold * 1.5));
      }
    };

    const handleTouchEnd = () => {
      isMoving = false;
      const offset = currentX.current - startX.current;
      
      if (Math.abs(offset) > threshold) {
        setIsSwipedLeft(true);
        setSwipeOffset(-threshold);
        // Trigger delete after animation
        setTimeout(onDelete, 300);
      } else {
        setSwipeOffset(0);
        setIsSwipedLeft(false);
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, threshold, onDelete]);

  return {
    elementRef,
    swipeOffset,
    isSwipedLeft,
  };
}