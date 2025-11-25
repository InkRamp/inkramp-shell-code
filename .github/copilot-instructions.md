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

## Core Services (`@org/core-services`)

- **AuthService**: Auth0 OAuth2/OIDC with sessionStorage
- **RoleService**: RBAC and user permissions
- **EventBusService**: Cross-MFE communication (mitt-based)
- **API Services**: IncentiveRules, Incentives, Targets, Tasks

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
src/app/                      # Shell application
projects/core-services/       # Shared library (@org/core-services)
  └── src/lib/
      ├── auth.service.ts
      ├── role.service.ts
      ├── event-bus.service.ts
      ├── models/             # TypeScript interfaces
      └── api/                # API service classes
.github/
  ├── copilot-context.yml     # Centralized context (domain models, events, roles)
  ├── copilot-instructions.md # This file
  └── prompts/                # Prompt templates
```

## Example Patterns

### API Service
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
| Authentication | `AuthService` in `@org/core-services` |
| API calls | `projects/core-services/src/lib/api/` |
| Cross-MFE events | `EventBusService` |
| User roles/permissions | `RoleService` |
| Domain models | `.github/copilot-context.yml` |
| Event schemas | `.github/copilot-context.yml` |
| Prompt templates | `.github/prompts/`
