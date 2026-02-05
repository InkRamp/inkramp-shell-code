# Temporary Shared Services

⚠️ **THIS IS A TEMPORARY STRUCTURE** ⚠️

This folder contains shared services, models, and configurations that were moved from `projects/core-services/`.

## Services Already Migrated to @opensourcekd/ng-common-libs

The following services have been removed from this folder and should be imported from `@opensourcekd/ng-common-libs` package:

- **AuthService** - Authentication with Auth0 (removed, use package)
- **EventBusService** - Cross-application event communication (removed, use package)

Import these from the package:
```typescript
import { AuthService, EventBusService } from '@opensourcekd/ng-common-libs';
```

## Future Migration Path

All code in this folder will be migrated to one of two destinations:

1. **External Artifactory**: Published as `@opensourcekd/ng-common-libs` package
   - Reusable across multiple projects
   - Versioned and maintained separately
   - Distributed via npm or private registry

2. **Core Application**: Integrated directly into the main application code
   - Project-specific implementations
   - No need for external packaging

## Current Structure

- `/config/` - Auth0 and API configurations
- `/interceptors/` - HTTP interceptors (auth, caching, etc.)
- `/models/` - TypeScript interfaces and types
- `/services/` - Core services (auth, role, event-bus, etc.)

## Import Paths

Current imports work with both aliases:
- `@org/core-services` (legacy, will be deprecated)
- `@opensourcekd/ng-common-libs` (future package name)

## DO NOT

- Add new features here without considering the migration path
- Import directly from this folder (use the aliases)
- Treat this as a permanent solution
