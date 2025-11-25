# Context vs Code Inconsistencies

This document tracks discrepancies between the AI context documentation and the actual codebase. These need to be resolved by either updating the documentation or the code.

> **Generated**: 2024  
> **Status**: Review Required  
> **Owner**: Development Team

---

## Summary

| ID | Severity | Area | Status |
|----|----------|------|--------|
| INC-001 | 🔴 High | EventBusService API | Open |
| INC-002 | 🔴 High | RoleService Capabilities | Open |
| INC-003 | 🟡 Medium | User Model | Open |
| INC-004 | 🟢 Low | Storage Policy | Open |

---

## INC-001: EventBusService API Mismatch

**Severity**: 🔴 High  
**Area**: Cross-MFE Communication

### What the Documentation Says

In `.github/copilot-instructions.md` and `.github/prompts/cross-mfe-communication.md`:

```typescript
// Documentation describes this API:
eventBus.emit('user:updated', { userId: '123', name: 'John' });

eventBus.on('user:updated', (data) => {
  console.log('User updated:', data);
});
```

### What the Code Actually Does

In `projects/core-services/src/lib/event-bus.service.ts`:

```typescript
// Actual implementation:
sendEvent(s: string) {
  this.emitter.emit(s);
}
```

### Impact
- Documentation suggests `emit()` and `on()` methods that don't exist
- Actual API uses `sendEvent(s: string)` with only string parameter
- No `on()` method exposed - uses `onePlusNEvents` ReplaySubject instead

### Resolution Options

**Option A: Update Code** (Recommended)
- Add `emit(event: string, payload?: any)` method
- Add `on(event: string, handler: Function)` method
- Keep backward compatibility with `sendEvent()`

**Option B: Update Documentation**
- Change examples to use `sendEvent(JSON.stringify({...}))`
- Document subscription via `onePlusNEvents.subscribe()`

---

## INC-002: RoleService Missing hasCapability() Method

**Severity**: 🔴 High  
**Area**: RBAC / Permissions

### What the Documentation Says

In `docs/ROLES.md` and `.github/copilot-instructions.md`:

```typescript
// Documentation describes:
roleService.hasCapability('rule.create');
roleService.hasCapability('rule.update');

// Recommended pattern:
if (roleService.hasCapability('rule.update')) {
  showEditButton();
}
```

### What the Code Actually Has

In `projects/core-services/src/lib/role.service.ts`:

```typescript
// Available methods:
hasRole(requiredRole: UserRole): boolean
hasAnyRole(roles: UserRole[]): boolean
isAdmin(): boolean
isTeamLeadOrHigher(): boolean
canViewOthersData(): boolean
```

### Impact
- `hasCapability()` method does not exist
- Capability-based access control is documented but not implemented
- Code uses role-based checks only

### Resolution Options

**Option A: Implement hasCapability()** (Recommended)
```typescript
// Add to RoleService:
private readonly roleCapabilities: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: ['org.*', 'user.*', 'rule.*', 'settings.*'],
  [UserRole.ORG_ADMIN]: ['user.create', 'user.manage', 'rule.create', 'rule.update'],
  [UserRole.TEAM_LEAD]: ['team.view', 'rule.create', 'rule.view', 'target.assign'],
  [UserRole.SALES_EXECUTIVE]: ['rule.view', 'dashboard.personal', 'target.view']
};

hasCapability(capability: string): boolean {
  const role = this.getCurrentUserRole();
  if (!role) return false;
  const caps = this.roleCapabilities[role] || [];
  return caps.some(cap => 
    cap === capability || 
    cap.endsWith('.*') && capability.startsWith(cap.slice(0, -1))
  );
}
```

**Option B: Update Documentation**
- Remove references to `hasCapability()`
- Document using `hasRole()` and helper methods instead

---

## INC-003: User Model Missing orgId

**Severity**: 🟡 Medium  
**Area**: Data Models

### What the Documentation Says

In `context/domain-models.json` and `docs/ROLES.md`:

```json
{
  "User": {
    "properties": {
      "id": { "type": "string" },
      "name": { "type": "string" },
      "email": { "type": "string" },
      "role": { "type": "string" },
      "orgId": { "type": "string" },  // ← Documented
      "teamId": { "type": "string" },
      "managerId": { "type": "string" }
    }
  }
}
```

### What the Code Actually Defines

In `projects/core-services/src/lib/models/roles.model.ts`:

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId?: string;
  managerId?: string;
  // orgId is NOT defined
}
```

### Impact
- Multi-tenancy support requires `orgId`
- JWT claims include `org_id` but User interface doesn't store it
- Data filtering by organization may not work correctly

### Resolution Options

**Option A: Add orgId to User Interface** (Recommended if multi-tenancy needed)
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgId?: string;   // Add this
  teamId?: string;
  managerId?: string;
}
```

**Option B: Update Documentation**
- Remove `orgId` from domain-models.json if not needed
- Clarify that multi-tenancy is handled at backend level

---

## INC-004: Dev Mimic User Uses localStorage

**Severity**: 🟢 Low  
**Area**: Security / Storage

### What the Documentation Says

In `.github/copilot-instructions.md`:

```
### Security
- **sessionStorage** for tokens (NOT localStorage)
- Tokens cleared on tab/browser close
```

### What the Code Does

In `projects/core-services/src/lib/role.service.ts`:

```typescript
private getDevMimicUser(): User | null {
  const mimicUserJson = localStorage.getItem('dev_mimic_user');  // Uses localStorage
  // ...
}

setDevMimicUser(user: User | null): void {
  localStorage.setItem('dev_mimic_user', JSON.stringify(user));  // Uses localStorage
  // ...
}
```

### Impact
- Dev mimic user persists across sessions (localStorage)
- Inconsistent with stated security policy
- However, this is dev-only functionality

### Resolution Options

**Option A: Document as Exception**
- Add note in documentation that dev mimic uses localStorage intentionally
- Explain this is for developer convenience and not used in production

**Option B: Change to sessionStorage**
- Update `getDevMimicUser()` and `setDevMimicUser()` to use sessionStorage
- Dev mimic user will reset on browser close

---

## Recommended Priority

1. **INC-002** (RoleService) - Implement `hasCapability()` to enable documented capability-based checks
2. **INC-001** (EventBusService) - Align API with documentation patterns
3. **INC-003** (User Model) - Add `orgId` if multi-tenancy is required
4. **INC-004** (Storage) - Document as intentional exception

---

## How to Update This Document

When resolving an inconsistency:

1. Make the code or documentation change
2. Update the "Status" from "Open" to "Resolved"
3. Add resolution date and commit reference
4. Move resolved items to a "Resolved" section at the bottom
