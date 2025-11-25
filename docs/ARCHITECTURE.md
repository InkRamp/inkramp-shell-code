# Architecture Documentation

## Overview

This document describes the architecture of the i17e Incentive Management System, an Angular 18 Micro Frontend application using Module Federation.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Shell (Host)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │  AuthService │  │ RoleService │  │ EventBus    │  │ BrandContext││
│  │  (Auth0)     │  │ (RBAC)      │  │ (mitt)      │  │ Service     ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
│                              ↕                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    MFE Wrapper Component                       │  │
│  │   - Dynamic loading via Module Federation                      │  │
│  │   - Lazy loading with Intersection Observer                    │  │
│  │   - Multi-MFE support on single page                           │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↕
    ┌─────────────────────────────────────────────────────────────┐
    │                    Remote MFEs                               │
    │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
    │  │ Pokemon │  │My Sales │  │My Report│  │ Other Remotes   │ │
    │  │ (4101)  │  │ (4102)  │  │ (4103)  │  │ (4104+)         │ │
    │  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘ │
    └─────────────────────────────────────────────────────────────┘
                              ↕
    ┌─────────────────────────────────────────────────────────────┐
    │                   Backend / BFF Layer                        │
    │  ┌──────────────────────────────────────────────────────┐   │
    │  │              API Gateway / BFF                        │   │
    │  │  - Aggregates backend services                        │   │
    │  │  - Applies RBAC, feature flags, user preferences      │   │
    │  │  - Caching layer (Redis)                              │   │
    │  └──────────────────────────────────────────────────────┘   │
    │                           ↕                                  │
    │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
    │  │Incentive│  │ Targets │  │ Tasks   │  │  Rules  │         │
    │  │ Service │  │ Service │  │ Service │  │ Service │         │
    │  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
    └─────────────────────────────────────────────────────────────┘
```

---

## Core Services Library (`@org/core-services`)

The shared library provides cross-cutting concerns for all MFEs:

### AuthService
- **Purpose**: OAuth2/OIDC authentication via Auth0
- **Token Storage**: sessionStorage (cleared on tab close)
- **Features**:
  - Login/logout
  - Token refresh
  - Session management
  - Event broadcasting for MFE consumption

### RoleService
- **Purpose**: Role-Based Access Control (RBAC)
- **Features**:
  - User role management
  - Permission checking
  - Feature visibility control

### EventBusService
- **Purpose**: Cross-MFE communication
- **Implementation**: mitt (lightweight event emitter)
- **Pattern**: Pub/Sub for decoupled communication
- **Events**:
  - `auth:login`, `auth:logout`, `auth:token-refreshed`
  - `user:updated`, `user:preferences-changed`
  - `navigation:requested`
  - Custom MFE-specific events

### BrandContextService
- **Purpose**: Multi-tenant brand context
- **Features**:
  - Brand-specific theming
  - Logo/asset loading
  - Configuration per tenant

### API Services
- **IncentiveRulesService**: Manage incentive rules
- **IncentivesService**: Track incentives
- **TargetsService**: Sales targets management
- **TasksService**: Task assignment and tracking

---

## Module Federation Configuration

### Host (Shell) - Port 4100
```typescript
// webpack.config.js
module.exports = {
  remotes: {
    // Remotes are loaded dynamically at runtime
  },
  shared: share({
    "@angular/core": { singleton: true, strictVersion: true },
    "@angular/common": { singleton: true, strictVersion: true },
    "@angular/router": { singleton: true, strictVersion: true },
    "rxjs": { singleton: true, strictVersion: true },
    "@org/core-services": { singleton: true, strictVersion: true }
  })
};
```

### Remote (Example: Pokemon) - Port 4101
```typescript
// webpack.config.js
module.exports = {
  exposes: {
    './Module': './src/app/remote-entry/entry.module.ts'
  },
  shared: share({
    // Same shared dependencies
  })
};
```

---

## Authentication Flow

```
1. User clicks Login
          ↓
2. AuthService.login() → Auth0 redirect
          ↓
3. Auth0 authenticates user
          ↓
4. Callback with authorization code
          ↓
5. AuthService exchanges code for tokens
          ↓
