import React, { useState } from 'react';
import { Menu, Settings, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { SettingsModal } from './SettingsModal';
import { useSession } from '@/contexts/SessionContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { isConfigured } = useSession();
  const { logout } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        <button
          onClick={onMenuClick}
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-lg',
            'text-sm font-medium ring-offset-background transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            'hover:bg-accent hover:text-accent-foreground',
            'lg:hidden'
          )}
          aria-label={isSidebarOpen ? t('closeSidebar') : t('openSidebar')}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-1 items-center justify-between">
          <h1 className="text-xl font-semibold">{t('appTitle')}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className={cn(
                'relative inline-flex h-10 w-10 items-center justify-center rounded-lg',
                'text-sm font-medium ring-offset-background transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:pointer-events-none disabled:opacity-50',
                'hover:bg-accent hover:text-accent-foreground'
              )}
              aria-label={t('settings')}
              title={t('settings')}
            >
              <Settings className="h-5 w-5" />
              {!isConfigured && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive animate-pulse" />
              )}
            </button>
            <LanguageSelector />
            <ThemeToggle />
            <button
              onClick={logout}
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-lg',
                'text-sm font-medium ring-offset-background transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:pointer-events-none disabled:opacity-50',
                'hover:bg-accent hover:text-accent-foreground'
              )}
              aria-label={t('logout')}
              title={t('logout')}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </header>
  );
}