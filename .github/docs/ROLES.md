# Roles & Permissions

## Role Hierarchy

The application uses a concentric subset model for roles:

```
┌─────────────────────────────────────────────────────────┐
│                     Super-Admin                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │                   Org-Admin                      │    │
│  │  ┌─────────────────────────────────────────┐    │    │
│  │  │              Team Lead                   │    │    │
│  │  │  ┌─────────────────────────────────┐    │    │    │
│  │  │  │        Sales Executive          │    │    │    │
│  │  │  └─────────────────────────────────┘    │    │    │
│  │  └─────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

Each outer role includes all permissions of inner roles.

---

## Role Definitions

### Super-Admin
**Scope**: Full multi-tenant platform control

| Capability | Description |
|------------|-------------|
| `org.create` | Create new organizations |
| `org.manage` | Manage all organizations |
| `org.delete` | Delete organizations |
| `user.manage.all` | Manage users across all orgs |
| `settings.global` | Configure platform-wide settings |
| `audit.view.all` | View audit logs across all orgs |
| `rule.manage.all` | Manage incentive rules globally |

### Org-Admin
**Scope**: Single organization control

| Capability | Description |
|------------|-------------|
| `user.create` | Create users within org |
| `user.manage` | Manage users within org |
| `user.delete` | Delete users within org |
| `team.create` | Create teams |
| `team.manage` | Manage teams |
| `settings.org` | Configure org-level settings |
| `rule.create` | Create incentive rules |
| `rule.update` | Update incentive rules |
| `rule.delete` | Delete incentive rules |
| `report.view.org` | View org-wide reports |

### Team Lead
**Scope**: Team management

| Capability | Description |
|------------|-------------|
| `team.view` | View team members |
| `rule.create` | Create rules for team |
| `rule.update` | Update team rules |
| `rule.view` | View all team rules |
| `report.view.team` | View team reports |
| `dashboard.team` | Access team dashboard |
| `leaderboard.view` | View team leaderboard |
| `target.assign` | Assign targets to team members |

### Sales Executive
**Scope**: Personal data only

| Capability | Description |
|------------|-------------|
| `rule.view` | View applicable rules |
| `report.view.personal` | View personal reports |
| `dashboard.personal` | Access personal dashboard |
| `leaderboard.view` | View leaderboard |
| `target.view` | View assigned targets |
| `incentive.view` | View earned incentives |

---

## Access Model

### JWT Claims Structure

Roles are encoded in JWT tokens using claims:

```typescript
// Standard claim format
{
  "sub": "user-id-123",
  "email": "user@example.com",
  "role": "TEAM_LEAD",
  "org_id": "org-456",
  "team_id": "team-789"
}

// Namespaced custom claim format (Auth0)
{
  "sub": "auth0|user-id-123",
  "https://all-mfe-builds.app/roles": ["TEAM_LEAD"],
  "https://all-mfe-builds.app/org_id": "org-456",
  "https://all-mfe-builds.app/team_id": "team-789"
}
```

### Capability-Based Checks

**Prefer capability checks over role string checks:**

```typescript
// ❌ Avoid: Role string checking
if (user.role === 'TEAM_LEAD' || user.role === 'ORG_ADMIN') {
  showEditButton();
}

// ✅ Preferred: Capability checking
if (roleService.hasCapability('rule.update')) {
  showEditButton();
}
```

### RoleService API

```typescript
// Check if user has specific role or higher
roleService.hasRole(UserRole.TEAM_LEAD);

// Check if user has specific capability
roleService.hasCapability('rule.create');

// Check if user can view others' data
roleService.canViewOthersData();

// Get users that current user can view
roleService.getViewableUsers();

// Check if user is admin level
roleService.isAdmin();

// Check if user is team lead or higher
roleService.isTeamLeadOrHigher();
```

---

## Capability List

### Rule Capabilities
- `rule.create` - Create new incentive rules
- `rule.update` - Modify existing rules
- `rule.delete` - Remove rules
- `rule.view` - View rule details
- `rule.activate` - Activate/pause rules

### Report Capabilities
- `report.view.personal` - View own reports
- `report.view.team` - View team reports
- `report.view.org` - View organization reports
- `report.export` - Export report data

### User Management Capabilities
- `user.create` - Create new users
- `user.update` - Modify user details
- `user.delete` - Remove users
- `user.view` - View user information
- `user.manage` - Full user management

### Dashboard Capabilities
- `dashboard.personal` - Personal dashboard access
- `dashboard.team` - Team dashboard access
- `dashboard.org` - Organization dashboard access
- `leaderboard.view` - View leaderboards

### Target Capabilities
- `target.view` - View targets
- `target.assign` - Assign targets
- `target.create` - Create targets
- `target.update` - Modify targets

### Incentive Capabilities
- `incentive.view` - View incentives
- `incentive.calculate` - Trigger calculations
- `incentive.approve` - Approve incentives
- `incentive.payout` - Process payouts

---

## Implementation Notes

### Angular Guards

```typescript
// Route guard checking role
export const teamLeadGuard = () => {
  const roleService = inject(RoleService);
  return roleService.hasRole(UserRole.TEAM_LEAD);
};

// Route guard checking capability
export const ruleEditGuard = () => {
  const roleService = inject(RoleService);
  return roleService.hasCapability('rule.update');
};
```

### Template Directives

```html
<!-- Show element only for specific roles -->
@if (roleService.hasRole(UserRole.ORG_ADMIN)) {
  <button>Delete User</button>
}

<!-- Show element based on capability -->
@if (roleService.hasCapability('rule.create')) {
  <button>Create Rule</button>
}
```

### Data Filtering

```typescript
// Filter data based on user's scope
getIncentives(): Observable<Incentive[]> {
  const user = this.roleService.getCurrentUser();
  
  if (this.roleService.isAdmin()) {
    return this.http.get<Incentive[]>('/api/incentives');
  } else if (this.roleService.isTeamLeadOrHigher()) {
    return this.http.get<Incentive[]>(`/api/incentives?teamId=${user.teamId}`);
  } else {
    return this.http.get<Incentive[]>(`/api/incentives?userId=${user.id}`);
  }
}
```

---

## Testing Roles

### Local Development

Use `setDevMimicUser()` to test different roles:

```typescript
// In browser console or component
roleService.setDevMimicUser({
  id: 'test-user',
  name: 'Test Team Lead',
  email: 'test@example.com',
  role: UserRole.TEAM_LEAD,
  teamId: 'team-1'
});
```

### Unit Testing

```typescript
describe('RoleService', () => {
  it('should allow team lead to create rules', () => {
    const user = { ...mockUser, role: UserRole.TEAM_LEAD };
    roleService.setCurrentUser(user);
    
    expect(roleService.hasCapability('rule.create')).toBe(true);
  });
  
  it('should deny sales executive from deleting rules', () => {
    const user = { ...mockUser, role: UserRole.SALES_EXECUTIVE };
    roleService.setCurrentUser(user);
    
    expect(roleService.hasCapability('rule.delete')).toBe(false);
  });
});
```
