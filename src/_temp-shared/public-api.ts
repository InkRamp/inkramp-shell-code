/*
 * TEMPORARY Public API Surface
 * This folder structure is temporary and will be migrated to either:
 * 1. An external artifact repository (@opensourcekd/ng-common-libs)
 * 2. Integrated directly into the core application
 * 
 * NOTE: Services available from @opensourcekd/ng-common-libs package:
 * - AuthService - Authentication with Auth0
 * - EventBusService - Cross-application event communication
 * Import these services directly from '@opensourcekd/ng-common-libs' instead of this file.
 */

// Services - Only services used in shell application
export * from './role.service';
export * from './mfe-loader.service';

// Interceptors
export * from './interceptors/auth.interceptor';

// Models
export * from './models/roles.model';
export * from './models/data.model';
export * from './models/mfe.model';

// Config
export * from './config/api.config';
