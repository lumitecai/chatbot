import { Configuration, LogLevel, BrowserCacheLocation } from "@azure/msal-browser";

// Detect browser for cache location strategy
const detectBrowserCacheLocation = (): BrowserCacheLocation => {
  const userAgent = navigator.userAgent.toLowerCase();

  // Use memory storage for browsers with strict third-party cookie policies
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return BrowserCacheLocation.MemoryStorage;
  } else if (userAgent.includes('firefox')) {
    return BrowserCacheLocation.MemoryStorage;
  }

  // Use session storage for Chrome/Edge
  return BrowserCacheLocation.SessionStorage;
};

// Get configuration from environment variables
const clientId = process.env.REACT_APP_AZURE_CLIENT_ID || "";
const tenantId = process.env.REACT_APP_AZURE_TENANT_ID || "";
const redirectUri = process.env.REACT_APP_REDIRECT_URI || window.location.origin;

// Validate required configuration
if (!clientId || !tenantId) {
  console.warn(
    '⚠️ Azure AD not configured! Please set REACT_APP_AZURE_CLIENT_ID and REACT_APP_AZURE_TENANT_ID in your .env file.\n' +
    'Falling back to development mode with basic authentication.'
  );
}

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId || "development-mode",
    authority: tenantId ? `https://login.microsoftonline.com/${tenantId}` : undefined,
    redirectUri: redirectUri,
    postLogoutRedirectUri: redirectUri,
    navigateToLoginRequestUrl: false, // Prevent navigation issues in iframe
  },
  cache: {
    cacheLocation: detectBrowserCacheLocation(),
    storeAuthStateInCookie: true, // Enable for better cross-browser support
    secureCookies: window.location.protocol === 'https:',
  },
  system: {
    windowHashTimeout: 60000, // Increase timeout for slower connections
    iframeHashTimeout: 10000,
    loadFrameTimeout: 10000,
    asyncPopups: true, // Better popup handling
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error('[MSAL]', message);
            return;
          case LogLevel.Info:
            console.info('[MSAL]', message);
            return;
          case LogLevel.Verbose:
            console.debug('[MSAL]', message);
            return;
          case LogLevel.Warning:
            console.warn('[MSAL]', message);
            return;
          default:
            return;
        }
      },
      logLevel: LogLevel.Warning, // Adjust for debugging: LogLevel.Verbose
    }
  }
};

export const loginRequest = {
  scopes: [
    "User.Read",
    "openid",
    "profile",
    "email",
    "Group.Read.All",           // Read all groups user is member of
    "Sites.Read.All",           // Read SharePoint sites and permissions
    "User.ReadBasic.All"        // Read basic profile info
  ]
};

export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphPhotoEndpoint: "https://graph.microsoft.com/v1.0/me/photo/$value",
};

// Check if Azure AD is configured
export const isAzureADConfigured = (): boolean => {
  return !!(clientId && tenantId && clientId !== "development-mode");
};
