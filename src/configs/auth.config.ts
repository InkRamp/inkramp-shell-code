/**
 * Centralized Authentication Configuration
 * 
 * This file contains all authentication-related configuration for Auth0.
 * These values are used to configure the @opensourcekd/ng-common-libs AuthService.
 */

export interface Auth0Config {
  /**
   * Your Auth0 domain (e.g., 'your-tenant.us.auth0.com')
   */
  domain: string;

  /**
   * Your Auth0 application client ID
   */
  clientId: string;

  /**
   * The URL where Auth0 will redirect after authentication
   */
  redirectUri: string;

  /**
   * The URL where Auth0 will redirect after logout
   */
  logoutUri: string;

  /**
   * OAuth2 scopes to request
   */
  scope: string;

  /**
   * Optional: Your Auth0 API identifier/audience
   */
  audience?: string;

  /**
   * Optional: Custom connection name
   */
  connection?: string;
}

/**
 * Auth0 Configuration
 * 
 * IMPORTANT: Update these values to match your Auth0 tenant
 */
export const AUTH0_CONFIG: Auth0Config = {
  // Auth0 domain
  domain: 'dev-26sow24tone5na8a.us.auth0.com',
  
  // Auth0 client ID
  clientId: 'EdkPy5co65jESIAT8T9SBy5X4cmeolhl',
  
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
