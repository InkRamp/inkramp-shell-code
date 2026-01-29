# Auth0 Role Configuration Guide

This guide explains how to configure Auth0 to add role claims to tokens for the i17e application.

## Current Token Structure

The application currently receives tokens with the following structure:

```json
{
  "org_and_roles": {
    "hdfc": ["super-admin", "org-admin"],
    "icici": ["sales-executive"]
  },
  "sub": "google-oauth2|109184121663700812552",
  "email": "user@example.com",
  ...
}
```

The `RoleService` has been updated to parse this `org_and_roles` structure and automatically select the highest privilege role.

## Option 1: Use Existing org_and_roles Structure (Recommended)

**No Auth0 changes needed!** The code now handles the `org_and_roles` structure automatically.

The system will:
1. Parse all roles across all organizations
2. Select the highest privilege role (SUPER_ADMIN > ORG_ADMIN > TEAM_LEAD > SALES_EXECUTIVE)
3. Assign it to the user

### Example Token Processing:

```json
{
  "org_and_roles": {
    "hdfc": ["super-admin", "org-admin"],
    "icici": ["sales-executive"]
  }
}
```

→ User will be assigned `SUPER_ADMIN` role (highest privilege)

## Option 2: Add Simple Role Claim via Auth0 Action

If you prefer a flattened `role` claim instead of `org_and_roles`, follow these steps:

### Step 1: Create Auth0 Action

1. Log in to your [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to **Actions** → **Flows**
3. Select **Login** flow
4. Click **Custom** → **Create Action**
5. Name it: `Add Role to Token`

### Step 2: Add Action Code

```javascript
/**
 * Auth0 Action: Add Role to Token
 * Extracts the highest privilege role from org_and_roles and adds it as a simple claim
 */
exports.onExecutePostLogin = async (event, api) => {
  // Check if org_and_roles exists
  if (event.user.app_metadata && event.user.app_metadata.org_and_roles) {
    const orgAndRoles = event.user.app_metadata.org_and_roles;
    
    // Define role hierarchy (highest to lowest)
    const roleHierarchy = ['super-admin', 'org-admin', 'team-lead', 'sales-executive'];
    
    // Collect all roles across all organizations
    const allRoles = [];
    for (const org in orgAndRoles) {
      if (Array.isArray(orgAndRoles[org])) {
        allRoles.push(...orgAndRoles[org]);
      }
    }
    
    // Find the highest privilege role
    let selectedRole = 'sales-executive'; // default
    for (const role of roleHierarchy) {
      if (allRoles.includes(role)) {
        selectedRole = role;
        break;
      }
    }
    
    // Add role claim to ID token
    api.idToken.setCustomClaim('role', selectedRole);
    
    // Add role claim to access token
    api.accessToken.setCustomClaim('role', selectedRole);
    
    console.log(`Assigned role: ${selectedRole} from organizations:`, Object.keys(orgAndRoles).join(', '));
  } else {
    // No org_and_roles found, assign default role
    api.idToken.setCustomClaim('role', 'sales-executive');
    api.accessToken.setCustomClaim('role', 'sales-executive');
    console.log('No org_and_roles found, assigned default role: sales-executive');
  }
};
```

### Step 3: Deploy Action

1. Click **Deploy** to save the action
2. Go back to **Actions** → **Flows** → **Login**
3. Drag your new action into the flow (between "Start" and "Complete")
4. Click **Apply**

### Step 4: Test

After deploying, new tokens will include:

```json
{
  "role": "super-admin",
  "org_and_roles": {
    "hdfc": ["super-admin", "org-admin"]
  },
  "sub": "google-oauth2|109184121663700812552",
  ...
}
```

The `RoleService` will now find the `role` claim first and use it directly.

## Option 3: Namespaced Custom Claim

If you prefer namespaced claims for security, use this format:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  // ... (same role selection logic as Option 2)
  
  const namespace = 'https://your-domain.com';
  api.idToken.setCustomClaim(`${namespace}/role`, selectedRole);
  api.accessToken.setCustomClaim(`${namespace}/role`, selectedRole);
};
```

The `RoleService` already supports namespaced claims with "role" in the key.

## Storing org_and_roles in User Metadata

If you need to set `org_and_roles` in Auth0, update user metadata via:

### Management API

```javascript
const options = {
  method: 'PATCH',
  url: `https://${YOUR_DOMAIN}/api/v2/users/${USER_ID}`,
  headers: {
    'content-type': 'application/json',
    authorization: `Bearer ${MGMT_API_TOKEN}`
  },
  data: {
    app_metadata: {
      org_and_roles: {
        hdfc: ['super-admin', 'org-admin'],
        icici: ['sales-executive']
      }
    }
  }
};
```

### Auth0 Dashboard

1. Go to **User Management** → **Users**
2. Select a user
3. Scroll to **Metadata** section
4. Add to `app_metadata`:

```json
{
  "org_and_roles": {
    "hdfc": ["super-admin", "org-admin"],
    "icici": ["sales-executive"]
  }
}
```

## Role Mapping

The application maps role strings to internal enums:

| Auth0 Role String | Internal Role | Description |
|-------------------|---------------|-------------|
| `super-admin`, `super`, `admin` | `SUPER_ADMIN` | Full system access |
| `org-admin`, `organizationadmin`, `manager` | `ORG_ADMIN` | Organization management |
| `team-lead`, `teamlead`, `lead` | `TEAM_LEAD` | Team management |
| `sales-executive`, `sales`, `executive` | `SALES_EXECUTIVE` | Individual contributor |

Role strings are normalized (lowercase, no separators) for flexible matching.

## Troubleshooting

### Issue: Role not appearing in token

**Check:**
1. Action is deployed and added to Login flow
2. Action logs in Auth0 Dashboard (Monitor → Logs)
3. Token decoded at [jwt.io](https://jwt.io) shows the claim

### Issue: Wrong role assigned

**Check:**
1. `org_and_roles` structure in user's `app_metadata`
2. Role strings match expected format (case-insensitive)
3. Console logs in browser DevTools for role extraction

### Issue: Token too large

If adding roles makes tokens too large, consider:
1. Using shorter role names
2. Limiting organizations per user
3. Using only the simple `role` claim (Option 2) instead of keeping `org_and_roles`

## Security Considerations

1. **Never** expose role assignment logic to client-side code
2. Always validate roles on the backend API
3. Use namespaced claims (`https://your-domain.com/role`) to avoid conflicts
4. Store role definitions in Auth0 `app_metadata`, not `user_metadata` (user-editable)
5. Audit role changes via Auth0 logs

## References

- [Auth0 Actions Documentation](https://auth0.com/docs/customize/actions)
- [Custom Claims](https://auth0.com/docs/secure/tokens/json-web-tokens/create-custom-claims)
- [User Metadata](https://auth0.com/docs/manage-users/user-accounts/metadata)
