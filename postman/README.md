# Postman Collections Directory

This directory contains Postman collections and API testing documentation.

## Files Were Removed (Issue #32)

Postman files were removed from git tracking in PR #32 (commit `fbebcb6`) but should remain in the code repository (just not bundled in builds).

## How to Restore the Files

The files exist in commit `da5c5b462325597faf1847576552b3715a481872` (the commit before they were removed).

### Method 1: Using Git Checkout (Recommended)

```bash
# Navigate to repository root
cd /path/to/InkRamp-code

# Fetch more git history if needed
git fetch --unshallow 2>/dev/null || git fetch --depth=100

# Restore the postman directory from the commit before removal
git checkout da5c5b462325597faf1847576552b3715a481872 -- postman/

# Verify files were restored
ls -la postman/

# The files will be staged automatically, ready to commit
git status
```

### Method 2: Using GitHub Web Interface

If git checkout doesn't work (shallow clone issues), you can download files from GitHub:

1. Visit: https://github.com/InkRamp/InkRamp-code/tree/da5c5b462325597faf1847576552b3715a481872/postman
2. Click on each file and use "Raw" button to download
3. Save files to your local `postman/` directory

### Files to Restore (6 total)

- AUTH0_INTEGRATION.md - Auth0 authentication integration guide
- `Auth0 PKCE Flow – Fixed (Postman CryptoJS).postman_collection.json` - Postman collection for Auth0 PKCE flow
- DEBUGGING_GUIDE.md - Guide for debugging API calls and authentication
- Dev.postman_environment.json - Development environment configuration for Postman
- POSTMAN_WORKING.md - Guide for working with Postman collections
- ZITADEL_INTEGRATION.md - Legacy Zitadel integration documentation (deprecated)

## Why This Change?

**Problem**: Postman collections were deleted but user wanted them to remain in code (just not bundled in builds).

**Solution**: 
- Removed `postman/` from `.gitignore` ✅
- Restored postman files from git history (see commands above)
- Files stay excluded from Angular builds (they're outside `src/`)

## Build Confirmation

Postman files won't be bundled because:
1. They're outside the `src/` directory
2. Angular's `angular.json` only includes files from `src/`
3. Webpack doesn't bundle Postman files

**Verify** by checking `angular.json`:
```json
{
  "sourceRoot": "src"
}
```

Only `src/` files are in the build.

## Using the Postman Collections

Once restored, you can:
1. Import the collection into Postman
2. Import the Dev environment
3. Follow the guides in AUTH0_INTEGRATION.md or POSTMAN_WORKING.md
4. Test your API authentication flows
