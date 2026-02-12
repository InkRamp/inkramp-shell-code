/**
 * Environment Configuration
 * This file contains all environment-specific configuration
 */

export const environment = {
  production: false,
  
  /**
   * Auth0 Configuration
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
