import { Client } from "@microsoft/microsoft-graph-client";
import { logger } from "@/utils/logger";

export interface SharePointSite {
  id: string;
  name: string;
  displayName: string;
  webUrl: string;
  description?: string;
  createdDateTime: string;
  lastModifiedDateTime?: string;
}

export interface SharePointPermission {
  id: string;
  roles: string[];
  grantedToV2?: {
    user?: {
      displayName: string;
      email: string;
    };
    siteUser?: {
      displayName: string;
      loginName: string;
    };
  };
}

export interface SitePermissions {
  canAddItems: boolean;
  canAddListItems: boolean;
  canApproveItems: boolean;
  canCreateAlerts: boolean;
  canDeleteItems: boolean;
  canDeleteListItems: boolean;
  canEditItems: boolean;
  canEditListItems: boolean;
  canManageLists: boolean;
  canManagePermissions: boolean;
  canViewItems: boolean;
  canViewListItems: boolean;
  canViewPages: boolean;
  isAdmin: boolean;
  isMember: boolean;
  isVisitor: boolean;
}

class SharePointService {
  private graphClient: Client | null = null;
  private siteId: string | null = null;

  initialize(accessToken: string): void {
    this.graphClient = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    // Try to extract site ID from URL if in SharePoint context
    this.extractSiteIdFromUrl();
    logger.debug('SharePoint service initialized');
  }

  private extractSiteIdFromUrl(): void {
    // Try to get SharePoint site URL from parent frame or current URL
    const url = window.location.href;

    // Common SharePoint URL patterns
    const patterns = [
      /https:\/\/([^.]+)\.sharepoint\.com\/sites\/([^/]+)/,
      /https:\/\/([^.]+)\.sharepoint-df\.com\/sites\/([^/]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const tenant = match[1];
        const siteName = match[2];
        this.siteId = `${tenant}.sharepoint.com:/sites/${siteName}`;
        logger.info(`Detected SharePoint site: ${tenant}/sites/${siteName}`);
        return;
      }
    }

    // Check if we're in an iframe (likely SharePoint embed)
    if (window.self !== window.top) {
      logger.info('Running in iframe - likely SharePoint context');
    }
  }

  async getCurrentSite(): Promise<SharePointSite | null> {
    if (!this.graphClient) {
      throw new Error("Graph client not initialized");
    }

    try {
      // If we have a site ID from URL, use it
      if (this.siteId) {
        const site = await this.graphClient
          .api(`/sites/${this.siteId}`)
          .select("id,name,displayName,webUrl,description,createdDateTime,lastModifiedDateTime")
          .get();
        logger.debug('SharePoint site retrieved:', site.displayName);
        return site;
      }

      // Otherwise, try to get root site
      const rootSite = await this.graphClient
        .api("/sites/root")
        .select("id,name,displayName,webUrl,description,createdDateTime,lastModifiedDateTime")
        .get();

      logger.debug('SharePoint root site retrieved');
      return rootSite;
    } catch (error) {
      logger.warn("Error fetching current site:", error);
      return null;
    }
  }

  async getSitePermissions(): Promise<SitePermissions | null> {
    if (!this.graphClient) {
      throw new Error("Graph client not initialized");
    }

    try {
      // Get current user info first
      const currentUser = await this.graphClient
        .api('/me')
        .select('id,userPrincipalName,mail')
        .get();

      // Try to get permissions for the current site
      const siteId = this.siteId || "root";
      const permissions = await this.graphClient
        .api(`/sites/${siteId}/permissions`)
        .get();

      // Parse permissions to determine user's role
      const userPermissions: SitePermissions = {
        canAddItems: false,
        canAddListItems: false,
        canApproveItems: false,
        canCreateAlerts: false,
        canDeleteItems: false,
        canDeleteListItems: false,
        canEditItems: false,
        canEditListItems: false,
        canManageLists: false,
        canManagePermissions: false,
        canViewItems: true, // Default to view
        canViewListItems: true,
        canViewPages: true,
        isAdmin: false,
        isMember: false,
        isVisitor: true // Default to visitor
      };

      // Check roles from permissions response - ONLY for current user
      if (permissions && permissions.value) {
        for (const permission of permissions.value) {
          // Check if this permission is granted to the current user
          const isCurrentUserPermission =
            permission.grantedToV2?.user?.id === currentUser.id ||
            permission.grantedToV2?.user?.email === currentUser.mail ||
            permission.grantedToV2?.user?.email === currentUser.userPrincipalName ||
            permission.grantedTo?.user?.id === currentUser.id ||
            permission.grantedTo?.user?.email === currentUser.mail;

          // Only apply permissions if they belong to the current user
          if (isCurrentUserPermission && permission.roles) {
            if (permission.roles.includes("owner")) {
              userPermissions.isAdmin = true;
              userPermissions.canManagePermissions = true;
              userPermissions.canManageLists = true;
              userPermissions.canEditItems = true;
              userPermissions.canAddItems = true;
              userPermissions.canDeleteItems = true;
            }
            if (permission.roles.includes("write")) {
              userPermissions.isMember = true;
              userPermissions.canEditItems = true;
              userPermissions.canAddItems = true;
              userPermissions.canDeleteItems = true;
              userPermissions.canEditListItems = true;
              userPermissions.canAddListItems = true;
              userPermissions.canDeleteListItems = true;
            }
            if (permission.roles.includes("read")) {
              userPermissions.isVisitor = true;
              userPermissions.canViewItems = true;
              userPermissions.canViewListItems = true;
              userPermissions.canViewPages = true;
            }
          }
        }
      }

      logger.debug('Site permissions retrieved:', {
        isAdmin: userPermissions.isAdmin,
        isMember: userPermissions.isMember,
        isVisitor: userPermissions.isVisitor
      });

      return userPermissions;
    } catch (error) {
      logger.warn("Error fetching site permissions:", error);
      return null;
    }
  }

  async getUserRoles(): Promise<string[]> {
    const permissions = await this.getSitePermissions();
    if (!permissions) {
      return [];
    }

    const roles: string[] = [];
    if (permissions.isAdmin) roles.push('owner');
    if (permissions.isMember) roles.push('member');
    if (permissions.isVisitor) roles.push('visitor');

    return roles;
  }

  setSiteId(siteId: string): void {
    this.siteId = siteId;
    logger.debug('Site ID set:', siteId);
  }

  getSiteIdFromUrl(url: string): string | null {
    // Extract site ID from SharePoint URL
    const patterns = [
      /https:\/\/([^.]+)\.sharepoint\.com\/sites\/([^/]+)/,
      /https:\/\/([^.]+)\.sharepoint-df\.com\/sites\/([^/]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return `${match[1]}.sharepoint.com:/sites/${match[2]}`;
      }
    }

    return null;
  }

  isInSharePointContext(): boolean {
    return this.siteId !== null || window.self !== window.top;
  }

  isInitialized(): boolean {
    return this.graphClient !== null;
  }
}

export const sharePointService = new SharePointService();