6. Tokens stored in sessionStorage
          ↓
7. EventBusService.emit('auth:login', user)
          ↓
8. All MFEs receive auth event
          ↓
9. API calls include token via HttpInterceptor
```

---

## Data Flow Patterns

### API Service Pattern
```typescript
Component → Service → HttpClient → BFF → Backend Service
    ↑                                           ↓
    └─────────── Response with data ────────────┘
```

### Cross-MFE Communication Pattern
```typescript
MFE-A                    Shell                    MFE-B
  │                        │                        │
  │ emit('event', data)    │                        │
  │─────────────────────→ │                        │
  │                        │ broadcast to listeners │
  │                        │──────────────────────→│
  │                        │                        │ handle event
```

---

## Performance Optimizations

### Lazy Loading
- MFEs loaded on-demand via Intersection Observer
- Route-based code splitting
- Preloading strategies for predicted navigation

### Virtual Scrolling
- Large lists use `<cdk-virtual-scroll-viewport>`
- Renders only visible items
- Essential for transaction lists, account histories

### Web Workers
- Offload heavy processing (data transformations, calculations)
- Keep main thread responsive

### Caching Strategy
- Browser: Service Worker for static assets
- BFF: Redis for frequently accessed data
- Client: IndexedDB for offline support

---

## Security Considerations

### Token Management
- sessionStorage only (not localStorage)
- Short-lived access tokens with refresh
- Automatic token refresh before expiry

### Data Protection
- Sensitive data masking in logs
- PCI DSS compliance for card data
- GDPR compliance for user data

### XSS/CSRF Prevention
- Angular's built-in sanitization
- HTTP-only cookies where applicable
- CORS configuration on BFF

---

## Folder Structure

```
i17e-code/
├── .github/
│   ├── copilot-instructions.md   # Copilot context
│   └── workflows/                 # CI/CD pipelines
├── docs/                          # Documentation
├── projects/
│   └── core-services/             # Shared library
│       └── src/
│           ├── lib/
│           │   ├── auth.service.ts
│           │   ├── role.service.ts
│           │   ├── event-bus.service.ts
│           │   ├── brand-context.service.ts
│           │   └── api/
│           │       ├── api.config.ts
│           │       ├── incentive-rules.service.ts
│           │       ├── incentives.service.ts
│           │       ├── targets.service.ts
│           │       └── tasks.service.ts
│           └── public-api.ts
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── mfe-wrapper/       # Dynamic MFE loader
│   │   ├── guards/
│   │   ├── pages/
│   │   └── app.routes.ts
│   ├── assets/
│   └── environments/
├── angular.json
├── package.json
├── tsconfig.json
└── webpack.config.js
```

---

## Development Workflow

### Local Development
1. `npm install` - Install dependencies
2. `npm start` - Start shell on port 4200
3. `npm run run:all` - Start all MFEs

### Adding a New MFE
1. Create Angular app with Module Federation
2. Configure `exposes` in webpack.config.js
3. Add remote configuration to shell
4. Import shared services from `@org/core-services`

### Testing
- `npm test` - Run unit tests with Karma
- `npm run e2e` - Run E2E tests (if configured)

---

## ADR (Architectural Decision Records)

### ADR-001: sessionStorage over localStorage
**Decision**: Use sessionStorage for token storage
**Rationale**: Tokens cleared on tab/browser close; reduces session hijacking risk
**Consequences**: Users must re-authenticate after closing browser

### ADR-002: Event Bus over Direct Imports
**Decision**: Use mitt-based EventBusService for cross-MFE communication
**Rationale**: Decouples MFEs; works in both standalone and federated modes
**Consequences**: Event contracts must be documented; no compile-time type checking

### ADR-003: BFF Pattern for Backend
**Decision**: Implement Backend-for-Frontend layer
**Rationale**: Aggregate services; apply UI-specific logic; cache for performance
**Consequences**: Additional layer to maintain; potential latency

---

## Future Considerations

- **GraphQL**: Consider for complex data requirements
- **Server-Side Rendering**: For SEO if customer-facing pages needed
- **PWA**: Offline support with Service Workers
- **Micro-Frontend Orchestrator**: For complex routing scenarios
