/**
 * Environment Configuration
 * This file contains all environment-specific configuration
 * 
 * NOTE: These Auth0 credentials are for development only.
 * In production, these should be:
 * 1. Replaced with production-specific values
 * 2. Injected via environment variables or secure configuration management
 * 3. Never committed to source control
 */

export const environment = {
  production: false,
  
  /**
   * Auth0 Configuration
   * These are development credentials
   */
  auth: {
    domain: 'dev-26sow24tone5na8a.us.auth0.com',
    clientId: 'EdkPy5co65jESIAT8T9SBy5X4cmeolhl'
  },
  
  /**
   * API Configuration
   */
  api: {
    baseUrl: 'https://tmzuktmjy7.execute-api.us-east-1.amazonaws.com'
  }
};
