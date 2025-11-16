# Debugging Guide - Testing with Different Users

## Quick Start: Simulating Different Users

To test the application with different users without logging in each time, you can manually set up sessionStorage.

### Option 1: Using Dev Mimic User (Recommended for Quick Testing)

This is the simplest way to switch between users:

```javascript
// Open browser console (F12) and run:

// To become a Super Admin
localStorage.setItem('dev_mimic_user', JSON.stringify({
  id: 'user-1',
  name: 'John Admin',
  email: 'john.admin@company.com',
  role: 'super-admin'
}));

// To become an Org Admin
localStorage.setItem('dev_mimic_user', JSON.stringify({
  id: 'user-2',
  name: 'Sarah Manager',
  email: 'sarah.manager@company.com',
  role: 'org-admin'
}));

// To become a Team Lead
localStorage.setItem('dev_mimic_user', JSON.stringify({
  id: 'user-3',
  name: 'Mike Lead',
  email: 'mike.lead@company.com',
  role: 'team-lead'
}));

// To become a Sales Executive
localStorage.setItem('dev_mimic_user', JSON.stringify({
  id: 'user-4',
  name: 'Alice Sales',
  email: 'alice.sales@company.com',
  role: 'sales-executive'
}));

// Then refresh the page
window.location.reload();
```

### Option 2: Simulating Auth0 Authenticated User

If you need to test with actual Auth0 authentication state:

#### Step 1: Get a Valid Token

First, login normally with Auth0, then extract your token:

```javascript
// Open browser console after successful login
const token = sessionStorage.getItem('auth0_access_token');
const userInfo = sessionStorage.getItem('auth0_user_info');
console.log('Token:', token);
console.log('User Info:', userInfo);

// Copy these values
```

#### Step 2: Set Up SessionStorage for Another Session

In a new browser session or incognito window:

```javascript
// Set the access token
sessionStorage.setItem('auth0_access_token', 'YOUR_TOKEN_HERE');

// Set the user info
sessionStorage.setItem('auth0_user_info', JSON.stringify({
  sub: 'auth0|USER_ID',
  name: 'Test User',
  email: 'test@example.com',
  email_verified: true,
  // ... other claims
}));

// Set current user for RoleService
sessionStorage.setItem('current_user', JSON.stringify({
  id: 'auth0|USER_ID',
  name: 'Test User',
  email: 'test@example.com',
  role: 'sales-executive'  // or any role
}));

// Refresh the page
window.location.reload();
```

#### Step 3: Important Notes

⚠️ **Security Note**: Tokens are tied to the user who authenticated. If you try to use someone else's token:
- **Client-side**: You'll appear as that user
- **Server-side**: The backend MUST validate the token and reject requests if the token doesn't match the requested resource

This is why backend validation is critical (see AUTH0_INTEGRATION.md).

## Available User Roles

```typescript
// Role hierarchy (from highest to lowest)
'super-admin'      // Full system access
'org-admin'        // Organization administration
'team-lead'        // Team management
'sales-executive'  // Individual contributor
```

## Quick Commands

### Clear All Auth State
```javascript
// Clear everything
sessionStorage.clear();
localStorage.removeItem('dev_mimic_user');
window.location.reload();
```

### Check Current Auth State
```javascript
// Check what's stored
console.log('Access Token:', sessionStorage.getItem('auth0_access_token'));
console.log('User Info:', JSON.parse(sessionStorage.getItem('auth0_user_info') || '{}'));
console.log('Current User:', JSON.parse(sessionStorage.getItem('current_user') || '{}'));
console.log('Dev Mimic User:', JSON.parse(localStorage.getItem('dev_mimic_user') || '{}'));
```

### Switch Users Quickly
```javascript
// Create a helper function
function switchUser(role) {
  const users = {
    'admin': { id: 'user-1', name: 'John Admin', email: 'john.admin@company.com', role: 'super-admin' },
    'manager': { id: 'user-2', name: 'Sarah Manager', email: 'sarah.manager@company.com', role: 'org-admin' },
    'lead': { id: 'user-3', name: 'Mike Lead', email: 'mike.lead@company.com', role: 'team-lead' },
    'sales': { id: 'user-4', name: 'Alice Sales', email: 'alice.sales@company.com', role: 'sales-executive' }
  };
  localStorage.setItem('dev_mimic_user', JSON.stringify(users[role]));
  window.location.reload();
}

// Usage:
switchUser('admin');
switchUser('manager');
switchUser('lead');
switchUser('sales');
```

## Storage Keys Reference

### sessionStorage (cleared on tab close)
- `auth0_access_token` - Auth0 access token
- `auth0_user_info` - Full user info from Auth0 ID token
- `current_user` - Current user object used by RoleService
- `selected_sales_executive_id` - Currently selected sales executive (for admins)

### localStorage (persists across sessions)
- `dev_mimic_user` - Development user for testing (checked first by RoleService)

## Testing Scenarios

### Test Role-Based Access
1. Set dev mimic user to different roles
2. Navigate to different routes
3. Verify appropriate access/restrictions

### Test User Switching (for admins)
1. Login as admin/team-lead
2. Use dropdown in header to switch between users
3. Verify data changes appropriately

### Test Logout Flow
1. Login normally
2. Click Logout
3. Verify redirected to Auth0 logout
4. Verify sessionStorage cleared
5. Verify redirected back to app

### Test Session Persistence
1. Login normally
2. Refresh page
3. Verify still logged in
4. Close tab and reopen
5. Verify logged out (sessionStorage cleared)

## Troubleshooting

### Not seeing user name after setting sessionStorage
Make sure all three items are set:
- `auth0_user_info` or dev_mimic_user in localStorage
- `current_user` in sessionStorage
- Refresh the page

### Role not working correctly
Check the role value matches exactly:
- 'super-admin' (not 'superadmin')
- 'org-admin' (not 'orgadmin')
- 'team-lead' (not 'teamlead')
- 'sales-executive' (not 'salesexecutive')

### Token expired error
Auth0 tokens expire. Get a fresh token by:
1. Clearing sessionStorage
2. Logging in again
3. Extracting the new token
