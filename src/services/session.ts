import { generateId } from '@/utils/helpers';

interface Session {
  sessionId: string;
  userId: string;
  apiKey?: string;
  webhookUrl?: string;
  expiresAt: string;
  metadata?: Record<string, any>;
}

class SessionManager {
  private static instance: SessionManager;
  private session: Session | null = null;
  private readonly SESSION_KEY = 'ai-chat-session';
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    this.loadSession();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private loadSession(): void {
    try {
      const stored = localStorage.getItem(this.SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored) as Session;
        // Check if session is still valid
        if (new Date(session.expiresAt) > new Date()) {
          this.session = session;
        } else {
          this.clearSession();
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
      this.clearSession();
    }
  }

  private saveSession(): void {
    if (this.session) {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.session));
    }
  }

  createSession(userId?: string, apiKey?: string, webhookUrl?: string): Session {
    this.session = {
      sessionId: `session-${generateId()}`,
      userId: userId || `user-${generateId()}`,
      apiKey,
      webhookUrl,
      expiresAt: new Date(Date.now() + this.SESSION_DURATION).toISOString(),
      metadata: {
        createdAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      },
    };
    this.saveSession();
    return this.session;
  }

  getSession(): Session | null {
    if (!this.session) {
      // Auto-create a new session if none exists
      this.createSession();
    }
    return this.session;
  }

  updateSession(updates: Partial<Session>): void {
    if (this.session) {
      this.session = { ...this.session, ...updates };
      this.saveSession();
    }
  }

  clearSession(): void {
    this.session = null;
    localStorage.removeItem(this.SESSION_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.session?.apiKey;
  }

  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.session) {
      headers['X-Session-ID'] = this.session.sessionId;
      headers['X-User-ID'] = this.session.userId;
      
      if (this.session.apiKey) {
        headers['Authorization'] = `Bearer ${this.session.apiKey}`;
      }
    }

    return headers;
  }

  refreshSession(): void {
    if (this.session) {
      this.session.expiresAt = new Date(Date.now() + this.SESSION_DURATION).toISOString();
      this.saveSession();
    }
  }
}

export const sessionManager = SessionManager.getInstance();