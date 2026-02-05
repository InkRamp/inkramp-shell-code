# Copilot Instructions for i17e-code

> **All context is centralized in `.github/copilot-context.yml`** - that file contains domain models, event schemas, role definitions, and configuration.

## Project Overview

**Angular 18 Micro Frontend shell** using **Module Federation** for a multi-tenant SaaS incentive rules platform.

**Role Hierarchy** (concentric): Super-Admin ⊃ Org-Admin ⊃ Team Lead ⊃ Sales Executive

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 18.2.x | Frontend framework |
| TypeScript | ~5.4.x | Type safety |
| RxJS | ~7.8.x | Reactive programming |
| Auth0 SPA JS | ^2.8.0 | Authentication (sessionStorage only) |
| Module Federation | ^18.0.6 | Micro Frontend architecture |
| mitt | ^3.0.1 | Event bus for cross-MFE communication |

## Core Services

**Location**: `src/_temp-shared/` (temporary structure)

⚠️ **Note**: These services are in a temporary location and will be migrated to either:
- External package: `@opensourcekd/ng-common-libs` (for reuse across projects)
- Core application: Integrated directly into src/app (for project-specific code)

**Current Import Paths**:
- `@org/core-services` (legacy, still works for services not yet in package)
- `@opensourcekd/ng-common-libs` (npm package for AuthService, EventBusService)

**Key Services**:
- **AuthService**: Auth0 OAuth2/OIDC with sessionStorage (from `@opensourcekd/ng-common-libs`)
- **RoleService**: RBAC and user permissions (from `@org/core-services`)
- **EventBusService**: Cross-MFE communication (from `@opensourcekd/ng-common-libs`)
- **MfeLoaderService**: Dynamic MFE loading (from `@org/core-services`)
- **DummyDataService**: Mock data for development (from `@org/core-services`)

## Code Standards

### Always Do
1. Use **standalone components** with proper imports
2. Implement proper **error handling** with user-friendly messages
3. Include **TypeScript types** for all public APIs
4. Use **RxJS operators** correctly (takeUntilDestroyed, async pipe)
5. Implement **loading states** and error states for async operations
6. Use **sessionStorage** for tokens (NOT localStorage)

### Never Do
1. Direct cross-MFE imports - use EventBusService
2. Store tokens in localStorage
3. Log sensitive data (passwords, tokens, account numbers)
4. Bypass AuthService for API calls
5. Hardcode styles - use SCSS tokens

## File Organization

```
src/
  ├── app/                      # Shell application
  ├── _temp-shared/             # ⚠️ TEMPORARY: Shared services (to be migrated)
  │   ├── role.service.ts
  │   ├── mfe-loader.service.ts
  │   ├── user-profile.service.ts
  │   ├── dummy-data.service.ts
  │   ├── models/               # TypeScript interfaces
  │   ├── config/               # API configs
  │   └── interceptors/         # HTTP interceptors
  └── configs/                  # MFE configurations
.github/
  ├── copilot-context.yml       # Centralized context manifest
  ├── copilot-instructions.md   # This file
  ├── context/                  # Machine-readable context
  │   ├── domain-models.json
  │   └── event-schemas/
  ├── docs/                   # Documentation
  │   ├── ARCHITECTURE.md
  │   ├── DESIGN_DECISIONS.md
  │   ├── ROLES.md
  │   ├── API_CONTRACTS.md
  │   └── INCONSISTENCIES.md
  └── prompts/                # Prompt templates
```

## Example Patterns

### API Service
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_CONFIG } from '@opensourcekd/ng-common-libs';  // or '@org/core-services'

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

### Component with Loading State
```typescript
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
      next: (result) => { this.data.set(result); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }
}
```

## Quick Reference

| Task | Location |
|------|----------|
| Authentication | `AuthService` from `@opensourcekd/ng-common-libs` package |
| API calls | `src/_temp-shared/config/api.config.ts` |
| Cross-MFE events | `EventBusService` from `@opensourcekd/ng-common-libs` package |
| User roles/permissions | `RoleService` in `src/_temp-shared/` |
| Domain models | `.github/context/domain-models.json` |
| Event schemas | `.github/context/event-schemas/` |
| Architecture | `.github/docs/ARCHITECTURE.md` |
| Design decisions | `.github/docs/DESIGN_DECISIONS.md` |
| Roles & permissions | `.github/docs/ROLES.md` |
| API contracts | `.github/docs/API_CONTRACTS.md` |
| Known issues | `.github/docs/INCONSISTENCIES.md` |
| Prompt templates | `.github/prompts/`
