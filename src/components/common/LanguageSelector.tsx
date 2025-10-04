import React, { useState, useRef, useEffect } from 'react';
import { Languages, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { supportedLanguages, SupportedLanguage } from '@/i18n/config';
import { cn } from '@/lib/utils';

export function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = i18n.language as SupportedLanguage;

  const changeLanguage = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.addEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-lg',
          'text-sm font-medium ring-offset-background transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'hover:bg-accent hover:text-accent-foreground'
        )}
        aria-label={t('language')}
        title={t('language')}
      >
        <Languages className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border bg-popover shadow-lg z-50">
          <div className="py-1">
            {Object.entries(supportedLanguages).map(([code, { nativeName }]) => {
              const lang = code as SupportedLanguage;
              const isActive = currentLanguage === lang;

              return (
                <button
                  key={code}
                  onClick={() => changeLanguage(lang)}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm flex items-center justify-between',
                    'hover:bg-accent hover:text-accent-foreground',
                    'transition-colors',
                    isActive && 'bg-accent/50'
                  )}
                >
                  <span>{nativeName}</span>
                  {isActive && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
