# Migration Summary: Shared Services to Temporary Folder

**Date**: 2026-01-29  
**Branch**: copilot/move-shared-services-folder  
**Status**: ✅ Complete

## What Was Done

### 1. Moved All Shared Services
- **From**: `projects/core-services/` (Angular library project)
- **To**: `src/_temp-shared/` (temporary folder in main src)
- **Files Moved**: 27 files including services, models, configs, interceptors

### 2. Updated Import Path Mappings

#### tsconfig.json
```json
{
  "paths": {
    "@org/core-services": ["./src/_temp-shared/public-api.ts"],
    "@opensourcekd/ng-common-libs": ["./src/_temp-shared/public-api.ts"],
    "@opensourcekd/ng-common-libs/*": ["./src/_temp-shared/*"]
  }
}
```

**Result**: Both `@org/core-services` and `@opensourcekd/ng-common-libs` imports work correctly.

### 3. Updated Module Federation Configuration

#### webpack.config.js
Updated `exposes` section to point to new location:
```javascript
exposes: {
  './RoleService': './src/_temp-shared/role.service.ts',
  './DummyDataService': './src/_temp-shared/dummy-data.service.ts',
  './MfeLoaderService': './src/_temp-shared/mfe-loader.service.ts',
  './EventBusService': './src/_temp-shared/event-bus.service.ts',
  // ... other services
}
```

### 4. Removed Old Library Configuration

#### angular.json
- Removed entire `core-services` project configuration
- Shell application no longer references the library project

### 5. Created Documentation

#### New Files
- `src/_temp-shared/README.md` - Explains temporary structure
- `.github/docs/NG_COMMON_LIBS.md` - Comprehensive guide for @opensourcekd/ng-common-libs

#### Updated Files
- `.github/copilot-instructions.md` - Updated file organization and examples
- `.github/docs/ARCHITECTURE.md` - Updated core services section

### 6. Removed Old Files
- Deleted entire `projects/core-services/` directory
- Removed 32 files (package.json, tsconfig files, library config, etc.)

## Verification

✅ **Build Status**: Success  
✅ **Bundle Size**: 82.64 kB (initial), no regression  
✅ **Warnings**: Only pre-existing warnings about unused files  
✅ **Import Paths**: Both old and new aliases working  
✅ **Module Federation**: Services correctly exposed to remote MFEs

## Folder Structure (After Migration)

```
src/
├── _temp-shared/           # ⚠️ TEMPORARY - Will be migrated
│   ├── README.md          # Migration plan
│   ├── public-api.ts      # Main export file
│   ├── auth.service.ts
│   ├── role.service.ts
│   ├── event-bus.service.ts
│   ├── mfe-loader.service.ts
│   ├── user-profile.service.ts
│   ├── dummy-data.service.ts
│   ├── config/
│   │   ├── auth.config.ts
│   │   └── api.config.ts
│   ├── interceptors/
│   │   └── auth.interceptor.ts
│   └── models/
│       ├── roles.model.ts
│       ├── data.model.ts
│       └── mfe.model.ts
└── app/
    └── ...
```

## Import Usage Examples

### Option 1: Legacy Path (Still Works)
```typescript
import { AuthService, RoleService } from '@org/core-services';
```

### Option 2: Future Package Name (Recommended)
```typescript
import { AuthService, RoleService } from '@opensourcekd/ng-common-libs';
```

### Option 3: Direct Sub-path (Also Works)
```typescript
import { AuthService } from '@opensourcekd/ng-common-libs/auth.service';
```

## Next Steps (Future Work)

### Phase 1: Decision Making
- [ ] Review each service and determine if it goes to package or stays in app
- [ ] Document API contracts for package-bound services
- [ ] Define versioning strategy

### Phase 2: Package Creation (if going to artifactory)
- [ ] Create separate repository for `@opensourcekd/ng-common-libs`
- [ ] Setup package structure with proper entry points
- [ ] Write comprehensive tests
- [ ] Setup CI/CD pipeline for publishing
- [ ] Publish to npm or private registry

### Phase 3: Integration (if staying in core)
- [ ] Move services from `_temp-shared/` to `src/app/core/`
- [ ] Remove temporary structure
- [ ] Update path mappings to remove aliases

### Phase 4: Cleanup
- [ ] Remove `@org/core-services` alias (breaking change)
- [ ] Update all documentation
- [ ] Archive this migration document

## Breaking Changes

### None for Consuming Code
All existing imports continue to work:
- ✅ `@org/core-services` still works
- ✅ No code changes needed in components/services
- ✅ MFE remotes can still import exposed services

### Internal Changes Only
- ❌ Cannot use `ng build core-services` (library removed)
- ❌ Cannot use `ng test core-services` (library removed)
- ✅ Tests now run as part of main application

## Developer Notes

### Why "_temp-shared"?
- Underscore prefix makes it obvious this is temporary
- "shared" indicates it contains shared services
- Clear signal that this structure will change

### Why Both Import Paths?
- Gradual migration strategy
- No breaking changes for existing code
- Easy to switch when ready

### Why Not Move Directly to Final Location?
- Need to decide what goes where (package vs. core)
- Avoid premature optimization
- Allow time for team review and decisions

## Questions & Answers

### Q: Can I add new services to `_temp-shared/`?
**A**: Yes, but consider the migration path. If it's truly reusable, plan for it to go to the package. If it's project-specific, consider putting it in `src/app/` instead.

### Q: When will this temporary structure be removed?
**A**: After decisions are made about what goes to the package vs. what stays in the app, and the migration is complete.

### Q: Should I use `@org/core-services` or `@opensourcekd/ng-common-libs`?
**A**: Use `@opensourcekd/ng-common-libs` for new code. It's the future path. The old alias will be deprecated eventually.

### Q: Will this affect remote MFEs?
**A**: No. Module Federation exposes remain the same. Remote MFEs can continue importing as before.

## Related Documentation

- [NG_COMMON_LIBS.md](./.github/docs/NG_COMMON_LIBS.md) - Package planning guide
- [ARCHITECTURE.md](./.github/docs/ARCHITECTURE.md) - System architecture
- [src/_temp-shared/README.md](./src/_temp-shared/README.md) - Temporary folder info

---

**Migration Completed Successfully** ✅  
All shared services moved to temporary location with dual import paths established.
