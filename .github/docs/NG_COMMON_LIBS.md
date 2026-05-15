# @opensourcekd/ng-common-libs - Knowledge Base

## What is @opensourcekd/ng-common-libs?

`@opensourcekd/ng-common-libs` is the planned external package name for shared Angular services and utilities that will be extracted from this repository and published to an artifact repository (npm or private registry).

## Current Status

**🚧 In Transition**: Currently mapped to `src/_temp-shared/` folder structure as an interim solution while deciding what goes into the package vs. what stays in the core application.

## Package Structure (Planned)

```
@opensourcekd/ng-common-libs/
├── auth/
│   ├── auth.service.ts           # Auth0 authentication service
│   └── auth.interceptor.ts       # HTTP authentication interceptor
├── rbac/
│   └── role.service.ts           # Role-Based Access Control
├── mfe/
│   ├── event-bus.service.ts      # Cross-MFE communication (mitt-based)
│   └── mfe-loader.service.ts     # Dynamic MFE loading
├── models/
│   ├── user.model.ts
│   ├── role.model.ts
│   └── mfe.model.ts
└── config/
    ├── auth.config.ts
    └── api.config.ts
```

## Import Patterns

### Current (Temporary)
```typescript
// Both of these work right now and point to src/_temp-shared/
import { AuthService, RoleService } from '@org/core-services';
import { AuthService, RoleService } from '@opensourcekd/ng-common-libs';
```

### Future (After Package Publication)
```typescript
// Package will be installed via npm/private registry
import { AuthService } from '@opensourcekd/ng-common-libs/auth';
import { RoleService } from '@opensourcekd/ng-common-libs/rbac';
import { EventBusService } from '@opensourcekd/ng-common-libs/mfe';
```

## Key Services to be Included

### 1. AuthService
- **Purpose**: OAuth2/OIDC authentication via Auth0
- **Storage**: sessionStorage (NOT localStorage)
- **Features**: login, logout, token refresh, session management
- **Reusability**: High - needed in all InkRamp Angular applications

### 2. RoleService
- **Purpose**: Role-Based Access Control (RBAC)
- **Features**: Permission checking, role hierarchy, feature visibility
- **Reusability**: High - standard RBAC pattern

### 3. EventBusService
- **Purpose**: Cross-application or cross-MFE communication
- **Implementation**: mitt event emitter
- **Reusability**: High - useful for any event-driven architecture

### 4. MfeLoaderService
- **Purpose**: Dynamic loading of micro-frontends
- **Features**: Module Federation runtime loading
- **Reusability**: High - needed for all MFE host applications

## Migration Decision Criteria

### Goes to @opensourcekd/ng-common-libs if:
- ✅ Used across multiple projects
- ✅ General-purpose functionality
- ✅ Minimal project-specific dependencies
- ✅ Stable API that won't change frequently
- ✅ Well-tested and documented

### Stays in core application if:
- ❌ Project-specific business logic
- ❌ Tightly coupled to this application's domain
- ❌ Rapidly changing implementation
- ❌ Contains sensitive configuration

## Publishing Strategy

1. **Phase 1**: Identify reusable services (current phase)
2. **Phase 2**: Create package structure and tests
3. **Phase 3**: Setup CI/CD for package publishing
4. **Phase 4**: Publish to private npm registry or GitHub Packages
5. **Phase 5**: Update consuming applications to use published package
6. **Phase 6**: Remove temporary folder once migration is complete

## Configuration Management

### Approach 1: Inject Config at Runtime
```typescript
// In consuming application
import { AUTH_CONFIG_TOKEN } from '@opensourcekd/ng-common-libs/auth';

providers: [
  { provide: AUTH_CONFIG_TOKEN, useValue: environment.auth0Config }
]
```

### Approach 2: Environment-Based Config Files
```typescript
// Package provides interface, app provides values
import { Auth0Config } from '@opensourcekd/ng-common-libs/auth';

export const auth0Config: Auth0Config = {
  domain: 'your-tenant.auth0.com',
  clientId: 'your-client-id',
  // ...
};
```

## Dependencies

### Core Dependencies (to be included in package)
- `@auth0/auth0-spa-js` (for AuthService)
- `mitt` (for EventBusService)
- `@angular/core`, `@angular/common`, `rxjs` (peer dependencies)

### Optional Peer Dependencies
- `@angular-architects/module-federation` (for MfeLoaderService)

## Versioning Strategy

Follow Semantic Versioning (SemVer):
- **Major**: Breaking API changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, backward compatible

## Developer Experience Considerations

1. **Tree-shakable**: Use sub-path exports so apps only bundle what they use
2. **Type-safe**: Full TypeScript support with exported interfaces
3. **Documented**: JSDoc comments and README for each module
4. **Tested**: Unit tests with good coverage
5. **Examples**: Sample code showing common use cases

## Security Considerations

- ✅ No hardcoded credentials in package
- ✅ Secure token storage (sessionStorage, not localStorage)
- ✅ Regular dependency updates
- ✅ Vulnerability scanning in CI/CD
- ✅ Audit trail for package releases

## Related Resources

- **Project Repository**: InkRamp/InkRamp-code
- **Current Location**: `src/_temp-shared/`
- **Documentation**: `.github/docs/ARCHITECTURE.md`
- **Migration Plan**: `src/_temp-shared/README.md`
