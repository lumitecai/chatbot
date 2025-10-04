import React, { useState, useEffect } from 'react';
import { X, Settings, Key, Link, Save, AlertCircle } from 'lucide-react';
import { useSession } from '@/contexts/SessionContext';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { configureSession, isConfigured } = useSession();
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    // Load saved values from localStorage
    const savedConfig = localStorage.getItem('ai-chat-config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setApiKey(config.apiKey || '');
      setWebhookUrl(config.webhookUrl || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    // Save to localStorage (for UI persistence)
    localStorage.setItem('ai-chat-config', JSON.stringify({ apiKey, webhookUrl }));
    
    // Configure session
    configureSession({
      apiKey: apiKey.trim() || undefined,
      webhookUrl: webhookUrl.trim() || undefined,
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 animate-in fade-in-0 zoom-in-95">
        <div className="rounded-lg border bg-background p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <h2 className="text-lg font-semibold">{t('settings.apiSettings')}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 hover:bg-accent hover:text-accent-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* API Key */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Key className="h-4 w-4" />
                {t('settings.apiKey')}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t('settings.apiKeyPlaceholder')}
                  className={cn(
                    'w-full rounded-md border bg-background px-3 py-2 pr-20',
                    'text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? t('settings.hide') : t('settings.show')}
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('settings.apiKeyHelp')}
              </p>
            </div>

            {/* Webhook URL */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Link className="h-4 w-4" />
                {t('settings.webhookUrl')}
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder={t('settings.webhookUrlPlaceholder')}
                className={cn(
                  'w-full rounded-md border bg-background px-3 py-2',
                  'text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                )}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {t('settings.webhookUrlHelp')}
              </p>
            </div>

            {/* Info Box */}
            <div className="rounded-lg bg-muted/50 p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">{t('settings.connectionInfo')}</p>
                <ul className="space-y-1 list-disc list-inside">
                  {(t('settings.connectionInfoList', { returnObjects: true }) as string[]).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Status */}
            {isConfigured && (
              <div className="text-sm text-green-600 dark:text-green-400">
                {t('settings.connectionConfigured')}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={onClose}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md',
                'bg-secondary text-secondary-foreground',
                'hover:bg-secondary/80'
              )}
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90',
                'flex items-center gap-2'
              )}
            >
              <Save className="h-4 w-4" />
              {t('settings.saveSettings')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}