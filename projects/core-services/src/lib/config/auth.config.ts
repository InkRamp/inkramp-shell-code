/**
 * Centralized Authentication Configuration
 * 
 * This file contains all authentication-related configuration for Auth0.
 * Update these values to match your Auth0 tenant configuration.
 * 
 * To configure:
 * 1. Create an Auth0 application (SPA type)
 * 2. Update the domain, clientId, and redirectUri below
 * 3. Configure Allowed Callback URLs in Auth0 dashboard
 * 4. Configure Allowed Logout URLs in Auth0 dashboard
 * 5. Configure Allowed Web Origins in Auth0 dashboard
 */

export interface Auth0Config {
  /**
   * Your Auth0 domain (e.g., 'your-tenant.us.auth0.com')
   * Find this in your Auth0 Application Settings
   */
  domain: string;

  /**
   * Your Auth0 application client ID
   * Find this in your Auth0 Application Settings
   */
  clientId: string;

  /**
   * The URL where Auth0 will redirect after authentication
   * Must be registered in Auth0 Application's "Allowed Callback URLs"
   */
  redirectUri: string;

  /**
   * The URL where Auth0 will redirect after logout
   * Must be registered in Auth0 Application's "Allowed Logout URLs"
   */
  logoutUri: string;

  /**
   * OAuth2 scopes to request
   * Common scopes: openid, profile, email
   * Add custom scopes as needed for your API
   */
  scope: string;

  /**
   * Optional: Your Auth0 API identifier/audience
   * Required if you want to call your own API with access tokens
   */
  audience?: string;

  /**
   * Optional: Custom connection name
   * Use if you want to force a specific connection (e.g., 'Username-Password-Authentication')
   */
  connection?: string;
}

/**
 * Auth0 Configuration
 * 
 * IMPORTANT: Update these values to match your Auth0 tenant
 * 
 * For local development:
 * - redirectUri: 'http://localhost:4200/auth-callback'
 * - logoutUri: 'http://localhost:4200'
 * 
 * For production:
 * - redirectUri: 'https://yourdomain.com/auth-callback'
 * - logoutUri: 'https://yourdomain.com'
 */
export const AUTH0_CONFIG: Auth0Config = {
  // Auth0 domain
  domain: 'dev-26sow24tone5na8a.us.auth0.com',
  
  // Auth0 client ID
  clientId: 'EdkPy5co65jESIAT8T9SBy5X4cmeolhl', // -> KD03_Single_Page_Web_App //'EsWeimwqRJu41QHEOADsAoFjhdsDrwPK',
  
  // Callback URL after authentication
  redirectUri: 'https://opensourcekd.github.io/i17e/auth-callback',
  
  // Logout redirect URL
  logoutUri: 'https://opensourcekd.github.io/i17e',
  
  // OpenID Connect scopes
  scope: 'openid profile email',
  
  // API audience for access tokens
  audience: 'https://something',
  
  // Optional: Force a specific connection
  // connection: 'Username-Password-Authentication'
};

/**
 * Storage Configuration
 * Define which storage mechanism to use for different types of data
 */
export const STORAGE_CONFIG = {
  /**
   * Storage for authentication tokens
   * Using sessionStorage for better security (cleared when browser/tab closes)
   */
  TOKEN_STORAGE: 'sessionStorage' as 'sessionStorage' | 'localStorage',
  
  /**
   * Storage for user info
   * Using sessionStorage for sensitive user data
   */
  USER_INFO_STORAGE: 'sessionStorage' as 'sessionStorage' | 'localStorage',
  
  /**
   * Storage for auth state (PKCE verifier, state parameter)
   * Using sessionStorage for OAuth2 flow security
   */
  AUTH_STATE_STORAGE: 'sessionStorage' as 'sessionStorage' | 'localStorage',
  
  /**
   * Storage for non-sensitive preferences
   * Using localStorage for persistence across sessions
   */
  PREFERENCES_STORAGE: 'localStorage' as 'sessionStorage' | 'localStorage',
} as const;

/**
 * Storage Keys
 * Centralized definition of all storage keys used in the application
 */
export const STORAGE_KEYS = {
  // Auth0 tokens and state
  ACCESS_TOKEN: 'auth0_access_token',
  ID_TOKEN: 'auth0_id_token',
  REFRESH_TOKEN: 'auth0_refresh_token',
  USER_INFO: 'auth0_user_info',
  OAUTH_STATE: 'oauth_state',
  CODE_VERIFIER: 'code_verifier',
  
  // User session
  CURRENT_USER: 'current_user',
  
  // Dev/Debug
  DEV_MIMIC_USER: 'dev_mimic_user', // localStorage only
} as const;

/**
 * Helper function to get the appropriate storage object
 */
export function getStorage(storageType: 'sessionStorage' | 'localStorage'): Storage {
  return storageType === 'sessionStorage' ? sessionStorage : localStorage;
}

/**
 * Helper function to set item in the appropriate storage
 */
export function setStorageItem(key: string, value: string, storageType: 'sessionStorage' | 'localStorage' = 'sessionStorage'): void {
  getStorage(storageType).setItem(key, value);
}

/**
 * Helper function to get item from the appropriate storage
 */
export function getStorageItem(key: string, storageType: 'sessionStorage' | 'localStorage' = 'sessionStorage'): string | null {
  return getStorage(storageType).getItem(key);
}

/**
 * Helper function to remove item from the appropriate storage
 */
export function removeStorageItem(key: string, storageType: 'sessionStorage' | 'localStorage' = 'sessionStorage'): void {
  getStorage(storageType).removeItem(key);
}
