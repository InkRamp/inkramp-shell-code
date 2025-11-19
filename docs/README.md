# Documentation

This directory contains project documentation that was previously tracked in git.

## Restoring Documentation Files

The documentation files were removed from git tracking in commit `fbebcb6` but existed in the parent commit `da5c5b462325597faf1847576552b3715a481872`.

To restore all documentation files, run:

```bash
git checkout da5c5b462325597faf1847576552b3715a481872 -- docs/
```

This will restore the following files:
- API_INTEGRATION_GUIDE.md
- CHECKLIST.md
- DEBUG_LOGS_GUIDE.md
- DEVELOPER_GUIDE.md
- IMPLEMENTATION_COMPLETE.md
- IMPLEMENTATION_NOTES.md
- IMPLEMENTATION_SUMMARY.md
- IMPLEMENTATION_SUMMARY_API.md
- MFE_DEVELOPMENT_GUIDE.md
- MIGRATION_GUIDE.md
- MULTI_MFE_EXAMPLES.md
- MULTI_MFE_GUIDE.md
- MULTI_MFE_QUICKSTART.md
- PULL_REQUEST_NOTES.md
- QUICK_REFERENCE.md
- RESTRUCTURING_SUMMARY.md
- ROUTE_FIX_DOCUMENTATION.md
- SHELL_RESTRUCTURING_NOTES.md
- SUMMARY.md

## Note

These documentation files are now tracked in git and will be included in the repository, but they are NOT included in the Angular build output since they are outside the `src/` directory.
