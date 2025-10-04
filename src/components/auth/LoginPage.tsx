import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { Bot, AlertCircle, Loader2 } from 'lucide-react';
import { isAzureADConfigured } from '@/config/authConfig';

export function LoginPage() {
  const { login, loginWithMicrosoft, isLoading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [azureConfigured, setAzureConfigured] = useState(false);

  useEffect(() => {
    setAzureConfigured(isAzureADConfigured());
  }, []);

  const handleMicrosoftLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      const success = await loginWithMicrosoft();
      if (!success) {
        setError(t('loginFailed', { ns: 'auth' }));
      }
    } catch (err) {
      setError(t('loginError', { ns: 'auth' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBasicLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError(t('invalidCredentials', { ns: 'auth' }));
      }
    } catch (err) {
      setError(t('loginError', { ns: 'auth' }));
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t('checkingAuth', { ns: 'auth' })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{t('welcomeTitle', { ns: 'auth' })}</h1>
            <p className="text-muted-foreground mt-2">{t('signInPrompt', { ns: 'auth' })}</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Microsoft Sign-In (Azure AD Only - No Fallback) */}
          {azureConfigured ? (
            <div className="space-y-4">
              <button
                onClick={handleMicrosoftLogin}
                disabled={isLoading}
                className={cn(
                  "w-full py-3 px-4 rounded-md font-medium",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors duration-200",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t('signingIn', { ns: 'auth' })}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
                      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                      <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                      <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                    </svg>
                    <span>{t('signInWithMicrosoft', { ns: 'auth' })}</span>
                  </>
                )}
              </button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                {t('useOrgAccount', { ns: 'auth' })}
              </p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
              <p className="text-sm text-muted-foreground">
                {t('azureNotConfigured', { ns: 'auth' })}
              </p>
            </div>
          )}

          {/* Basic Login Form REMOVED - Azure AD Only */}
          <form onSubmit={handleBasicLogin} className="space-y-6 hidden">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 rounded-md border",
                  "bg-background text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "placeholder:text-muted-foreground"
                )}
                placeholder="Enter your username"
                required
                autoFocus={!azureConfigured}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 rounded-md border",
                  "bg-background text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "placeholder:text-muted-foreground"
                )}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-2 px-4 rounded-md font-medium",
                azureConfigured ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : "bg-primary text-primary-foreground hover:bg-primary/90",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors duration-200"
              )}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {!azureConfigured && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              Azure AD not configured. Using basic authentication.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
