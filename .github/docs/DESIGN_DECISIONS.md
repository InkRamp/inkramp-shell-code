# Design Decisions

This document captures key architectural and design decisions for the i17e Incentive Management System.

---

## ADR-001: sessionStorage over localStorage

**Date**: 2024

**Status**: Accepted

**Context**: Need to store authentication tokens client-side for API calls.

**Decision**: Use sessionStorage for token storage instead of localStorage.

**Rationale**:
- Tokens cleared automatically when tab/browser closes
- Reduces session hijacking risk from XSS attacks
- Aligns with banking security best practices
- Tokens don't persist across browser restarts

**Consequences**:
- Users must re-authenticate after closing browser
- Cannot maintain sessions across browser tabs (each tab has own session)
- Better security posture for banking domain

---

## ADR-002: Event Bus over Direct Imports

**Date**: 2024

**Status**: Accepted

**Context**: Need communication between independently deployed Micro Frontends.

**Decision**: Use mitt-based EventBusService for cross-MFE communication instead of direct imports.

**Rationale**:
- Decouples MFEs from each other
- Works in both standalone and federated modes
- Allows MFEs to be developed and tested independently
- Supports late-binding (target MFE may not be loaded yet)

**Consequences**:
- Event contracts must be documented
- No compile-time type checking for event payloads
- Need runtime validation of event data
- Small learning curve for new developers

**Alternatives Considered**:
- Direct imports: Rejected due to coupling
- Redux/NgRx: Rejected as too heavy for cross-MFE use case
- postMessage: Considered for cross-origin scenarios

---

## ADR-003: BFF Pattern for Backend

**Date**: 2024

**Status**: Accepted

**Context**: Frontend needs data from multiple backend microservices.

**Decision**: Implement Backend-for-Frontend (BFF) layer.

**Rationale**:
- Aggregate data from multiple services in one call
- Apply UI-specific transformations
- Implement caching for performance
- Handle RBAC at gateway level
- Simplify frontend API consumption

**Consequences**:
- Additional layer to maintain
- Potential latency from extra hop
- Need to keep BFF in sync with backend changes

---

## ADR-004: Angular Standalone Components

**Date**: 2024

**Status**: Accepted

**Context**: Angular 18 supports both NgModules and standalone components.

**Decision**: Use standalone components as the default pattern.

**Rationale**:
- Simpler mental model (no NgModule boilerplate)
- Better tree-shaking potential
- Aligns with Angular's recommended direction
- Easier to understand component dependencies

**Consequences**:
- Must explicitly import all dependencies in each component
- Some third-party libraries may still require NgModule

---

## ADR-005: Signal-Based State Management

**Date**: 2024

**Status**: Accepted

**Context**: Need reactive state management for UI components.

**Decision**: Use Angular Signals for component-level state; RxJS for service-level streams.

**Rationale**:
- Signals are simpler for UI state (loading, error, data)
- Better performance with fine-grained reactivity
- RxJS still best for async operations and streams
- No need for external state management library

**Consequences**:
- Mixed mental model (signals + observables)
- Need conversion utilities (toSignal, toObservable)
- Team needs to understand when to use each

---

## ADR-006: Module Federation for MFE Architecture

**Date**: 2024

**Status**: Accepted

**Context**: Need to support independent deployment of frontend features.

**Decision**: Use @angular-architects/module-federation for micro-frontend architecture.

**Rationale**:
- Native webpack support
- Good Angular integration
- Shared dependencies (singleton Angular, RxJS)
- Dynamic remote loading
- Supports standalone and federated development

**Consequences**:
- Webpack configuration complexity
- Version alignment required for shared deps
- Build configuration overhead
- Need careful shared singleton management

---

## ADR-007: Auth0 for Authentication

**Date**: 2024

**Status**: Accepted

**Context**: Need secure, scalable authentication with OIDC support.

**Decision**: Use Auth0 SPA SDK for authentication.

**Rationale**:
- Enterprise-grade security
- Built-in token refresh
- Social/SSO login support
- Good Angular integration
- Reduces auth implementation burden

**Consequences**:
- Vendor dependency
- Subscription costs at scale
- Need to handle offline scenarios
- Custom claims require Auth0 rules/actions

---

## ADR-008: Capability-Based Access Control

**Date**: 2024

**Status**: Accepted

**Context**: Need flexible permission system beyond simple role checks.

**Decision**: Implement capability-based permission checks alongside role hierarchy.

**Rationale**:
- More granular control than role-only checks
- Easier to add new permissions without role changes
- Decouples UI from role names
- Supports feature flags integration

**Consequences**:
- More capabilities to manage
- Need capability documentation
- Slightly more complex permission logic

**Pattern**:
```typescript
// Role check for hierarchy
roleService.hasRole(UserRole.TEAM_LEAD);

// Capability check for specific actions
roleService.hasCapability('rule.create');
```

---

## ADR-009: SCSS Design Tokens

**Date**: 2024

**Status**: Accepted

**Context**: Need consistent theming across shell and MFEs.

**Decision**: Use SCSS with CSS custom properties for design tokens.

**Rationale**:
- CSS variables work across framework boundaries
- Runtime theme switching possible
- Consistent spacing, colors, breakpoints
- Browser-native solution

**Consequences**:
- Must define and document all tokens
- MFEs must use tokens, not hardcoded values
- Need build-time processing for SCSS

---

## ADR-010: Three Breakpoint System

**Date**: 2024

**Status**: Accepted

**Context**: Need responsive design across devices.

**Decision**: Use three breakpoints: small (mobile), medium (tablet), large (desktop).

**Breakpoints** (defined in `src/styles.scss` or shared tokens file):
- `--bp-sm`: up to 480px (mobile)
- `--bp-md`: 481px — 768px (tablet)  
- `--bp-lg`: 769px and above (desktop)

**Rationale**:
- Covers primary device categories
- Simple to reason about
- Aligns with common industry patterns
- Sufficient for banking application UI

**Consequences**:
- Must test at all three sizes
- Complex layouts may need additional breakpoints
- All breakpoint values defined in single source of truth

---

## ADR-011: Virtual Scrolling for Large Lists

**Date**: 2024

**Status**: Accepted

**Context**: Banking data includes large lists (transactions, accounts).

**Decision**: Use Angular CDK virtual scrolling for lists > 100 items.

**Rationale**:
- Renders only visible items
- Maintains smooth scrolling
- Essential for mobile performance
- Built into Angular CDK

**Consequences**:
- Additional complexity in component setup
- Need item height estimation
- Some CSS limitations

---

## ADR-012: Error Boundary Pattern

**Date**: 2024

**Status**: Accepted

**Context**: Need graceful error handling across MFEs.

**Decision**: Implement global error boundary in shell; MFEs handle local errors.

**Rationale**:
- Prevents single MFE crash from affecting whole app
- Centralized error reporting
- Consistent error UI
- Fallback content for failed MFEs

**Consequences**:
- Need to define error boundary UI
- Must propagate meaningful error info
- Cannot catch all async errors

---

## Decision Template

```markdown
## ADR-XXX: [Title]

**Date**: YYYY-MM-DD

**Status**: Proposed | Accepted | Deprecated | Superseded

**Context**: [What is the problem or requirement?]

**Decision**: [What was decided?]

**Rationale**: [Why was this chosen?]

**Consequences**: [What are the implications?]

**Alternatives Considered**: [What else was evaluated?]
```
