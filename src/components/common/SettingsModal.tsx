import React, { useState, useEffect } from 'react';
import { X, Settings, Key, Link, Save, AlertCircle } from 'lucide-react';
import { useSession } from '@/contexts/SessionContext';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { configureSession, isConfigured } = useSession();
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
              <h2 className="text-lg font-semibold">API Settings</h2>
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
                API Key (Optional)
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
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
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Used for authentication with your n8n webhook
              </p>
            </div>

            {/* Webhook URL */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Link className="h-4 w-4" />
                n8n Webhook URL
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-n8n.domain/webhook/..."
                className={cn(
                  'w-full rounded-md border bg-background px-3 py-2',
                  'text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                )}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Your n8n webhook endpoint URL
              </p>
            </div>

            {/* Info Box */}
            <div className="rounded-lg bg-muted/50 p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Connection Info:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Leave webhook URL empty to use default endpoint</li>
                  <li>API key is optional but recommended for security</li>
                  <li>Settings are saved locally and used for all sessions</li>
                </ul>
              </div>
            </div>

            {/* Status */}
            {isConfigured && (
              <div className="text-sm text-green-600 dark:text-green-400">
                ✓ Connection configured
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
              Cancel
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
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </>
  );
}