/**
 * Production Environment Configuration
 */

export const environment = {
  production: true,
  
  /**
   * Auth0 Configuration
   * TODO: Replace with production Auth0 credentials
   * Current values are placeholders using dev configuration
   */
  auth: {
    domain: 'dev-26sow24tone5na8a.us.auth0.com',  // TODO: Use production domain
    clientId: 'EdkPy5co65jESIAT8T9SBy5X4cmeolhl'  // TODO: Use production clientId
  },
  
  /**
   * API Configuration
   * TODO: Replace with production API URL
   */
  api: {
    baseUrl: 'https://tmzuktmjy7.execute-api.us-east-1.amazonaws.com'
  }
};
