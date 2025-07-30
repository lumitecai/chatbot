import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sessionManager } from '@/services/session';
import { useToast } from './ToastContext';

interface SessionConfig {
  apiKey?: string;
  webhookUrl?: string;
  customHeaders?: Record<string, string>;
}

interface SessionContextType {
  isAuthenticated: boolean;
  sessionId: string | null;
  userId: string | null;
  configureSession: (config: SessionConfig) => void;
  clearSession: () => void;
  isConfigured: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    const session = sessionManager.getSession();
    if (session) {
      setSessionId(session.sessionId);
      setUserId(session.userId);
      setIsAuthenticated(sessionManager.isAuthenticated());
      setIsConfigured(!!session.apiKey || !!session.webhookUrl);
    }
  }, []);

  const configureSession = useCallback((config: SessionConfig) => {
    try {
      if (config.apiKey || config.webhookUrl) {
        sessionManager.updateSession({
          apiKey: config.apiKey,
          webhookUrl: config.webhookUrl,
        });
        
        setIsAuthenticated(true);
        setIsConfigured(true);
        showToast('Session configured successfully', 'success');
      }
    } catch (error) {
      console.error('Error configuring session:', error);
      showToast('Failed to configure session', 'error');
    }
  }, [showToast]);

  const clearSession = useCallback(() => {
    sessionManager.clearSession();
    setIsAuthenticated(false);
    setSessionId(null);
    setUserId(null);
    setIsConfigured(false);
    showToast('Session cleared', 'info');
  }, [showToast]);

  return (
    <SessionContext.Provider
      value={{
        isAuthenticated,
        sessionId,
        userId,
        configureSession,
        clearSession,
        isConfigured,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}