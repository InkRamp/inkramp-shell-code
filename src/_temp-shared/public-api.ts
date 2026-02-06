/*
 * TEMPORARY Public API Surface
 * This folder structure is temporary and will be migrated to either:
 * 1. An external artifact repository (@opensourcekd/ng-common-libs)
 * 2. Integrated directly into the core application
 */

// Services - Only services used in shell application
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
