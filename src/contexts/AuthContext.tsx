import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authService, UserInfo } from '@/services/authService';
import { tokenService } from '@/services/tokenService';
import { isAzureADConfigured } from '@/config/authConfig';
import { logger } from '@/utils/logger';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  isLoading: boolean;
  login: (username?: string, password?: string) => Promise<boolean>;
  loginWithMicrosoft: () => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    setIsLoading(true);

    try {
      // If Azure AD is configured, try silent authentication
      if (isAzureADConfigured()) {
        logger.debug('Checking Azure AD authentication...');
        const result = await authService.authenticateUser();

        if (result.success && result.account) {
          setIsAuthenticated(true);

          // Store token first
          if (result.accessToken) {
            tokenService.setAccessToken(result.accessToken);
          }

          // Fetch extended user info (async with groups, profile, SharePoint context)
          const userInfo = await authService.getCurrentUser();
          if (userInfo) {
            setUser(userInfo);
            // Store in sessionStorage instead of localStorage for better security
            sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
            logger.debug('User authenticated with extended info:', userInfo.email);
          }
        }
        // No fallback authentication - Azure AD only
      }
    } catch (error) {
      logger.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithMicrosoft = async (): Promise<boolean> => {
    if (!isAzureADConfigured()) {
      logger.warn('Azure AD not configured');
      return false;
    }

    try {
      const result = await authService.loginWithPopup();

      if (result.success && result.account) {
        setIsAuthenticated(true);

        // Store token first
        if (result.accessToken) {
          tokenService.setAccessToken(result.accessToken);
        }

        // Fetch extended user info (async with groups, profile, SharePoint context)
        const userInfo = await authService.getCurrentUser();
        if (userInfo) {
          setUser(userInfo);
          // Store in sessionStorage instead of localStorage for better security
          sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
          logger.info('Microsoft login successful with extended info:', userInfo.email);
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.error('Microsoft login error:', error);
      return false;
    }
  };

  const login = async (username?: string, password?: string): Promise<boolean> => {
    // Fallback authentication DISABLED - Azure AD only
    // Only allow Microsoft login when Azure AD is configured
    if (isAzureADConfigured()) {
      return await loginWithMicrosoft();
    }

    // No fallback - require Azure AD SSO
    logger.warn('Azure AD not configured - cannot login');
    return false;
  };

  const logout = async (): Promise<void> => {
    try {
      if (isAzureADConfigured() && authService.isAuthenticated()) {
        await authService.logout();
      }

      setIsAuthenticated(false);
      setUser(null);
      tokenService.clearAccessToken();
      localStorage.removeItem('isAuthenticated');
      // Clear sessionStorage instead of localStorage
      sessionStorage.removeItem('userInfo');
      logger.info('Logged out successfully');
    } catch (error) {
      logger.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        login,
        loginWithMicrosoft,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
