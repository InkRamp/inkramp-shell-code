# Context vs Code Inconsistencies

This document tracks discrepancies between the AI context documentation and the actual codebase. These need to be resolved by either updating the documentation or the code.

> **Generated**: 2024  
> **Status**: All Resolved  
> **Owner**: Development Team

---

## Summary

| ID | Severity | Area | Status |
|----|----------|------|--------|
| INC-001 | 🔴 High | EventBusService API | ✅ Resolved |
| INC-002 | 🔴 High | RoleService Capabilities | ✅ Resolved |
| INC-003 | 🟡 Medium | User Model | ✅ Resolved |
| INC-004 | 🟢 Low | Storage Policy | ✅ Resolved |

---

## Resolved Issues

### INC-001: EventBusService API Mismatch - ✅ RESOLVED

**Severity**: 🔴 High  
**Area**: Cross-MFE Communication  
**Resolution Date**: 2024  
**Resolution**: Implemented `emit()` and `on()` methods

The EventBusService now supports the documented API:

```typescript
// emit() - Emit an event with optional payload
eventBus.emit('user:updated', { userId: '123', name: 'John' });

// on() - Subscribe to an event, returns unsubscribe function
const unsubscribe = eventBus.on('user:updated', (data) => {
  console.log('User updated:', data);
});

// on$() - Subscribe as Observable
eventBus.on$('user:updated').subscribe((data) => {
  console.log('User updated:', data);
});

// sendEvent() - Deprecated but kept for backward compatibility
eventBus.sendEvent('legacy:event');
```

---

### INC-002: RoleService Missing hasCapability() Method - ✅ RESOLVED

**Severity**: 🔴 High  
**Area**: RBAC / Permissions  
**Resolution Date**: 2024  
**Resolution**: Implemented `hasCapability()` method with wildcard support

The RoleService now supports capability-based access control:

```typescript
// Check specific capability
roleService.hasCapability('rule.create');
roleService.hasCapability('rule.update');

// Supports wildcard matching for super admin
// Super admin with 'rule.*' capability can access 'rule.create', 'rule.update', etc.

// Example usage
if (roleService.hasCapability('rule.update')) {
  showEditButton();
}
```

Role capabilities are defined as:
- **SUPER_ADMIN**: `org.*`, `user.*`, `rule.*`, `settings.*`, `dashboard.*`, `team.*`, `target.*`
- **ORG_ADMIN**: `user.create`, `user.manage`, `user.view`, `rule.create`, `rule.update`, `rule.view`, `dashboard.view`, `team.view`, `target.view`, `target.assign`
- **TEAM_LEAD**: `team.view`, `rule.create`, `rule.view`, `target.assign`, `target.view`, `dashboard.team`, `user.view`
- **SALES_EXECUTIVE**: `rule.view`, `dashboard.personal`, `target.view`

---

### INC-003: User Model Missing orgId - ✅ RESOLVED

**Severity**: 🟡 Medium  
**Area**: Data Models  
**Resolution Date**: 2024  
**Resolution**: Added `orgId` property to User interface

The User interface now includes `orgId` for multi-tenancy support:

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgId?: string;   // Added for multi-tenancy
  teamId?: string;
  managerId?: string;
}
```

---

### INC-004: Dev Mimic User Uses localStorage - ✅ RESOLVED

**Severity**: 🟢 Low  
**Area**: Security / Storage  
**Resolution Date**: 2024  
**Resolution**: Changed to sessionStorage for consistency with security policy

The dev mimic user functionality now uses `sessionStorage` instead of `localStorage`:

```typescript
// Updated methods use sessionStorage
private getDevMimicUser(): User | null {
  const mimicUserJson = sessionStorage.getItem('dev_mimic_user');
  // ...
}

setDevMimicUser(user: User | null): void {
  sessionStorage.setItem('dev_mimic_user', JSON.stringify(user));
  // ...
}
```

This ensures consistency with the security policy that all tokens and sensitive data should use sessionStorage.

---

## How to Update This Document

When a new inconsistency is found:

1. Add a new entry with severity, area, and detailed description
2. Include what the documentation says vs. what the code does
3. List resolution options
4. Update the summary table

When resolving an inconsistency:

1. Make the code or documentation change
2. Update the "Status" from "Open" to "✅ Resolved"
3. Add resolution date and description
4. Move the item to the "Resolved Issues" section
