/*
 * DUMMY PLACEHOLDER API
 * All real implementations have been moved to @opensourcekd/ng-common-libs
 * This file only contains minimal dummy placeholders for reference
 */

// Dummy placeholders - DO NOT USE
export * from './core-services.service';
export * from './models/data.model';

// Re-export everything from the opensourcekd library
// Use these imports instead of local implementations
export { EventBus, AuthService, APP_CONFIG } from '@opensourcekd/ng-common-libs';
export type { UserInfo, UserData } from '@opensourcekd/ng-common-libs';

