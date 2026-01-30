# Root Cause Analysis: MFE Library Sharing Issues

**Date**: 2026-01-30  
**Status**: 🔍 **DIAGNOSED** - Root cause identified, solution ready  
**Severity**: Critical - MFEs cannot function without these services

---

## Executive Summary

**Problem**: Things stopped working after removing shared libraries. Shell works fine alone, but breaks when MFEs try to load.

**Root Cause**: Authentication-related services (`AuthService`, `AuthInterceptor`, `AuthConfig`, `ApiConfig`) are **commented out** in `webpack.config.js` (lines 23-26), preventing MFEs from accessing these critical dependencies.

**Impact**: MFEs cannot authenticate users or make API calls, rendering them non-functional.

---

## Problem Statement

> "You see things have stopped working after removing the shared library and stuff. Not sure what's wrong. One thing I noticed is without the MFE, shell works absolutely fine. So issue does seem to be in the way we are sharing libraries and stuff."

---

## Investigation Summary

### What We Found

1. **Shell Application Works Fine**
   - ✅ Build succeeds: `npm run build` completes without errors
   - ✅ Shell has direct access to all services via local imports from `src/_temp-shared/`
   - ✅ Uses TypeScript path mapping: `@org/core-services` → `./src/_temp-shared/public-api.ts`

2. **MFEs Cannot Access Critical Services**
   - ❌ AuthService not exposed via Module Federation
   - ❌ AuthInterceptor not exposed via Module Federation
   - ❌ AuthConfig not exposed via Module Federation  
   - ❌ ApiConfig not exposed via Module Federation

3. **Evidence in Code**

   **Current webpack.config.js (lines 18-30)**:
   ```javascript
   exposes: {
     './RoleService': './src/_temp-shared/role.service.ts',
     './DummyDataService': './src/_temp-shared/dummy-data.service.ts',
     './MfeLoaderService': './src/_temp-shared/mfe-loader.service.ts',
     './EventBusService': './src/_temp-shared/event-bus.service.ts',
     // './AuthService': './src/_temp-shared/auth.service.ts',              ⚠️ COMMENTED OUT
     // './AuthInterceptor': './src/_temp-shared/interceptors/auth.interceptor.ts',  ⚠️ COMMENTED OUT
     // './AuthConfig': './src/_temp-shared/config/auth.config.ts',        ⚠️ COMMENTED OUT
     // './ApiConfig': './src/_temp-shared/config/api.config.ts',          ⚠️ COMMENTED OUT
     './Models': './src/_temp-shared/models/roles.model.ts',
     './DataModels': './src/_temp-shared/models/data.model.ts',
     './MfeModels': './src/_temp-shared/models/mfe.model.ts',
   },
   ```

---

## Root Cause Analysis

### Why Shell Works But MFEs Don't

| Component | Shell Access | MFE Access | Status |
|-----------|--------------|------------|--------|
| **RoleService** | ✅ Local import | ✅ Module Federation | Working |
| **EventBusService** | ✅ Local import | ✅ Module Federation | Working |
| **AuthService** | ✅ Local import | ❌ **NOT exposed** | **BROKEN** |
| **AuthInterceptor** | ✅ Local import | ❌ **NOT exposed** | **BROKEN** |
| **AuthConfig** | ✅ Local import | ❌ **NOT exposed** | **BROKEN** |
| **ApiConfig** | ✅ Local import | ❌ **NOT exposed** | **BROKEN** |

**Explanation**:
- **Shell** uses TypeScript path mapping (`@org/core-services`) which directly resolves to local files
- **MFEs** must use Module Federation to import from Shell, but the auth services aren't exposed
- When MFEs try to authenticate or make API calls, they fail with undefined dependencies

---

## Historical Context

### From MODULE_FEDERATION_FIX.md (Issue 2)

The document explicitly addresses this problem:

