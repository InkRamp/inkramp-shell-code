# Zitadel Authentication Integration Guide

## Overview
This document describes the Zitadel OAuth2 authentication integration with the RoleService and data contract standardization across services.

## Authentication Flow

### 1. Login Process
1. User clicks "Login" button in header
2. Application redirects to Zitadel authorization endpoint
3. User authenticates with Zitadel credentials
4. Zitadel redirects back with authorization code
5. Application exchanges code for access token and ID token
6. User info extracted from ID token and stored in localStorage
7. RoleService maps Zitadel user to internal User model
8. User redirected to home page with role-based access

### 2. Role Mapping
The system automatically assigns roles based on email patterns:

| Email Pattern | Assigned Role |
|--------------|---------------|
| Contains "admin" or "super" | SUPER_ADMIN |
| Contains "manager" or "org" | ORG_ADMIN |
| Contains "lead" or "team" | TEAM_LEAD |
| Default | SALES_EXECUTIVE |

### 3. State Persistence
- Authentication state persists in localStorage
- User info synced with RoleService on app initialization
- Session maintained across page reloads
- Logout clears all authentication state

## Data Contract Standardization

### User IDs
All services now use standardized user IDs:

```typescript
user-1: John Admin (SUPER_ADMIN)
user-2: Sarah Manager (ORG_ADMIN)
user-3: Mike Lead (TEAM_LEAD)
user-4: Alice Sales (SALES_EXECUTIVE)
user-5: Bob Sales (SALES_EXECUTIVE)
user-6: Carol Sales (SALES_EXECUTIVE)
```

### Affected Services
- **RoleService**: User management and permissions
- **SalesDataService**: Sales records and summaries
- **DummyDataService**: Test/demo data generation

## Configuration

### Zitadel Settings
```typescript
ISSUER_BASE_URL: 'https://topfix-wrczmn.us1.zitadel.cloud'
CLIENT_ID: '336777344075263315'
REDIRECT_URI: 'https://opensourcekd.github.io/i17e/auth-callback'
SCOPE: 'openid profile email'
```

### Customizing Role Mapping
Edit `setUserFromAuth()` in `role.service.ts`:

```typescript
setUserFromAuth(userInfo: UserInfo): void {
  let role: UserRole = UserRole.SALES_EXECUTIVE; // Default
  
  const email = userInfo.email?.toLowerCase() || '';
  
  // Customize role assignment logic here
  if (email.includes('admin')) {
    role = UserRole.SUPER_ADMIN;
  } else if (email.includes('manager')) {
    role = UserRole.ORG_ADMIN;
  } else if (email.includes('lead')) {
    role = UserRole.TEAM_LEAD;
  }
  
  // Map to internal User model
  const user: User = {
    id: userInfo.sub,
    name: userInfo.name || userInfo.email || 'User',
    email: userInfo.email || '',
    role: role
  };
  
  this.setCurrentUser(user);
}
```

## Testing

### Manual Testing
1. **Test without authentication:**
   - Load app → See default user (John Admin)
   - Navigate MFEs → Verify data consistency

2. **Test Zitadel login:**
   - Click Login → Redirect to Zitadel
   - Authenticate → Redirect back to app
   - Verify role assigned based on email

3. **Test persistence:**
   - Login → Refresh page
   - Verify user remains logged in

4. **Test logout:**
   - Click Logout → Verify state cleared

### Automated Testing
```bash
npm test
```

## Troubleshooting

### Authentication Failed
- Verify Zitadel redirect URI configuration
- Check client ID is correct
- Check browser console for errors
- Verify network connectivity to Zitadel

### Wrong Role Assigned
- Check email pattern in `setUserFromAuth()`
- Verify Zitadel user email
- Check localStorage for `zitadel_user_info`

### Session Not Persisting
- Check localStorage for `zitadel_token`
- Verify `isAuthenticated()` returns true
- Check browser console for sync errors

## Future Enhancements

1. **Production Role Management:**
   - Fetch roles from Zitadel user metadata
   - Use Zitadel organizations and roles
   - Implement backend role mapping service

2. **Token Management:**
   - Add token expiration checking
   - Implement automatic refresh
   - Add silent authentication flow

3. **Security:**
   - Enhanced CSRF protection
   - Security headers
   - Audit logging

## Files Modified

1. `projects/core-services/src/lib/role.service.ts`
2. `projects/core-services/src/lib/sales-data.service.ts`
3. `projects/core-services/src/lib/dummy-data.service.ts`
4. `projects/core-services/src/lib/role.service.spec.ts`
5. `src/app/app.component.ts`
6. `src/app/auth-callback/auth-callback.component.ts`
7. `src/app/components/header/header.component.ts`

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify Zitadel configuration
3. Review localStorage state
4. Check network requests in DevTools
