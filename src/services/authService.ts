import { PublicClientApplication, AccountInfo, SilentRequest, PopupRequest, InteractionRequiredAuthError } from '@azure/msal-browser';
import { msalConfig, loginRequest, isAzureADConfigured } from '@/config/authConfig';
import { logger } from '@/utils/logger';
import { graphService, UserProfile, Group } from './graphService';
import { sharePointService, SitePermissions } from './sharePointService';

export interface AuthResult {
  success: boolean;
  account?: AccountInfo;
  accessToken?: string;
  method?: 'ssoSilent' | 'popup' | 'cached' | 'fallback';
  error?: string;
}

export interface UserGroup {
  id: string;
  displayName: string;
  description?: string;
  mail?: string;
}

export interface SharePointContext {
  siteId?: string;
  roles: string[];
  permissions?: {
    isAdmin: boolean;
    isMember: boolean;
    isVisitor: boolean;
    canEdit: boolean;
    canView: boolean;
    canManage: boolean;
  };
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  username?: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
  country?: string;
  groups?: UserGroup[];
  sharepoint?: SharePointContext;
}

class AuthService {
  private msalInstance: PublicClientApplication | null = null;
  private currentAccount: AccountInfo | null = null;
  private initialized: boolean = false;

  /**
   * Initialize MSAL instance
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Check if Azure AD is configured
    if (!isAzureADConfigured()) {
      logger.warn('Azure AD not configured - using fallback authentication');
      this.initialized = true;
      return;
    }

    try {
      this.msalInstance = new PublicClientApplication(msalConfig);
      await this.msalInstance.initialize();
      this.initialized = true;
      logger.debug('MSAL initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize MSAL:', error);
      throw error;
    }
  }

  /**
   * Attempt authentication (silent SSO or cached)
   */
  async authenticateUser(): Promise<AuthResult> {
    await this.initialize();

    // If Azure AD not configured, return fallback
    if (!this.msalInstance) {
      return {
        success: false,
        method: 'fallback',
        error: 'Azure AD not configured'
      };
    }

    try {
      // First, try to get cached account
      const accounts = this.msalInstance.getAllAccounts();

      if (accounts.length > 0) {
        this.currentAccount = accounts[0];
        logger.debug('Found cached account:', this.currentAccount.username);

        // Try silent token acquisition
        try {
          const silentRequest: SilentRequest = {
            ...loginRequest,
            account: this.currentAccount,
          };

          const response = await this.msalInstance.acquireTokenSilent(silentRequest);

          return {
            success: true,
            account: response.account,
            accessToken: response.accessToken,
            method: 'cached',
          };
        } catch (silentError) {
          logger.debug('Silent token acquisition failed, will need interactive login');
        }
      }

      // Try SSO silent (for iframe/SharePoint scenarios)
      try {
        const ssoRequest = {
          ...loginRequest,
          loginHint: this.currentAccount?.username,
        };

        const response = await this.msalInstance.ssoSilent(ssoRequest);
        this.currentAccount = response.account;

        return {
          success: true,
          account: response.account,
          accessToken: response.accessToken,
          method: 'ssoSilent',
        };
      } catch (ssoError) {
        logger.debug('SSO silent failed:', ssoError);
      }

      // No cached session and SSO failed
      return {
        success: false,
        error: 'Authentication required',
      };

    } catch (error: any) {
      logger.error('Authentication error:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    }
  }

  /**
   * Interactive login with popup
   */
  async loginWithPopup(): Promise<AuthResult> {
    await this.initialize();

    if (!this.msalInstance) {
      return {
        success: false,
        method: 'fallback',
        error: 'Azure AD not configured'
      };
    }

    try {
      const popupRequest: PopupRequest = {
        ...loginRequest,
        prompt: 'select_account',
      };

      const response = await this.msalInstance.loginPopup(popupRequest);
      this.currentAccount = response.account;

      return {
        success: true,
        account: response.account,
        accessToken: response.accessToken,
        method: 'popup',
      };
    } catch (error: any) {
      logger.error('Popup login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    if (!this.msalInstance) {
      return;
    }

    try {
      const logoutRequest = {
        account: this.currentAccount,
      };

      await this.msalInstance.logoutPopup(logoutRequest);
      this.currentAccount = null;
      logger.debug('Logged out successfully');
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Get current user info with extended profile, groups, and SharePoint context
   */
  async getCurrentUser(): Promise<UserInfo | null> {
    if (!this.currentAccount) {
      return null;
    }

    const basicInfo: UserInfo = {
      id: this.currentAccount.homeAccountId,
      email: this.currentAccount.username,
      name: this.currentAccount.name || this.currentAccount.username,
      username: this.currentAccount.username,
    };

    // Try to get access token for Graph API calls
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        logger.warn('No access token available for extended user info');
        return basicInfo;
      }

      // Initialize Graph and SharePoint services
      if (!graphService.isInitialized()) {
        graphService.initialize(accessToken);
      }
      if (!sharePointService.isInitialized()) {
        sharePointService.initialize(accessToken);
      }

      // Fetch extended profile information
      try {
        const profile = await graphService.getUserProfile();
        basicInfo.jobTitle = profile.jobTitle;
        basicInfo.department = profile.department;
        basicInfo.officeLocation = profile.officeLocation;
        basicInfo.country = profile.country;
        logger.debug('Extended profile fetched');
      } catch (error) {
        logger.warn('Failed to fetch extended profile:', error);
      }

      // Fetch user groups
      try {
        const groups = await graphService.getAllUserGroups();
        basicInfo.groups = groups.map(g => ({
          id: g.id,
          displayName: g.displayName,
          description: g.description,
          mail: g.mail
        }));
        logger.debug(`Fetched ${groups.length} groups`);
      } catch (error) {
        logger.warn('Failed to fetch groups:', error);
      }

      // Fetch SharePoint context if in SharePoint environment
      if (sharePointService.isInSharePointContext()) {
        try {
          const site = await sharePointService.getCurrentSite();
          const roles = await sharePointService.getUserRoles();
          const permissions = await sharePointService.getSitePermissions();

          basicInfo.sharepoint = {
            siteId: site?.id,
            roles: roles,
            permissions: permissions ? {
              isAdmin: permissions.isAdmin,
              isMember: permissions.isMember,
              isVisitor: permissions.isVisitor,
              canEdit: permissions.canEditItems,
              canView: permissions.canViewItems,
              canManage: permissions.canManagePermissions
            } : undefined
          };
          logger.debug('SharePoint context fetched');
        } catch (error) {
          logger.warn('Failed to fetch SharePoint context:', error);
        }
      }

      return basicInfo;
    } catch (error) {
      logger.error('Error fetching extended user info:', error);
      return basicInfo;
    }
  }

  /**
   * Get access token for API calls
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.msalInstance || !this.currentAccount) {
      return null;
    }

    try {
      const silentRequest: SilentRequest = {
        ...loginRequest,
        account: this.currentAccount,
      };

      const response = await this.msalInstance.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        logger.warn('Interaction required for token refresh');
      } else {
        logger.error('Token acquisition error:', error);
      }
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentAccount !== null;
  }
}

export const authService = new AuthService();
