# Copilot Instructions for i17e-code

## Project Overview

This is an **Angular 18 Micro Frontend (MFE) shell application** using **Module Federation** for a multi-tenant SaaS incentive rules platform. The shell dynamically loads remote MFEs and provides shared services for authentication, state management, and cross-MFE communication.

### Domain Context
Multi-tenant SaaS for incentive rules management with concentric role hierarchy:
- **Super-Admin** ⊃ **Org-Admin** ⊃ **Team Lead** ⊃ **Sales Executive**

See `docs/ROLES.md` for detailed role permissions and capability-based access model.

---

## Architecture Principles

### Module Federation
- **Dynamic loading** of remote MFEs via `@angular-architects/module-federation`
- Shell acts as host; remotes can run standalone or federated
- Lazy loading with Intersection Observer for performance
- Prioritized loading for critical MFEs

### Core Services Library (`@org/core-services`)
- **AuthService**: Auth0 OAuth2/OIDC authentication with sessionStorage
- **RoleService**: RBAC and user permissions
- **BrandContextService**: Multi-tenant brand context
- **EventBusService**: Cross-MFE communication (mitt-based)
- **API Services**: IncentiveRules, Incentives, Targets, Tasks

### Design Principles
- **SOLID**: Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion
- **DRY**: Don't repeat yourself, but favor clarity when trade-offs arise
- **YAGNI**: Don't implement features until needed
- **High Cohesion, Low Coupling**: No direct cross-MFE imports; use EventBus
- **Observable-driven state**: RxJS for reactive programming
- **Composition over Inheritance**: Prefer small, composable utilities and components

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 18.2.x | Frontend framework |
| TypeScript | ~5.4.x | Type safety |
| RxJS | ~7.8.x | Reactive programming |
| Auth0 SPA JS | ^2.8.0 | OAuth2/OIDC authentication |
| Module Federation | ^18.0.6 | Micro Frontend architecture |
| mitt | ^3.0.1 | Event bus for cross-MFE communication |

---

## Code Standards

### TypeScript
- Strict mode enabled
- Explicit types for all public APIs
- No `any` unless absolutely necessary
- Use interfaces for data contracts
- Use async/await with typed results

### Angular
- **Standalone components** preferred over NgModules
- Lazy loading for all routes and MFEs
- OnPush change detection strategy when possible
- Use signals for new reactive state (stable in Angular 17+)
- Keep functions < 40 lines when possible
- Prefer simple, declarative code over nested conditionals

### Code Style
- Prefer array helpers and declarative abstractions over imperative loops
- Keep UI stateless except in MFE local state; lift state to shell only if cross-MFE communication required
- Use folder-per-feature structure in MFEs
- Use typed interfaces defined in `projects/core-services/src/lib/models/`

### Security
- **sessionStorage** for tokens (NOT localStorage)
- Tokens cleared on tab/browser close
- All API calls through centralized services with automatic token injection
- CSRF/XSS protection via Angular's built-in sanitization

### Performance
- Virtual scrolling for large datasets (`@angular/cdk/scrolling`)
- Web Workers for heavy processing
- Skeleton loaders for perceived performance
- Predictive prefetching based on user navigation

---

## Responsive Design & UI Tokens

### Breakpoints
- `--bp-sm`: up to 480px (mobile)
- `--bp-md`: 481px — 768px (tablet)
- `--bp-lg`: 769px and above (desktop)

### Spacing Tokens
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px

### Usage
```scss
// Use tokens, not hardcoded values
.container {
  padding: var(--space-3);
  
  @media (max-width: var(--bp-sm)) {
    padding: var(--space-2);
  }
}
```

---

## Banking Domain Context

This application operates in the **banking/financial services domain**:

### Compliance Requirements
- **PCI DSS**: Mask sensitive data (account numbers, card numbers)
- **GDPR**: Data privacy and user consent
- **Audit trails**: Log all critical user actions
- **Data retention**: Follow regulatory retention policies

### Data Handling
- Large datasets: transactions, account histories, loan portfolios
- Virtual scrolling and pagination for performance
- Offline caching for frequently accessed data
- Anonymize/redact sensitive data in logs and telemetry

### User Types
- **Bank employees** (internal): Full feature access based on role
- **Customers** (external): Limited, customer-facing views
- **Admins**: System configuration and user management

---

## When Generating Code

### Always Do
1. Use **standalone components** with proper imports
2. Implement proper **error handling** with user-friendly messages
3. Follow existing patterns in `projects/core-services`
4. Include **TypeScript types** for all parameters and return values
5. Add **JSDoc comments** for public APIs and complex logic
6. Use **RxJS operators** correctly (takeUntilDestroyed, async pipe)
7. Implement **loading states** and error states for async operations
8. Add unit tests (Jasmine/Karma) for all business logic
9. Use capability-based permission checks over role string checks
10. Reference domain models from `context/domain-models.json`

