import { Injectable } from '@angular/core';
import { updateApiConfig } from './api.config';

/**
 * Service to load and apply environment configuration
 * This service initializes API configuration from environment settings
 */
@Injectable({
  providedIn: 'root'
})
export class EnvironmentLoaderService {
  /**
   * Initialize environment configuration
   * This should be called during app initialization
   * @param environment Environment configuration object
   */
  initializeEnvironment(environment: { apiBaseUrl: string }): void {
    // Update API config with environment settings
    updateApiConfig({
      baseUrl: environment.apiBaseUrl
    });
    
    console.log('[EnvironmentLoader] API configuration initialized:', environment.apiBaseUrl);
  }
}
