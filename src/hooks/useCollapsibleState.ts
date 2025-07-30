import { useState, useEffect } from 'react';

export function useCollapsibleState(key: string, defaultOpen: boolean): [boolean, (value: boolean) => void] {
  const [isOpen, setIsOpen] = useState(() => {
    const stored = localStorage.getItem(`collapsible-${key}`);
    return stored !== null ? stored === 'true' : defaultOpen;
  });

  useEffect(() => {
    localStorage.setItem(`collapsible-${key}`, String(isOpen));
  }, [key, isOpen]);

  return [isOpen, setIsOpen];
}