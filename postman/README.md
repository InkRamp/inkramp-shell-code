# Postman Collections

This directory contains Postman collections and API testing documentation.

## Restoring Postman Files

The Postman files were removed from git tracking in commit `fbebcb6` but existed in the parent commit `da5c5b462325597faf1847576552b3715a481872`.

To restore all Postman files, run:

```bash
git checkout da5c5b462325597faf1847576552b3715a481872 -- postman/
```

This will restore the following files:
- AUTH0_INTEGRATION.md - Auth0 integration guide
- Auth0 PKCE Flow – Fixed (Postman CryptoJS).postman_collection.json - Postman collection for Auth0 PKCE flow
- DEBUGGING_GUIDE.md - API debugging guide
- Dev.postman_environment.json - Development environment variables
- POSTMAN_WORKING.md - Guide for working with Postman
- ZITADEL_INTEGRATION.md - Zitadel integration guide

## Note

These Postman collections and documentation are now tracked in git and will be included in the repository, but they are NOT included in the Angular build output since they are outside the `src/` directory.
