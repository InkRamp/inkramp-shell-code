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
- `@org/core-services` (legacy, still works)
- `@opensourcekd/ng-common-libs` (future package name)

**Key Services**:
- **AuthService**: Auth0 OAuth2/OIDC with sessionStorage
- **RoleService**: RBAC and user permissions
- **EventBusService**: Cross-MFE communication (mitt-based)
- **MfeLoaderService**: Dynamic MFE loading
- **DummyDataService**: Mock data for development

## Auth Journey Requirements

**Every feature that involves authentication MUST account for all default journeys:**

| Journey | EventBus event | Required handling |
|---------|---------------|-------------------|
| Successful login (OAuth callback) | `auth:login_success` | Use `NgZone.run()` to trigger CD; navigate to `returnTo` only if explicitly set |
| Login failure | `auth:login_failure` | Use `NgZone.run()` to trigger CD; do NOT redirect (preserves non-auth query params) |
| Logout | `auth:logout` | Navigate home inside `NgZone.run()` |
| Session expired | `auth:session_expired` | Clear nav state; redirect to login |
| Token refreshed | `auth:token_updated` | No UI change required (transparent) |

### EventBus Auth Subscription Pattern

Any shell component that shows auth-gated UI (e.g. navigation, user profile) **must**:

1. Subscribe to `user$` (for in-zone state changes, e.g. on page load from sessionStorage)
2. Subscribe to the relevant EventBus auth events (for out-of-zone changes, e.g. OAuth callback)
3. Store every subscription in a `Subscription` composite and call `unsubscribe()` in `ngOnDestroy`

```typescript
// In ngOnInit — dual subscription for complete coverage
this.subscriptions.add(
  this.authService.user$.subscribe(user => { /* update state */ })
);
this.subscriptions.add(
  this.eventBus.on('auth:login_success').subscribe(() => { /* refresh nav */ })
);
this.subscriptions.add(
  this.eventBus.on('auth:logout').subscribe(() => { /* clear nav */ })
);
this.subscriptions.add(
  this.eventBus.on('auth:login_failure').subscribe(() => { /* clear nav */ })
);
this.subscriptions.add(
  this.eventBus.on('auth:session_expired').subscribe(() => { /* clear nav, redirect */ })
);

// In ngOnDestroy
ngOnDestroy(): void {
  this.subscriptions.unsubscribe();
}
```

### OAuth Callback Handling (AppComponent)

The OAuth redirect lands back at the app root with `?code=`. After calling
`authService.handleCallback()`, the `auth:login_success` EventBus event fires.

**URL cleanup is handled automatically**: `AuthService.handleCallback()` internally calls
`cleanupCallbackUrl()` which uses `window.history.replaceState` to remove **only** the
Auth0-specific `code` and `state` parameters, preserving all other query params.

**Change detection without redirects**: Use `NgZone.run()` (injected from `@angular/core`)
to force Angular change detection in-place. Navigate to `returnTo` only when the login
flow explicitly recorded a target route via `appState`; never add a default redirect
that would discard non-auth query params.

```typescript
private ngZone = inject(NgZone);

// Subscribe BEFORE calling handleCallback so the event is never missed
this.subscriptions.add(
  this.eventBus.on<{ appState?: { returnTo?: string } }>('auth:login_success').subscribe(payload => {
    this.ngZone.run(() => {
      // handleCallback() already removed code/state via history.replaceState.
      // Navigate to returnTo only if explicitly set by the login flow.
      const returnTo = payload?.appState?.returnTo;
      if (returnTo) {
        this.router.navigate([returnTo], { replaceUrl: true });
      }
      // Without returnTo, stay on current URL — ngZone.run() alone triggers CD.
    });
  })
);

this.subscriptions.add(
  this.eventBus.on('auth:logout').subscribe(() => {
    this.ngZone.run(() => this.router.navigate(['/'], { replaceUrl: true }));
  })
);

this.subscriptions.add(
  this.eventBus.on<{ error: string }>('auth:login_failure').subscribe(() => {
    // Run in zone to trigger CD — do NOT redirect (preserves non-auth query params).
    // The empty callback is intentional: entering NgZone is enough to schedule CD.
    this.ngZone.run(() => { /* triggers Angular change detection; no navigation needed */ });
  })
);

if (window.location.search.includes('code=')) {
  try {
    await this.authService.handleCallback();
    // On success: auth:login_success fires above, ngZone.run() triggers CD.
  } catch (error) {
    // The library emits auth:login_failure via EventBus for internal errors.
    // Do NOT redirect here — that would discard non-auth query params.
    console.error('Auth callback failed:', error);
  }
}
```

## Code Standards

### Always Do
1. Use **standalone components** with proper imports
2. Implement proper **error handling** with user-friendly messages
3. Include **TypeScript types** for all public APIs
4. Use **RxJS operators** correctly (takeUntilDestroyed, async pipe)
5. Implement **loading states** and error states for async operations
6. Use **sessionStorage** for tokens (NOT localStorage)
7. Handle **all auth journeys** (login success/failure, logout, session expiry) — see Auth Journey Requirements above

### Never Do
1. Direct cross-MFE imports - use EventBusService
2. Store tokens in localStorage
3. Log sensitive data (passwords, tokens, account numbers)
4. Bypass AuthService for API calls
5. Hardcode styles - use SCSS tokens
6. Rely solely on `user$` for auth-gated UI — **always pair it with EventBus auth event subscriptions**
7. Use `Router.navigate()` as the sole mechanism to trigger change detection after auth events — use `NgZone.run()` instead so non-auth query params are not discarded
8. Add a default redirect in the auth callback error path — this discards non-auth query params; the library emits `auth:login_failure` via EventBus which is sufficient

## File Organization

```
src/
  ├── app/                      # Shell application
  ├── _temp-shared/             # ⚠️ TEMPORARY: Shared services (to be migrated)
  │   ├── auth.service.ts
  │   ├── role.service.ts
  │   ├── event-bus.service.ts
  │   ├── models/               # TypeScript interfaces
  │   ├── config/               # Auth0 & API configs
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
| Authentication | `AuthService` in `src/_temp-shared/` |
| API calls | `src/_temp-shared/config/api.config.ts` |
| Cross-MFE events | `EventBusService` in `src/_temp-shared/` |
| User roles/permissions | `RoleService` in `src/_temp-shared/` |
| Domain models | `.github/context/domain-models.json` |
| Event schemas | `.github/context/event-schemas/` |
| Architecture | `.github/docs/ARCHITECTURE.md` |
| Design decisions | `.github/docs/DESIGN_DECISIONS.md` |
| Roles & permissions | `.github/docs/ROLES.md` |
| API contracts | `.github/docs/API_CONTRACTS.md` |
| Known issues | `.github/docs/INCONSISTENCIES.md` |
| Prompt templates | `.github/prompts/`
