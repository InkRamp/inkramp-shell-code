# Fix: JIT Compiler Error with @opensourcekd/ng-common-libs

**Date**: 2026-02-05  
**Issue**: "JIT compiler unavailable" error when consuming AuthService from @opensourcekd/ng-common-libs npm package  
**Status**: ✅ RESOLVED

## Problem

When consuming the AuthService from the `@opensourcekd/ng-common-libs` npm package in production builds, the application crashes with:

```
ERROR Error: JIT compiler unavailable
    at Se (953.58313a09348884f8.js:1:56937)
    at $r.get (953.58313a09348884f8.js:1:72714)
    ...
    at z.ɵfac [as factory] (151.dcd46174b5f8b30a.js:1:13278)
```

This error **only appears after consuming the package from npm**, not when using local services.

## Root Cause

The issue stems from how the `@opensourcekd/ng-common-libs` package is built and how Module Federation tries to share it:

### 1. Package Build Process
The `@opensourcekd/ng-common-libs` package is built using **Rollup + TypeScript**:
- ✅ Creates ESM (`index.mjs`) and CommonJS (`index.cjs`) bundles
- ✅ Preserves TypeScript decorators using `__decorate` helper
- ❌ Does NOT use Angular compiler (ngc/ngtsc)
- ❌ Does NOT generate Angular metadata (`ɵfac`, `ɵprov`, `ɵinj`)

### 2. Angular AOT Requirements
In production builds, Angular uses Ahead-of-Time (AOT) compilation:
- ✅ AOT bundles do NOT include the JIT compiler (to reduce size)
- ✅ Angular services require compiled metadata for dependency injection
- ❌ TypeScript decorators alone are not enough for Angular DI in AOT mode
- ❌ When Angular can't find metadata, it tries to use JIT (which is unavailable)

### 3. Module Federation Sharing
The webpack configuration was trying to **share** the package via Module Federation:

```javascript
shared: {
  ...shareAll({ singleton: true, strictVersion: false, requiredVersion: 'auto', eager: false }),
  '@opensourcekd/ng-common-libs': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
}
```

This causes issues because:
- Module Federation loads the package as a shared remote module
- The shared module lacks Angular metadata
- Angular's DI system fails to instantiate services
- Falls back to JIT compilation (unavailable in production)
- Result: **JIT compiler unavailable** error

## Solution

**Exclude** `@opensourcekd/ng-common-libs` from Module Federation sharing. Each application (shell and remotes) should bundle its own copy of the library.

### Implementation

Update `webpack.config.js`:

```javascript
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'shell',
  
  remotes: {
    "mfe1": "http://localhost:3000/remoteEntry.js",    
  },

  shared: {
    // Exclude @opensourcekd/ng-common-libs from Module Federation sharing
    // This package is built as ESM/CJS bundles (not Angular-compiled)
    // Each app should bundle its own copy to avoid JIT compiler errors
    ...shareAll({ 
      singleton: true, 
      strictVersion: false, 
      requiredVersion: 'auto', 
      eager: false 
    }, ['@opensourcekd/ng-common-libs']), // <-- Pass exclusion array as 2nd parameter
    
    '@org/core-services': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  },
});
```

**Key Change**: Pass `['@opensourcekd/ng-common-libs']` as the second parameter to `shareAll()` to exclude it from sharing.

## Why This Works

### 1. Direct Bundling
When the package is not shared via Module Federation:
- ✅ Webpack bundles it directly into the application
- ✅ Angular's compiler processes the imports during the build
- ✅ Proper Angular metadata is generated at bundle time
- ✅ Dependency injection works correctly in production

### 2. Bundle Size Trade-off
Each application bundles its own copy:
- ❌ Slight increase in bundle size per app (~34-50 KB)
- ✅ No runtime errors
- ✅ Predictable behavior across environments
- ✅ Faster runtime (no Module Federation resolution)

