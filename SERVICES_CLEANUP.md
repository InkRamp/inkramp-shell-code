# Services Cleanup - Integration with @opensourcekd/ng-common-libs

**Date**: 2026-02-09  
**Branch**: copilot/remove-unwanted-services  
**Status**: ✅ Complete

## Summary

This cleanup removes redundant services from `src/_temp-shared/` and integrates with the `@opensourcekd/ng-common-libs` package for authentication and event bus functionality. The goal is to focus on debugging MFE integration with minimal services.

## Changes Made

### 1. Removed Services (6 files)

These services are now provided by `@opensourcekd/ng-common-libs`:

| Service | Reason | Replacement |
|---------|--------|-------------|
| `auth.service.ts` | OAuth2/OIDC authentication with Auth0 | `AuthService` from library |
| `event-bus.service.ts` | Cross-MFE communication using mitt | `EventBusService` from library |
| `sse-event-from.service.ts` | Server-Sent Events (not needed for MFE debug) | N/A - Removed |
| `sse-event-from.service2.ts` | Server-Sent Events duplicate (not needed) | N/A - Removed |
| `core-services.service.ts` | Empty placeholder | N/A - Removed |
| `core-services.component.ts` | Empty placeholder | N/A - Removed |

### 2. Kept Services (4 files)

Essential services for MFE debugging:

| Service | Purpose |
|---------|---------|
| `role.service.ts` | User role management and permissions mapping |
| `mfe-loader.service.ts` | Dynamic MFE loading with priority |
| `dummy-data.service.ts` | Mock data for development/testing |
| `user-profile.service.ts` | User profile from backend /auth/me API |

### 3. Configuration Updates

#### Module Federation Singleton Providers

Added in `bootstrap.ts` and removed from `app.config.ts` to avoid duplication:

```typescript
import { 
  AuthService, 
  EventBusService, 
  getAuthService, 
  getEventBusService,
  configureAuth0,
  APP_CONFIG
} from '@opensourcekd/ng-common-libs';

// Configure Auth0 (done once in bootstrap.ts)
configureAuth0({
  domain: APP_CONFIG.auth0Domain,
  clientId: APP_CONFIG.auth0ClientId,
  audience: APP_CONFIG.apiUrl,
});

// Providers
providers: [
  { provide: EventBusService, useFactory: getEventBusService },
  { provide: AuthService, useFactory: getAuthService }
]
```

**Why factory functions?**  
In Module Federation, each MFE is a separate Angular application. Using `providedIn: 'root'` would create one instance per app. Factory functions create a JavaScript module-level singleton shared across ALL applications (shell + MFEs).

### 4. Import Updates

All imports updated across the codebase:

#### Before:
```typescript
import { AuthService, EventBusService } from '@org/core-services';
```

#### After:
```typescript
import { AuthService, EventBusService } from '@opensourcekd/ng-common-libs';
```

Files updated:
- `src/app/app.component.ts`
- `src/app/app.component.spec.ts`
- `src/app/app.config.ts`
- `src/app/auth-callback/auth-callback.component.ts`
- `src/app/components/header/header.component.ts`
- `src/bootstrap.ts`
- `src/_temp-shared/role.service.ts`
- `src/_temp-shared/interceptors/auth.interceptor.ts`

### 5. Public API Updates

Updated `src/_temp-shared/public-api.ts` to:
- Remove exports for deleted services
- Add re-export of `UserInfo` type from library for backward compatibility
- Document library integration

```typescript
// Re-export types from library for convenience
export type { UserInfo } from '@opensourcekd/ng-common-libs';

// Services - Only services needed for MFE debugging
export * from './role.service';
export * from './dummy-data.service';
export * from './mfe-loader.service';
export * from './user-profile.service';
```

## Remaining Structure

```
src/_temp-shared/
├── config/
│   ├── api.config.ts
│   └── auth.config.ts
├── interceptors/
│   └── auth.interceptor.ts
├── models/
│   ├── data.model.ts
│   ├── mfe.model.ts
│   └── roles.model.ts
├── dummy-data.service.ts
├── mfe-loader.service.ts
├── public-api.ts
├── role.service.ts
└── user-profile.service.ts
```

## Validation

✅ **Build Status**: All builds pass successfully  
✅ **Security Scan**: CodeQL found 0 alerts  
✅ **Code Review**: All feedback addressed  

## Benefits

1. **Reduced Code Duplication**: AuthService and EventBusService now maintained in one place
2. **Better Module Federation**: Proper singleton pattern ensures single instance across MFEs
3. **Cleaner Codebase**: Removed 6 unnecessary files (600+ lines of code)
4. **Improved Maintainability**: Library updates automatically benefit all consumers
5. **Focus on MFE Debugging**: Kept only essential services for debugging

## Next Steps

The remaining services in `src/_temp-shared/` are temporary and will eventually be:
1. Migrated to `@opensourcekd/ng-common-libs` (for reusable services)
2. Integrated into `src/app` (for application-specific services)

## References

- Library Documentation: [ng-common-libs README](node_modules/@opensourcekd/ng-common-libs/README.md)
- Module Federation: See `.github/docs/ARCHITECTURE.md`
- Previous Migration: See `MIGRATION_TEMP_SHARED.md`
