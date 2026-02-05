/*
 * TEMPORARY Public API Surface
 * This folder structure is temporary and will be migrated to either:
 * 1. An external artifact repository (@opensourcekd/ng-common-libs)
 * 2. Integrated directly into the core application
 */

export * from './core-services.service';
export * from './core-services.component';

// Services - Only services used in shell application
export * from './role.service';
export * from './dummy-data.service';
export * from './mfe-loader.service';
export * from './event-bus.service';
export * from './sse-event-from.service';
export * from './sse-event-from.service2';
export * from './user-profile.service';

// Interceptors
export * from './interceptors/auth.interceptor';

// Models
export * from './models/roles.model';
export * from './models/data.model';
export * from './models/mfe.model';

// Config
export * from './config/api.config';
