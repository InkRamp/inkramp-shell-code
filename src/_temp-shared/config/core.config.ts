/**
 * Framework-agnostic core configuration
 * 
 * This module provides centralized configuration that can be used across
 * any framework (Angular, React, Vue, vanilla JS) and in MFEs.
 * 
 * The configuration values are designed to be statically configured
 * during build time from environment variables or repository settings.
 */

import { API_CONFIG } from './api.config';
import { AUTH0_CONFIG } from './auth.config';

/**
 * Application configuration interface
 */
export interface AppConfig {
  /**
   * Base URL for the backend API
   */
  apiUrl: string;
  
  /**
   * Auth0 domain
   */
  auth0Domain: string;
  
  /**
   * Auth0 client ID
   */
  auth0ClientId: string;
  
  /**
   * Auth0 redirect URI
   */
  redirectUri?: string;
  
  /**
   * Auth0 logout URI
   */
  logoutUri?: string;
}

/**
 * Centralized application configuration
 * 
 * This configuration combines API and Auth0 settings into a single
 * object that can be used across the entire application.
 * 
 * @example
 * ```typescript
 * // Import from /core for framework-agnostic usage
 * import { APP_CONFIG } from '@opensourcekd/ng-common-libs/core';
 * 
 * console.log(APP_CONFIG.apiUrl);
 * console.log(APP_CONFIG.auth0Domain);
 * ```
 */
export const APP_CONFIG: AppConfig = {
  apiUrl: API_CONFIG.baseUrl,
  auth0Domain: AUTH0_CONFIG.domain,
  auth0ClientId: AUTH0_CONFIG.clientId,
  redirectUri: AUTH0_CONFIG.redirectUri,
  logoutUri: AUTH0_CONFIG.logoutUri,
};
