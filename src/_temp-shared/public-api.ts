/*
 * TEMPORARY Public API Surface
 * This folder structure is temporary and will be migrated to either:
 * 1. An external artifact repository (@opensourcekd/ng-common-libs)
 * 2. Integrated directly into the core application
 * 
 * NOTE: AuthService and EventBusService are now imported from @opensourcekd/ng-common-libs
 * The remaining services here are kept for MFE debugging and will be cleaned up later.
 */

// Re-export types from library for convenience
export type { UserInfo } from '@opensourcekd/ng-common-libs';

// Services - Only services needed for MFE debugging
export * from './role.service';
export * from './dummy-data.service';
export * from './mfe-loader.service';
export * from './user-profile.service';

// Interceptors
export * from './interceptors/auth.interceptor';

// Models
export * from './models/roles.model';
export * from './models/data.model';
export * from './models/mfe.model';

// Config
export * from './config/auth.config';
export * from './config/api.config';
