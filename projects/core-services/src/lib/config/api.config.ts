/**
 * API Configuration
 * 
 * This file contains API endpoint configuration.
 * The API base URL is now configured via environment variables.
 */

export interface ApiConfig {
  /**
   * Base URL for the backend API
   * e.g., 'https://5rkqypjiml.execute-api.us-east-1.amazonaws.com'
   */
  baseUrl: string;
}

/**
 * Default API Configuration
 * This object will be mutated at runtime based on environment configuration
 */
const apiConfig: ApiConfig = {
  // Default backend API base URL (can be overridden)
  baseUrl: 'https://tmzuktmjy7.execute-api.us-east-1.amazonaws.com'
};

/**
 * Get the current API configuration
 */
export function getApiConfig(): ApiConfig {
  return apiConfig;
}

/**
 * Update API configuration
 * This allows dynamic configuration at runtime
 * @param config Partial API configuration to update
 */
export function updateApiConfig(config: Partial<ApiConfig>): void {
  // Mutate the existing object to maintain references
  Object.assign(apiConfig, config);
}

/**
 * API Configuration
 * This constant references the mutable apiConfig object
 */
export const API_CONFIG: ApiConfig = apiConfig;
