/*
 * Public API Surface of core-services
 */

export * from './lib/core-services.service';
export * from './lib/auth.service';
export * from './lib/core-services.component';

// Services - Only exporting services directly used in shell application
export * from './lib/role.service';
// export * from './lib/sales-data.service';  // Not directly used in shell
export * from './lib/dummy-data.service';  // Used in header for sales executives
export * from './lib/mfe-loader.service';  // Used for MFE loading
export * from './lib/event-bus.service';
export * from './lib/sse-event-from.service';  // Used in delete-later/lazyload
export * from './lib/sse-event-from.service2';  // Used in delete-later/lazyload
// export * from './lib/cache-api.service';  // Not directly used in shell
// export * from './lib/brand-context.service';  // Not directly used in shell

// API Services - Not directly used in shell application
// export * from './lib/incentive-rules-api.service';
// export * from './lib/incentives-api.service';
// export * from './lib/targets-api.service';
// export * from './lib/tasks-api.service';

// Interceptors
export * from './lib/interceptors/auth.interceptor';
// Cache interceptor not needed if cache-api.service is not used
// Note: Check if cache interceptor is registered in app.config

// Models
export * from './lib/models/roles.model';
export * from './lib/models/data.model';
export * from './lib/models/mfe.model';
// export * from './lib/models/api.model';  // Not needed if API services not used

// Config
// export * from './lib/config/api.config';  // Not needed if API services not used
export * from './lib/config/auth.config';
