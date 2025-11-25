# Copilot Instructions for i17e-code

## Project Overview

This is an **Angular 18 Micro Frontend (MFE) shell application** using **Module Federation** for a banking/incentive management domain. The shell dynamically loads remote MFEs and provides shared services for authentication, state management, and cross-MFE communication.

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
- **YAGNI**: Don't implement features until needed
- **High Cohesion, Low Coupling**: No direct cross-MFE imports; use EventBus
- **Observable-driven state**: RxJS for reactive programming

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

### Angular
- **Standalone components** preferred over NgModules
- Lazy loading for all routes and MFEs
- OnPush change detection strategy when possible
- Use signals for new reactive state (Angular 17+)

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

### Never Do
1. Direct cross-MFE imports - use EventBusService
2. Store tokens in localStorage - use sessionStorage
3. Log sensitive data (account numbers, passwords, tokens)
4. Bypass AuthService for API calls
5. Use synchronous operations for large datasets

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
│       └── api/              # API service classes
docs/                         # Documentation (not bundled)
```

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
| User roles | `RoleService.hasPermission()` |
| Large lists | `<cdk-virtual-scroll-viewport>` |
| Loading states | Use signals: `loading`, `error`, `data` |