### Never Do
1. Direct cross-MFE imports - use EventBusService
2. Store tokens in localStorage - use sessionStorage
3. Log sensitive data (account numbers, passwords, tokens)
4. Bypass AuthService for API calls
5. Use synchronous operations for large datasets
6. Hardcode styles - use SCSS tokens
7. Add try/catch at UI level - bubble errors to error boundary

---

## File Organization

```
src/
├── app/
│   ├── components/           # Shared UI components
│   ├── services/             # App-level services
│   ├── guards/               # Route guards
│   └── pages/                # Page components
projects/
├── core-services/            # Shared library (@org/core-services)
│   └── src/lib/
│       ├── auth.service.ts
│       ├── role.service.ts
│       ├── event-bus.service.ts
│       ├── models/           # TypeScript interfaces
│       └── api/              # API service classes
docs/                         # Documentation (not bundled)
├── ARCHITECTURE.md
├── DESIGN_DECISIONS.md
├── ROLES.md
├── API_CONTRACTS.md
context/                      # Machine-readable context
├── domain-models.json
└── event-schemas/
.github/
├── copilot-instructions.md   # This file
└── prompts/                  # Prompt templates
```

---

## Shell Responsibilities

- **Authentication**: OIDC/JWT via Auth0, token refresh
- **Routing**: Route guards, lazy loading MFEs
- **Theme**: SCSS tokens, brand context
- **Event Bus**: Cross-MFE communication via EventBusService
- **Error Boundary**: Global error handling and notifications
- **PWA**: Service worker, offline caching (future)

## MFE Responsibilities

- **Own UI views**: Fetch business data via centralized services
- **Export**: Mount function and route metadata
- **Local state**: Keep state local; use EventBus for cross-MFE ops
- **Tests**: Business logic must have unit tests
- **Standalone**: Must be runnable independently for development

---

## Example Patterns

### Creating a new API Service
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_CONFIG } from './api.config';

@Injectable({ providedIn: 'root' })
export class MyNewService {
  private readonly http = inject(HttpClient);
  
  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${API_CONFIG.baseUrl}/items`).pipe(
      catchError(error => {
        console.error('Failed to fetch items:', error);
        return throwError(() => new Error('Unable to load items'));
      })
    );
  }
}
```

### Cross-MFE Communication
```typescript
import { inject } from '@angular/core';
import { EventBusService } from '@org/core-services';

// Emit event
const eventBus = inject(EventBusService);
eventBus.emit('user:updated', { userId: '123', name: 'John' });

// Listen for event
eventBus.on('user:updated', (data) => {
  console.log('User updated:', data);
});
```

### Component with Loading State
```typescript
import { Component, signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-my-component',
  standalone: true,
  template: `
    @if (loading()) {
      <app-skeleton-loader />
    } @else if (error()) {
      <app-error-message [message]="error()" />
    } @else {
      <div>{{ data() | json }}</div>
    }
  `
})
export class MyComponent {
  private readonly service = inject(MyService);
  
  loading = signal(true);
  error = signal<string | null>(null);
  data = signal<Data | null>(null);
  
  ngOnInit() {
    this.service.getData().subscribe({
      next: (result) => {
        this.data.set(result);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
}
```

---

## Testing Guidelines

- Unit tests with Jasmine/Karma
- Test services with dependency injection mocks
- Test components with `TestBed.configureTestingModule`
- Mock HTTP calls with `HttpClientTestingModule`
- Test RBAC with different user roles

---

## i18n/l10n Support

- Use Angular's built-in i18n or ngx-translate
- Locale-specific formatting for dates, currency, numbers
- Dynamically load language packs per user preference
- Support RTL languages if needed

---

## Telemetry & Monitoring

- Centralized in shell; remotes push events through shell
- Capture: load times, user interactions, errors
- Mask sensitive data before logging
- Use Web Workers for off-main-thread processing
- Guarantee delivery with retry queue for poor network

---

## Quick Reference

| Task | Pattern/Location |
|------|------------------|
| Authentication | `AuthService` in `@org/core-services` |
| API calls | Create service in `projects/core-services/src/lib/api/` |
| Cross-MFE events | `EventBusService.emit()` / `.on()` |
| User roles | `RoleService.hasRole()` / `.hasCapability()` |
| Large lists | `<cdk-virtual-scroll-viewport>` |
| Loading states | Use signals: `loading`, `error`, `data` |
| New MFE | See `.github/prompts/generate-mfe.md` |
| New API service | See `.github/prompts/create-api-service.md` |
| Rule service | See `.github/prompts/create-rule-service.md` |
| Domain models | `context/domain-models.json` |
| Event schemas | `context/event-schemas/` |

---

## Related Documentation

- `.github/copilot-context.yml` - **Centralized context manifest** (start here)
- `docs/ARCHITECTURE.md` - System architecture and patterns
- `docs/DESIGN_DECISIONS.md` - ADRs and design rationale
- `docs/ROLES.md` - Role hierarchy and capabilities
- `docs/API_CONTRACTS.md` - API endpoint documentation
- `docs/INCONSISTENCIES.md` - Known discrepancies between docs and code
