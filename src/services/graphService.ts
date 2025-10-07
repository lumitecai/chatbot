import { Client } from "@microsoft/microsoft-graph-client";
import { logger } from "@/utils/logger";

export interface UserProfile {
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
  country?: string;
  id: string;
}

export interface Group {
  id: string;
  displayName: string;
  description?: string;
  mail?: string;
}

class GraphService {
  private graphClient: Client | null = null;

  initialize(accessToken: string): void {
    this.graphClient = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
    logger.debug('Graph service initialized');
  }

  async getUserProfile(): Promise<UserProfile> {
    if (!this.graphClient) {
      throw new Error("Graph client not initialized");
    }

    try {
      const user = await this.graphClient
        .api("/me")
        .select("displayName,mail,userPrincipalName,jobTitle,department,officeLocation,country,id")
        .get();

      logger.debug('User profile fetched:', user.displayName);
      return user;
    } catch (error) {
      logger.error("Error fetching user profile:", error);
      throw error;
    }
  }

  async getUserGroups(): Promise<Group[]> {
    if (!this.graphClient) {
      throw new Error("Graph client not initialized");
    }

    try {
      const response = await this.graphClient
        .api("/me/transitiveMemberOf/microsoft.graph.group")
        .select("id,displayName,description,mail,groupTypes")
        .top(100)
        .get();

      // Filter for Microsoft 365 groups (Unified groups)
      const groups = response.value || [];
      const m365Groups = groups.filter((group: any) =>
        group.groupTypes && group.groupTypes.includes('Unified')
      );

      logger.debug(`Found ${m365Groups.length} Microsoft 365 groups`);
      return m365Groups;
    } catch (error) {
      logger.error("Error fetching user groups:", error);
      // Return empty array instead of throwing to allow app to continue
      return [];
    }
  }

  async getAllUserGroups(): Promise<Group[]> {
    if (!this.graphClient) {
      throw new Error("Graph client not initialized");
    }

    try {
      const response = await this.graphClient
        .api("/me/memberOf")
        .select("id,displayName,description,mail")
        .top(100)
        .get();

      const groups = response.value || [];
      logger.debug(`Found ${groups.length} total groups (including security groups)`);
      return groups;
    } catch (error) {
      logger.error("Error fetching all user groups:", error);
      // Return empty array instead of throwing to allow app to continue
      return [];
    }
  }

  async getUserPhoto(): Promise<string | null> {
    if (!this.graphClient) {
      throw new Error("Graph client not initialized");
    }

    try {
      const photo = await this.graphClient
        .api("/me/photo/$value")
        .get();

      const blob = new Blob([photo], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      logger.debug('User photo retrieved');
      return url;
    } catch (error) {
      logger.debug("User photo not available");
      return null;
    }
  }

  isInitialized(): boolean {
    return this.graphClient !== null;
  }
}

export const graphService = new GraphService();