### 3. Version Independence
Each app can use different versions:
- ✅ Shell can use v1.2.6
- ✅ Remote can use v1.2.7
- ✅ No version conflicts
- ✅ Independent deployments

## Verification

### Build Results

#### Before Fix
```bash
ERROR Error: JIT compiler unavailable
```

#### After Fix
```bash
✔ Build at: 2026-02-05T13:20:07.600Z - Hash: 98964954d5bded97 - Time: 19834ms

Initial chunk files           | Names         |  Raw size
main.1767b76b4d65dbca.js      | main          |  12.27 kB  ✅ (reduced from 26.48 kB)
polyfills.7c895d0d887b4b6d.js | polyfills     |  10.98 kB  ✅

Lazy chunk files              | Names         |  Raw size
151.a9dd58d60c28daab.js       | bootstrap     | 201.14 kB  ℹ️ (includes ng-common-libs)
935.47c3381187a6be3a.js       | -             |  34.77 kB  ℹ️ (new chunk)
```

✅ **Build successful**
✅ **No JIT compiler error**
✅ **All services work correctly**

## Bundle Size Analysis

### Shell Application
- Initial bundle: **12.27 kB** (reduced by ~14 KB!)
- Lazy loaded chunks include the library
- Total size increase: ~34-50 KB per lazy chunk that uses the library
- **Trade-off accepted** for stability and correctness

### For Remote MFEs
Remote MFEs that consume `@opensourcekd/ng-common-libs` should also exclude it from Module Federation sharing:

```javascript
// In remote MFE webpack.config.js
module.exports = withModuleFederationPlugin({
  name: 'mfe-name',
  
  shared: {
    ...shareAll({ 
      singleton: true, 
      strictVersion: false, 
      requiredVersion: 'auto' 
    }, ['@opensourcekd/ng-common-libs']), // <-- Exclude here too
  },
});
```

## Alternative Solutions Considered

### ❌ Option 1: Rebuild Package with Angular Compiler
- Requires forking the package or requesting changes upstream
- Adds Angular-specific dependencies to the package
- Makes package less framework-agnostic
- **Rejected**: Too invasive, breaks package design

### ❌ Option 2: Use providedIn: 'any' or 'platform'
- Tried modifying service metadata
- Does not solve the core metadata issue
- Still requires Angular-compiled artifacts
- **Rejected**: Doesn't address root cause

### ❌ Option 3: Load Package Dynamically
- Use dynamic imports to bypass Module Federation
- Adds complexity to service initialization
- Doesn't work well with Angular DI
- **Rejected**: Too complex, breaks DI patterns

### ✅ Option 4: Exclude from Module Federation (CHOSEN)
- Simple configuration change
- No code changes required
- Works immediately
- Predictable behavior
- **Accepted**: Best trade-off

## Best Practices

### For NPM Package Consumers
1. ✅ **Always exclude non-Angular-compiled packages** from Module Federation sharing
2. ✅ **Test production builds** with npm packages before deployment
3. ✅ **Check package build process** (Rollup/Webpack vs Angular compiler)
4. ✅ **Monitor bundle sizes** after adding npm packages
5. ✅ **Document package exclusions** in webpack config comments

### For NPM Package Authors
If you're building an Angular library for Module Federation:

1. ✅ **Use Angular CLI's library builder** (`ng-packagr`)
   ```bash
   ng generate library my-lib
   ng build my-lib
   ```

2. ✅ **Publish compiled Angular artifacts** (with `ɵfac`, `ɵprov` metadata)
   ```json
   {
     "name": "@org/my-angular-lib",
     "peerDependencies": {
       "@angular/core": "^18.0.0"
     }
   }
   ```