**Lines 188-195**:
> **Problem**: TypeError during bootstrap - "Cannot read properties of undefined (reading 'hasOwnProperty')"
> 
> **Root Cause**:
> 1. The `authInterceptor` references `API_CONFIG` from config files, and `AuthService` references `AUTH0_CONFIG`
> 2. In Module Federation context, when MFEs import the interceptor, config objects may be undefined
> 3. Even with optional chaining (`API_CONFIG?.baseUrl`), accessing properties on completely undefined objects causes errors
> 4. The config files were not exposed in webpack Module Federation configuration

**Lines 234-245** - The documented solution:
```javascript
exposes: {
  './AuthService': './src/_temp-shared/auth.service.ts',
  './AuthInterceptor': './src/_temp-shared/interceptors/auth.interceptor.ts',
  './AuthConfig': './src/_temp-shared/config/auth.config.ts',
  './ApiConfig': './src/_temp-shared/config/api.config.ts',
  // ... other exposures
}
```

### What Happened

1. ✅ **Defensive checks were added** to handle undefined configs gracefully
2. ✅ **Documentation was written** explaining the solution
3. ❌ **Services were later commented out** in webpack.config.js (unknown reason)
4. ❌ **MFEs now fail** because these services are unavailable

---

## Defensive Programming Verification

All required defensive checks are **IN PLACE** as documented:

### 1. AuthInterceptor (lines 60-67)
```typescript
try {
  if (API_CONFIG && typeof API_CONFIG === 'object' && API_CONFIG.baseUrl && url.startsWith(API_CONFIG.baseUrl)) {
    return false;
  }
} catch (error) {
  console.warn('[authInterceptor] API_CONFIG not available, using pattern-based auth endpoint detection', error);
}
```
✅ **Safe for Module Federation**

### 2. AuthService (lines 98-100)
```typescript
if (!AUTH0_CONFIG || typeof AUTH0_CONFIG !== 'object') {
  throw new Error('[AuthService] AUTH0_CONFIG is not defined or invalid');
}
```
✅ **Safe for Module Federation** (fails fast with clear error)

### 3. UserProfileService (lines 79-82)
```typescript
if (!API_CONFIG || !API_CONFIG.baseUrl) {
  console.error('[UserProfileService] API_CONFIG or baseUrl is not defined');
  return of(null);
}
```
✅ **Safe for Module Federation** (graceful degradation)

---

## Impact Analysis

### Before the Services Were Commented Out
- ✅ MFEs could authenticate users
- ✅ MFEs could make authenticated API calls
- ✅ MFEs could access user profile data
- ✅ Full application functionality

### After the Services Were Commented Out
- ❌ MFEs cannot authenticate (AuthService unavailable)
- ❌ MFEs cannot add auth headers (AuthInterceptor unavailable)
- ❌ MFEs cannot detect API endpoints (ApiConfig unavailable)
- ❌ MFEs cannot initialize Auth0 (AUTH0_CONFIG unavailable)
- ❌ **Application is NON-FUNCTIONAL for multi-tenant scenarios**

---

## Solution

### ✅ Ready to Implement

**Action Required**: Uncomment lines 23-26 in `webpack.config.js`

**Before**:
```javascript
exposes: {
  './RoleService': './src/_temp-shared/role.service.ts',
  './DummyDataService': './src/_temp-shared/dummy-data.service.ts',
  './MfeLoaderService': './src/_temp-shared/mfe-loader.service.ts',
  './EventBusService': './src/_temp-shared/event-bus.service.ts',
  // './AuthService': './src/_temp-shared/auth.service.ts',
  // './AuthInterceptor': './src/_temp-shared/interceptors/auth.interceptor.ts',
  // './AuthConfig': './src/_temp-shared/config/auth.config.ts',
  // './ApiConfig': './src/_temp-shared/config/api.config.ts',
  './Models': './src/_temp-shared/models/roles.model.ts',
  './DataModels': './src/_temp-shared/models/data.model.ts',
  './MfeModels': './src/_temp-shared/models/mfe.model.ts',
},
```

