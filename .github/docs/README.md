# Documentation Directory

This directory contains project documentation files, centralized in `.github/` for AI/Copilot context.

## 📁 Files in This Directory

| File | Description |
|------|-------------|
| `ARCHITECTURE.md` | System architecture, patterns, and folder structure |
| `DESIGN_DECISIONS.md` | Architectural Decision Records (ADRs) |
| `ROLES.md` | Role hierarchy and capabilities (RBAC) |
| `API_CONTRACTS.md` | REST API documentation and contracts |
| `INCONSISTENCIES.md` | Known discrepancies between code and documentation |

## 🔗 Related Files

| Location | Description |
|----------|-------------|
| `.github/copilot-context.yml` | Centralized context manifest |
| `.github/copilot-instructions.md` | Development guidelines |
| `.github/context/` | Machine-readable schemas (domain models, events) |
| `.github/prompts/` | Prompt templates for common tasks |

## 📝 Build Confirmation

Documentation files won't be bundled in builds because:
1. They're outside the `src/` directory
2. Angular's `angular.json` only includes files from `src/`
3. Webpack doesn't bundle markdown files

## 🔄 Updating Documentation

When updating documentation:

1. Keep files in sync with actual code behavior
2. Update `INCONSISTENCIES.md` if you find code/doc mismatches
3. Reference these files from `.github/copilot-context.yml` manifest
