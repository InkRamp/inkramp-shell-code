# ⚠️ DEPRECATED - Zitadel Authentication Integration Guide

**This document is DEPRECATED. The application has been migrated to Auth0.**

**Please see [AUTH0_INTEGRATION.md](./AUTH0_INTEGRATION.md) for current authentication documentation.**

---

## Historical Documentation (Zitadel - No Longer Used)

## Overview
This document describes the **previous** Zitadel OAuth2 authentication integration. The application now uses Auth0 instead.

## Authentication Flow

### 1. Login Process
1. User clicks "Login" button in header
2. Application redirects to Zitadel authorization endpoint
3. User authenticates with Zitadel credentials
4. Zitadel redirects back with authorization code
5. Application exchanges code for access token and ID token
6. **All claims from ID token are extracted and logged to console**
7. User info extracted from ID token and stored in sessionStorage
8. RoleService maps Zitadel user to internal User model
9. User redirected to home page with role-based access

### 2. Zitadel Claims Extraction

The application now extracts and logs **all possible claims** from the Zitadel ID token, including:

#### Standard OIDC Claims
- `sub` - Subject/User ID
- `name` - Full name
- `email` - Email address
- `email_verified` - Email verification status
- `preferred_username` - Preferred username
- `given_name` - First name
- `family_name` - Last name
- `locale` - User locale
- `picture` - Profile picture URL
- `phone` - Phone number
- `phone_verified` - Phone verification status
- `updated_at` - Last update timestamp

#### Zitadel-Specific Claims (URN Format)
- `urn:zitadel:iam:org:project:roles` - Project-specific roles
- `urn:zitadel:iam:org:domain:primary` - Primary domain
- `urn:zitadel:iam:user:metadata` - Custom user metadata
- `urn:zitadel:iam:user:resourceowner:id` - Organization ID
- `urn:zitadel:iam:user:resourceowner:name` - Organization name
- `urn:zitadel:iam:user:resourceowner:primary_domain` - Organization primary domain

All claims are automatically logged to the browser console during authentication for debugging and development purposes.

### 3. Role Mapping
The system automatically assigns roles based on email patterns:

| Email Pattern | Assigned Role |
|--------------|---------------|
| Contains "admin" or "super" | SUPER_ADMIN |
| Contains "manager" or "org" | ORG_ADMIN |
| Contains "lead" or "team" | TEAM_LEAD |
| Default | SALES_EXECUTIVE |

**Note:** Future enhancements may use Zitadel's `urn:zitadel:iam:org:project:roles` claim for direct role assignment.

### 4. State Persistence
- Authentication state persists in sessionStorage
- User info synced with RoleService on app initialization
- Session maintained across page reloads
- Logout clears all authentication state
- All Zitadel claims are stored in sessionStorage for access throughout the session

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
   - **Open browser console to see all extracted Zitadel claims**

3. **View Zitadel claims in console:**
   - Login with Zitadel
   - Open browser DevTools (F12)
   - Check Console tab
   - Look for logs starting with `[AuthService] 🔍 ZITADEL ID TOKEN - ALL CLAIMS`
   - Review standard OIDC claims, Zitadel-specific URN claims, and complete token payload

4. **Test persistence:**
   - Login → Refresh page
   - Verify user remains logged in

5. **Test logout:**
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
- Check sessionStorage for `zitadel_user_info`

### Session Not Persisting
- Check sessionStorage for `zitadel_token`
- Verify `isAuthenticated()` returns true
- Check browser console for sync errors

### Viewing Zitadel Claims
To view all claims extracted from Zitadel:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Login with Zitadel
4. Look for the detailed log output:
   - `[AuthService] 🔍 ZITADEL ID TOKEN - ALL CLAIMS` - Main header
   - Standard OIDC claims section
   - Zitadel-specific claims (URN format)
   - Complete token payload (JSON)
5. Alternatively, check sessionStorage:
   - Key: `zitadel_user_info`
   - Contains all extracted claims as JSON

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