**After**:
```javascript
exposes: {
  './RoleService': './src/_temp-shared/role.service.ts',
  './DummyDataService': './src/_temp-shared/dummy-data.service.ts',
  './MfeLoaderService': './src/_temp-shared/mfe-loader.service.ts',
  './EventBusService': './src/_temp-shared/event-bus.service.ts',
  './AuthService': './src/_temp-shared/auth.service.ts',
  './AuthInterceptor': './src/_temp-shared/interceptors/auth.interceptor.ts',
  './AuthConfig': './src/_temp-shared/config/auth.config.ts',
  './ApiConfig': './src/_temp-shared/config/api.config.ts',
  './Models': './src/_temp-shared/models/roles.model.ts',
  './DataModels': './src/_temp-shared/models/data.model.ts',
  './MfeModels': './src/_temp-shared/models/mfe.model.ts',
},
```

**Safety**:
- ✅ All defensive checks are in place
- ✅ Services handle undefined configs gracefully
- ✅ No breaking changes to existing code
- ✅ Previously documented and tested solution

---

## Expected Outcomes

### After Uncommenting

1. **MFEs can import auth services**:
   ```typescript
   import { AuthService } from 'shell/AuthService';
   import { authInterceptor } from 'shell/AuthInterceptor';
   import { API_CONFIG } from 'shell/ApiConfig';
   ```

2. **MFEs can authenticate users**:
   - Login/logout functionality works
   - Token management works
   - User session management works

3. **MFEs can make authenticated API calls**:
   - AuthInterceptor adds Bearer tokens automatically
   - API_CONFIG provides endpoint configuration
   - UserProfileService can fetch user data

4. **Application is fully functional**:
   - Shell + MFEs work together seamlessly
   - Multi-tenant functionality restored
   - Role-based access control functional

---

## Verification Checklist

After uncommenting the services:

- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] No Module Federation errors
- [ ] Services are exposed in dist/i17e/remoteEntry.js
- [ ] MFEs can import and use AuthService
- [ ] MFEs can import and use AuthInterceptor
- [ ] MFEs can authenticate users successfully
- [ ] MFEs can make authenticated API calls

---

## Lessons Learned

1. **Always document WHY code is commented out**
   - Without context, commented code creates confusion
   - Defensive checks were added but services were later hidden

2. **Module Federation requires explicit exposure**
   - Shell works with local imports
   - MFEs need services exposed in webpack config
   - Missing exposures = silent failures in MFEs

3. **Config objects must travel with services**
   - AuthService needs AUTH0_CONFIG
   - AuthInterceptor needs API_CONFIG
   - All four must be exposed together

4. **Defensive programming is critical for Module Federation**
   - Services shared across federated modules must handle undefined deps
   - Try-catch blocks prevent cryptic errors
   - Graceful degradation when possible, fail-fast when critical

---

## Related Files

- `webpack.config.js` - Module Federation configuration (THE FIX LOCATION)
- `src/_temp-shared/auth.service.ts` - Auth0 authentication service
- `src/_temp-shared/interceptors/auth.interceptor.ts` - HTTP interceptor for tokens
- `src/_temp-shared/config/auth.config.ts` - Auth0 configuration
- `src/_temp-shared/config/api.config.ts` - API endpoint configuration
- `src/_temp-shared/user-profile.service.ts` - User profile data service
- `MODULE_FEDERATION_FIX.md` - Historical documentation of this issue
- `src/_temp-shared/public-api.ts` - Public API exports

---

## References

- [Module Federation Documentation](https://webpack.js.org/concepts/module-federation/)
- [Angular Module Federation Guide](https://www.angulararchitects.io/aktuelles/the-microfrontend-revolution-module-federation-in-webpack-5/)
- MODULE_FEDERATION_FIX.md (Issue 2: Lines 170-289)

---

**Next Steps**: User has requested investigation only, not implementation. The root cause has been identified and documented. Ready to proceed with fix when approved.
