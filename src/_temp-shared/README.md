# Temporary Shared Services

⚠️ **THIS IS A TEMPORARY STRUCTURE** ⚠️

This folder contains shared services, models, and configurations that were moved from `projects/core-services/`.

## Migration Status

✅ **Migrated to @opensourcekd/ng-common-libs:**
- AuthService - Now imported from `@opensourcekd/ng-common-libs`
- EventBusService - Now imported from `@opensourcekd/ng-common-libs`
- UserInfo, UserData types - Available from the library

## Future Migration Path

All remaining code in this folder will be migrated to one of two destinations:

1. **External Package**: Published as `@opensourcekd/ng-common-libs` package
   - Reusable across multiple projects
   - Versioned and maintained separately
   - Distributed via npm

2. **Core Application**: Integrated directly into the main application code
   - Project-specific implementations
   - No need for external packaging

## Current Structure

- `/interceptors/` - HTTP interceptors (auth interceptor uses library's AuthService)
- `/models/` - TypeScript interfaces and types
- Services still in this folder:
  - `role.service.ts` - Role-based access control
  - `dummy-data.service.ts` - Mock data for development
  - `mfe-loader.service.ts` - Micro-frontend loading
  - `user-profile.service.ts` - User profile management
  - Other utility services

## Configuration

Auth0 and API configurations have been moved to `/src/configs/`:
- `auth.config.ts` - Auth0 configuration
- `api.config.ts` - API endpoint configuration

## Import Paths

Current imports:
- For library services: `import { AuthService, EventBusService } from '@opensourcekd/ng-common-libs'`
- For local services: `import { RoleService, ... } from '@org/core-services'`

## DO NOT

- Add new features here without considering the migration path
- Import directly from this folder (use the aliases)
- Treat this as a permanent solution

