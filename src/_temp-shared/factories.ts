/**
 * Factory functions for singleton services in Module Federation
 * 
 * These factory functions ensure that services are shared as singletons
 * across all MFEs and the shell application in a Module Federation setup.
 * 
 * Angular's providedIn: 'root' creates one instance per Angular application,
 * but in Module Federation, each MFE is a separate Angular app. These
 * factory functions create JavaScript module-level singletons that are
 * shared across ALL applications.
 */

import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { EventBusService } from './event-bus.service';

// Module-level singleton instances
let authServiceInstance: AuthService | null = null;
let eventBusServiceInstance: EventBusService | null = null;

/**
 * Factory function for EventBusService singleton
 * Use this in providers array instead of directly providing EventBusService
 * 
 * @example
 * ```typescript
 * providers: [
 *   { provide: EventBusService, useFactory: getEventBusService }
 * ]
 * ```
 */
export function getEventBusService(): EventBusService {
  if (!eventBusServiceInstance) {
    eventBusServiceInstance = new EventBusService();
  }
  return eventBusServiceInstance;
}

/**
 * Factory function for AuthService singleton
 * Use this in providers array instead of directly providing AuthService
 * 
 * @example
 * ```typescript
 * providers: [
 *   { provide: EventBusService, useFactory: getEventBusService },
 *   { provide: AuthService, useFactory: getAuthService }
 * ]
 * ```
 */
export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    const http = inject(HttpClient);
    const eventBus = getEventBusService(); // Use singleton from factory
    authServiceInstance = new AuthService(http, eventBus);
  }
  return authServiceInstance;
}

/**
 * Configuration interface for Auth0
 */
interface Auth0ConfigOptions {
  domain: string;
  clientId: string;
  audience?: string;
}

// Store Auth0 configuration at module level
let auth0ConfigOptions: Auth0ConfigOptions | null = null;

/**
 * Configure Auth0 settings for the application
 * This should be called once in your app.config.ts before using AuthService
 * 
 * NOTE: In the current temporary implementation, AuthService uses AUTH0_CONFIG
 * directly from config/auth.config.ts. This function is provided for API
 * compatibility with the future @opensourcekd/ng-common-libs package where
 * configuration will be dynamic rather than statically imported.
 * 
 * @example
 * ```typescript
 * configureAuth0({
 *   domain: APP_CONFIG.auth0Domain,
 *   clientId: APP_CONFIG.auth0ClientId,
 *   audience: APP_CONFIG.apiUrl,
 * });
 * ```
 */
export function configureAuth0(options: Auth0ConfigOptions): void {
  auth0ConfigOptions = options;
  // TODO: When migrated to actual package, pass this config to AuthService
}

/**
 * Get the current Auth0 configuration
 * @internal
 */
export function getAuth0Config(): Auth0ConfigOptions | null {
  return auth0ConfigOptions;
}
