/**
 * Token service for managing Azure AD access tokens
 */

const TOKEN_KEY = 'msal_access_token';
const TOKEN_EXPIRY_KEY = 'msal_token_expiry';

class TokenService {
  /**
   * Store access token in session storage
   */
  setAccessToken(token: string, expiresIn: number = 3600): void {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      const expiryTime = Date.now() + (expiresIn * 1000);
      sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
      console.warn('Failed to store access token:', error);
    }
  }

  /**
   * Get access token from session storage
   */
  getAccessToken(): string | null {
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);

      if (!token || !expiry) {
        return null;
      }

      // Check if token is expired
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() >= expiryTime) {
        this.clearAccessToken();
        return null;
      }

      return token;
    } catch (error) {
      console.warn('Failed to retrieve access token:', error);
      return null;
    }
  }

  /**
   * Clear access token from storage
   */
  clearAccessToken(): void {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.warn('Failed to clear access token:', error);
    }
  }

  /**
   * Check if token is expired or about to expire (within 5 minutes)
   */
  isTokenExpired(): boolean {
    try {
      const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!expiry) {
        return true;
      }

      const expiryTime = parseInt(expiry, 10);
      const bufferTime = 5 * 60 * 1000; // 5 minutes
      return Date.now() >= (expiryTime - bufferTime);
    } catch (error) {
      return true;
    }
  }
}

export const tokenService = new TokenService();