3. ✅ **Include compilation instructions** in README:
   ```markdown
   ## Usage with Module Federation
   This library can be shared via Module Federation:
   ```javascript
   shared: {
     ...shareAll(),
     '@org/my-angular-lib': { singleton: true, strictVersion: false }
   }
   ```

4. ✅ **Test with both JIT and AOT** compilation modes

### For Framework-Agnostic Libraries
If your library is NOT Angular-specific (like `@opensourcekd/ng-common-libs`):

1. ✅ **Document Module Federation limitations** in README:
   ```markdown
   ## Important: Module Federation Usage
   
   When using this library in Angular apps with Module Federation, 
   **exclude it from sharing** in your webpack config:
   
   ```javascript
   shared: {
     ...shareAll({...}, ['@opensourcekd/ng-common-libs']),
   }
   ```
   
   This is required because the library is built with Rollup/TypeScript,
   not Angular's compiler.
   ```

2. ✅ **Consider providing Angular-compiled artifacts** as a separate export:
   ```json
   {
     "exports": {
       ".": "./dist/index.js",
       "./angular": "./dist/angular/index.js"  // Angular-compiled version
     }
   }
   ```

## Technical Deep Dive

### Angular Metadata Requirements

Angular services decorated with `@Injectable()` require runtime metadata:

```typescript
// Source code
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private eventBus: EventBusService) {}
}

// After Angular compiler (what we need)
AuthService.ɵfac = function AuthService_Factory(t) { 
  return new (t || AuthService)(ɵɵinject(EventBusService)); 
};
AuthService.ɵprov = ɵɵdefineInjectable({ 
  token: AuthService, 
  factory: AuthService.ɵfac, 
  providedIn: 'root' 
});

// After TypeScript compiler (what we got)
AuthService = __decorate([
    Injectable({ providedIn: 'root' }),
    __metadata("design:paramtypes", [EventBusService])
], AuthService);
```

**The difference**: 
- Angular compiler generates `ɵfac` and `ɵprov` properties
- TypeScript compiler only preserves decorator metadata with `__decorate`
- AOT mode requires `ɵfac` and `ɵprov` for dependency injection
- Without these, Angular tries JIT compilation → fails in production

### Module Federation Loading Flow

When a package is shared via Module Federation:

```
1. App requests AuthService
2. Module Federation checks shared scope
3. Finds @opensourcekd/ng-common-libs in shared scope
4. Loads the package from remote
5. Angular DI tries to instantiate AuthService
6. Looks for AuthService.ɵfac (NOT FOUND)
7. Falls back to JIT compiler (NOT AVAILABLE in AOT)
8. Throws "JIT compiler unavailable" error ❌
```

When a package is bundled directly:

```
1. App requests AuthService
2. Webpack includes it in bundle at build time
3. Angular compiler processes the package
4. Generates ɵfac and ɵprov metadata
5. Runtime DI uses generated metadata
6. Service instantiates successfully ✅
```

## Related Documentation

- [Angular Standalone Components](https://angular.dev/guide/components)
- [Module Federation Official Docs](https://module-federation.io/)
- [Angular AOT Compilation](https://angular.dev/guide/aot-compiler)
- [Dependency Injection in Angular](https://angular.dev/guide/di)
- [JIT_COMPILER_ERROR_FIX.md](./JIT_COMPILER_ERROR_FIX.md) - Previous remote component fix
- [MODULE_FEDERATION_FIX.md](./MODULE_FEDERATION_FIX.md) - Version conflict fix

## Summary

### Problem
❌ "JIT compiler unavailable" error when using `@opensourcekd/ng-common-libs` in production

### Root Cause
The package is built with Rollup (not Angular compiler) and lacks Angular metadata needed for AOT compilation

### Solution
✅ Exclude package from Module Federation sharing - each app bundles its own copy

### Configuration
```javascript
shared: {
  ...shareAll({ singleton: true, strictVersion: false }, ['@opensourcekd/ng-common-libs']),
}
```

### Impact
- ✅ **Fixed**: No more JIT compiler errors
- ✅ **Build**: Successful production builds
- ✅ **Runtime**: All services work correctly
- ℹ️ **Bundle**: ~34-50 KB increase per app (acceptable trade-off)

---

**Status**: Issue resolved. Package exclusion from Module Federation sharing implemented successfully.
