import { Injectable } from '@angular/core';
import { updateApiConfig } from './api.config';

/**
 * Service to load and apply environment configuration
 * This service initializes API configuration from environment settings
 * 
 * Note: For most use cases, directly calling updateApiConfig() in bootstrap
 * is sufficient. This service is provided for scenarios where dependency
 * injection is preferred.
 */
@Injectable({
  providedIn: 'root'
})
export class EnvironmentLoaderService {
  /**
   * Initialize environment configuration
   * This should be called during app initialization
   * @param environment Environment configuration object
   * @param debug Optional flag to enable debug logging (default: false)
   */
  initializeEnvironment(environment: { apiBaseUrl: string }, debug = false): void {
    // Update API config with environment settings
    updateApiConfig({
      baseUrl: environment.apiBaseUrl
    });
    
    // Log only if debug mode is enabled
    if (debug) {
      console.log('[EnvironmentLoader] API configuration initialized:', environment.apiBaseUrl);
    }
  }
}
