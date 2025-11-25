# Context Directory

This directory contains machine-readable context files for GitHub Copilot and other AI assistants.

## Files

### domain-models.json

JSON Schema definitions for all domain entities:

- **User**: User with role and organizational context
- **Organization**: Multi-tenant organization
- **Team**: Team within an organization
- **Rule**: Incentive rule definition
- **RuleCondition**: Condition within a rule
- **RuleAction**: Action to execute when conditions are met
- **Incentive**: Calculated incentive for a user
- **Target**: Sales or performance target

### event-schemas/

Event schema definitions for cross-MFE communication via EventBusService.

#### Rule Events
- `rule-created.json`: Emitted when a new rule is created
- `rule-evaluated.json`: Emitted when a rule is evaluated

#### Auth Events
- `auth-events.json`: Login, logout, token refresh, session expiry

#### User Events
- `user-events.json`: Profile updates, preference changes, role changes

#### Navigation Events
- `nav-events.json`: Route navigation, MFE lifecycle (loaded, error, ready)

## Usage with Copilot

These files provide context for code generation:

1. **Type Generation**: Use domain-models.json to generate TypeScript interfaces
2. **Event Handling**: Reference event schemas when implementing EventBusService handlers
3. **Validation**: Use schemas for runtime validation of event payloads

## Updating Context

When adding new domain models or events:

1. Add/update the appropriate JSON file
2. Ensure the schema follows JSON Schema draft-07
3. Include examples where helpful
4. Update this README if adding new files

## Integration Scripts

Future: Add scripts to:
- Generate TypeScript types from domain-models.json
- Validate events against schemas at runtime
- Fetch API contracts from OpenAPI spec
