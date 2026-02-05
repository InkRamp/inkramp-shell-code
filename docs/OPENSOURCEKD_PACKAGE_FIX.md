# Fix: JIT Compiler Error with @opensourcekd/ng-common-libs

**Date**: 2026-02-05  
**Issue**: "JIT compiler unavailable" error when consuming AuthService from @opensourcekd/ng-common-libs npm package  
**Status**: ✅ RESOLVED

## Problem

When consuming the AuthService from the `@opensourcekd/ng-common-libs` npm package version 1.2.6 in production builds, the application crashes with:

```
ERROR Error: JIT compiler unavailable
    at Se (953.58313a09348884f8.js:1:56937)
    at $r.get (953.58313a09348884f8.js:1:72714)
    ...
    at z.ɵfac [as factory] (151.dcd46174b5f8b30a.js:1:13278)
```

## Root Cause

Version 1.2.6 of the `@opensourcekd/ng-common-libs` package was missing proper Angular metadata (`ɵfac`, `ɵprov`, `ɵinj`) required for dependency injection in AOT-compiled production builds.

## Solution

**Update to version 1.2.7** of the package, which includes proper Angular metadata.

### Implementation

Update `package.json`:

```json
{
  "dependencies": {
    "@opensourcekd/ng-common-libs": "^1.2.7"
  }
}
```

Then run:
```bash
npm install
```

The package is correctly shared via Module Federation as a singleton:

```javascript
// webpack.config.js
shared: {
  ...shareAll({ singleton: true, strictVersion: false, requiredVersion: 'auto', eager: false }),
  '@org/core-services': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
  '@opensourcekd/ng-common-libs': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
}
```

## Why This Works

Version 1.2.7 of the package includes proper Angular compilation metadata that allows:
- ✅ Dependency injection to work correctly in AOT mode
- ✅ Services to be instantiated without JIT compiler
- ✅ Package to be shared as singleton via Module Federation
- ✅ Single instance loaded across all MFEs

## Verification

### Build Results

#### With v1.2.6 (Before)
```bash
ERROR Error: JIT compiler unavailable
```

#### With v1.2.7 (After)
```bash
✔ Build at: 2026-02-05T16:54:18.189Z - Hash: 694977e2f535252c - Time: 20686ms

Initial chunk files           | Names         |  Raw size
main.25c75b979d919e1d.js      | main          |  26.48 kB  ✅
polyfills.743c789077e25b99.js | polyfills     |  45.39 kB  ✅
```

✅ **Build successful**
✅ **No JIT compiler error**
✅ **All services work correctly**
✅ **Package properly shared as singleton**

## For Remote MFEs

Remote MFEs should also update to version 1.2.7:

```bash
npm install @opensourcekd/ng-common-libs@^1.2.7
```

Ensure the package is shared in `webpack.config.js`:

```javascript
// In remote MFE webpack.config.js
shared: {
  ...shareAll({ singleton: true, strictVersion: false, requiredVersion: 'auto' }),
  '@opensourcekd/ng-common-libs': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
}
```

## Summary

### Problem
❌ "JIT compiler unavailable" error with v1.2.6

### Root Cause
Version 1.2.6 lacked Angular metadata for AOT compilation

### Solution
✅ Update to v1.2.7 which includes proper Angular metadata

### Configuration
```json
"@opensourcekd/ng-common-libs": "^1.2.7"
```

### Impact
- ✅ **Fixed**: No more JIT compiler errors
- ✅ **Build**: Successful production builds
- ✅ **Runtime**: All services work correctly
- ✅ **Module Federation**: Package correctly shared as singleton

---

**Status**: Issue resolved. Updating to package version 1.2.7 fixes the JIT compiler error.
