# AI Context Directory

This directory contains **machine-readable context files** for GitHub Copilot and other AI assistants. It is part of the centralized context system for the i17e Incentive Management Platform.

## 📋 Context Organization

All AI/Copilot context is centralized in `.github/`:

| File | Purpose |
|------|---------|
| `.github/copilot-instructions.md` | Primary Copilot instructions (auto-read by Copilot) |
| `.github/copilot-context.yml` | **Centralized manifest** - references all context files |
| `.github/context/` | Machine-readable schemas (this directory) |
| `.github/docs/` | Human-readable documentation |
| `.github/prompts/` | Reusable prompt templates |

## 📁 Files in This Directory

### domain-models.json

JSON Schema definitions for all domain entities:

| Entity | Description |
|--------|-------------|
| **User** | User with role and organizational context |
| **Organization** | Multi-tenant organization |
| **Team** | Team within an organization |
| **Rule** | Incentive rule definition |
| **RuleCondition** | Condition within a rule |
| **RuleAction** | Action to execute when conditions are met |
| **Incentive** | Calculated incentive for a user |
| **Target** | Sales or performance target |

### event-schemas/

Event schema definitions for cross-MFE communication via EventBusService:

| File | Events |
|------|--------|
| `auth-events.json` | `auth:login`, `auth:logout`, `auth:token-refreshed`, `auth:session-expired` |
| `user-events.json` | `user:updated`, `user:preferences-changed`, `user:role-changed` |
| `nav-events.json` | `nav:requested`, `mfe:loaded`, `mfe:error`, `mfe:ready` |
| `rule-created.json` | `rule.created` |
| `rule-evaluated.json` | `rule.evaluated` |

## 🔗 Related Files

| Location | Description |
|----------|-------------|
| `.github/docs/ARCHITECTURE.md` | System architecture and patterns |
| `.github/docs/DESIGN_DECISIONS.md` | Architectural Decision Records (ADRs) |
| `.github/docs/ROLES.md` | Role hierarchy and capabilities |
| `.github/docs/API_CONTRACTS.md` | REST API documentation |
| `.github/docs/INCONSISTENCIES.md` | Known discrepancies between code and docs |
| `.github/prompts/` | Prompt templates for common tasks |

## 🤖 Usage with Copilot

These files provide context for code generation:

1. **Type Generation**: Use `domain-models.json` to generate TypeScript interfaces
2. **Event Handling**: Reference event schemas when implementing EventBusService handlers
3. **Validation**: Use schemas for runtime validation of event payloads
4. **Prompt Templates**: Use `.github/prompts/` for consistent code generation

## ⚠️ Known Inconsistencies

See `.github/docs/INCONSISTENCIES.md` for documented discrepancies between code and documentation that need resolution.

## 🔄 Updating Context

When adding new domain models or events:

1. Add/update the appropriate JSON file in this directory
2. Ensure the schema follows JSON Schema draft-07
3. Include examples where helpful
4. Update `.github/copilot-context.yml` manifest
5. If there are code/doc mismatches, document them in `.github/docs/INCONSISTENCIES.md`
