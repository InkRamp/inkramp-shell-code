# Auth0 Authentication Integration Guide

## Overview
This document describes the Auth0 OAuth2 authentication integration with the RoleService and data contract standardization across services. This replaces the previous Zitadel integration.

## Authentication Flow

### 1. Login Process
1. User clicks "Login" button in header
2. Application redirects to Auth0 Universal Login
3. User authenticates with Auth0 credentials
4. Auth0 redirects back with authorization code
5. Auth0 SDK exchanges code for access token and ID token
6. **All claims from ID token are extracted and logged to console**
7. User info extracted from ID token and stored in **sessionStorage** (not localStorage)
8. RoleService maps Auth0 user to internal User model
9. User redirected to home page with role-based access

### 2. Auth0 Claims Extraction

The application extracts and logs **all possible claims** from the Auth0 ID token, including:

#### Standard OIDC Claims
- `sub` - Subject/User ID
- `name` - Full name
- `email` - Email address
- `email_verified` - Email verification status
- `preferred_username` - Preferred username
- `given_name` - First name
- `family_name` - Last name
- `nickname` - Nickname
- `locale` - User locale
- `picture` - Profile picture URL
- `phone` - Phone number
- `phone_verified` - Phone verification status
- `updated_at` - Last update timestamp

#### Auth0 Custom Claims (Namespace Format)
Auth0 custom claims use namespaced format (e.g., `https://your-domain.com/roles`):
- Custom roles claim (example: `https://your-domain.com/roles`)
- Custom permissions claim (example: `https://your-domain.com/permissions`)
- Custom metadata claim (example: `https://your-domain.com/user_metadata`)
- Any other custom claims you define in Auth0 Actions/Rules

All claims are automatically logged to the browser console during authentication for debugging and development purposes.

### 3. Role Mapping
The system automatically assigns roles based on email patterns:

| Email Pattern | Assigned Role |
|--------------|---------------|
| Contains "admin" or "super" | SUPER_ADMIN |
| Contains "manager" or "org" | ORG_ADMIN |
| Contains "lead" or "team" | TEAM_LEAD |
| Default | SALES_EXECUTIVE |

**Note:** Future enhancements may use Auth0's custom claims (e.g., `https://your-domain.com/roles`) for direct role assignment.

### 4. State Persistence
- Authentication state persists in **sessionStorage** (not localStorage)
- User info synced with RoleService on app initialization
- Session maintained across page reloads
- Logout clears all authentication state from sessionStorage
- All Auth0 claims are stored in sessionStorage for access throughout the session
- **Security Improvement:** Using sessionStorage instead of localStorage means tokens are cleared when the browser/tab is closed

## Configuration

### Centralized Auth Configuration
All authentication configuration is managed in a single file:
```
projects/core-services/src/lib/config/auth.config.ts
```

This file contains:
- Auth0 domain, client ID, redirect URIs
- OAuth2 scopes
- Storage configuration (sessionStorage vs localStorage)
- Storage keys for all auth-related data

### Auth0 Settings
Update the following in `projects/core-services/src/lib/config/auth.config.ts`:

```typescript
export const AUTH0_CONFIG: Auth0Config = {
  domain: 'YOUR_AUTH0_DOMAIN.auth0.com',  // Replace with your Auth0 domain
  clientId: 'YOUR_AUTH0_CLIENT_ID',       // Replace with your Auth0 client ID
  redirectUri: 'https://opensourcekd.github.io/i17e/auth-callback',
  logoutUri: 'https://opensourcekd.github.io/i17e',
  scope: 'openid profile email',
  // audience: 'https://your-api-identifier', // Optional: for calling protected APIs
};
```

### Auth0 Dashboard Configuration
In your Auth0 Dashboard:

1. **Application Settings**:
   - Application Type: Single Page Application
   - Allowed Callback URLs: `https://opensourcekd.github.io/i17e/auth-callback`
   - Allowed Logout URLs: `https://opensourcekd.github.io/i17e`
   - Allowed Web Origins: `https://opensourcekd.github.io`

2. **Custom Claims (Optional)**:
   - Go to Actions → Flows → Login
   - Create a custom Action to add roles/permissions to ID token
   - Example:
     ```javascript
     exports.onExecutePostLogin = async (event, api) => {
       const namespace = 'https://your-domain.com';
       api.idToken.setCustomClaim(`${namespace}/roles`, event.user.app_metadata.roles);
     };
     ```

### Local Development
For local development, update `auth.config.ts`:
```typescript
redirectUri: 'http://localhost:4200/auth-callback',
logoutUri: 'http://localhost:4200',
```

And update your Auth0 Dashboard with these local URLs.

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
  
  // Alternative: Use Auth0 custom claims
  // const rolesClaim = 'https://your-domain.com/roles';
  // if (userInfo[rolesClaim]) {
  //   role = this.mapAuth0RoleToInternalRole(userInfo[rolesClaim]);
  // }
  
  const user: User = {
    id: userInfo.sub,
    name: userInfo.name || userInfo.email || 'User',
    email: userInfo.email || '',
    role: role
  };
  
  this.setCurrentUser(user);
}
```

## Security Considerations

### sessionStorage vs localStorage
The application now uses **sessionStorage** for all sensitive authentication data:
- **sessionStorage**: Data is cleared when the browser/tab is closed
- **localStorage**: Data persists even after browser/tab is closed

**Benefits of sessionStorage:**
1. Better security - tokens don't persist across sessions
2. Automatic cleanup when user closes tab/browser
3. Reduces risk of token theft if device is left unattended

**Note:** Non-sensitive preferences still use localStorage for better UX.

### Token Security

**Question: "If I just change a token for another user in debug mode, will this allow me to switch users?"**

**Answer:** Yes, currently if you manually change the token in sessionStorage to another user's token, you would be able to impersonate that user on the client side. However, this is only a **client-side security concern**. Proper security must be implemented on the backend.

**Recommended Security Measures:**

1. **Backend Token Validation** (Most Important):
   - Always validate tokens server-side on each request
   - Verify the token's signature
   - Check that the token hasn't expired
   - Verify the token's issuer (iss) and audience (aud) claims
   - Validate that the token's subject (sub) matches the user making the request

2. **Short-lived Access Tokens**:
   - Use short expiration times (5-15 minutes) for access tokens
   - Implement refresh tokens for longer sessions
   - Auth0 SDK handles token refresh automatically

3. **Additional Security Layers**:
   - Device fingerprinting
   - IP address validation
   - Anomaly detection for suspicious behavior
   - Multi-factor authentication (MFA)
   - Rate limiting on API endpoints

4. **Token Storage Best Practices**:
   - ✅ Use sessionStorage for tokens (already implemented)
   - ✅ Never log tokens in production
   - ✅ Use HTTPS for all communications
   - ✅ Implement CORS properly on backend
   - ✅ Set appropriate token expiration times

**Example Backend Token Validation (Node.js/Express):**
```javascript
const { auth } = require('express-oauth2-jwt-bearer');

const jwtCheck = auth({
  audience: 'https://your-api-identifier',
  issuerBaseURL: 'https://YOUR_AUTH0_DOMAIN.auth0.com',
  tokenSigningAlg: 'RS256'
});

app.use('/api/protected', jwtCheck, (req, res) => {
  // Token is valid, user info available in req.auth
  const userId = req.auth.sub;
  // Verify userId matches the requested resource
  // ...
});
```

## Testing

### Manual Testing
1. **Test without authentication:**
   - Load app → See default user (John Admin)
   - Navigate MFEs → Verify data consistency

2. **Test Auth0 login:**
   - Click Login → Redirect to Auth0
   - Authenticate → Redirect back to app
   - Verify role assigned based on email
   - **Open browser console to see all extracted Auth0 claims**

3. **View Auth0 claims in console:**
   - Login with Auth0
   - Open browser DevTools (F12)
   - Check Console tab
   - Look for logs starting with `[AuthService] 🔍 AUTH0 ID TOKEN - ALL CLAIMS`
   - Review standard OIDC claims, Auth0 custom claims, and complete token payload

4. **Test persistence:**
   - Login → Refresh page
   - Verify user remains logged in
   - Close tab → Reopen app
   - Verify user is logged out (sessionStorage cleared)

5. **Test logout:**
   - Click Logout → Verify state cleared from sessionStorage
   - Verify redirect to Auth0 logout

### Automated Testing
```bash
npm test
```

## Troubleshooting

### Authentication Failed
- Verify Auth0 redirect URI configuration in Auth0 Dashboard
- Check client ID is correct in `auth.config.ts`
- Check browser console for errors
- Verify network connectivity to Auth0

### Logout Error: "Oops! something went wrong"
**Problem**: After clicking logout, Auth0 shows an error page instead of redirecting back.

**Cause**: The `logoutUri` is not configured in Auth0's "Allowed Logout URLs".

**Solution**:
1. Go to Auth0 Dashboard → Applications → Your Application
2. Scroll to "Application URIs" section
3. Add your logout URI to **"Allowed Logout URLs"**:
   - Production: `https://opensourcekd.github.io/i17e`
   - Local dev: `http://localhost:4200`
4. Save changes

**Verification**:
- After configuring, logout should redirect properly
- If still failing, check the exact URL in browser address bar
- Ensure the URL matches exactly (including https/http and trailing slashes)

**Alternative Workaround** (if you can't access Auth0 dashboard):
- Logout will clear local session but may show Auth0 error
- User can manually navigate back to the app
- Consider using local-only logout (skip Auth0 logout call)

### Wrong Role Assigned
- Check email pattern in `setUserFromAuth()`
- Verify Auth0 user email
- Check sessionStorage for `auth0_user_info`

### Session Not Persisting
- Check sessionStorage for `auth0_access_token`
- Verify `isAuthenticated()` returns true
- Check browser console for Auth0 SDK errors

### Session Persists After Closing Tab (Unexpected)
- Verify you're using sessionStorage, not localStorage
- Check `STORAGE_CONFIG` in `auth.config.ts`
- Some browsers may restore sessions - test in private/incognito mode

### Viewing Auth0 Claims
To view all claims extracted from Auth0:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Login with Auth0
4. Look for the detailed log output:
   - `[AuthService] 🔍 AUTH0 ID TOKEN - ALL CLAIMS` - Main header
   - Standard OIDC claims section
   - Auth0 custom claims (namespace format)
   - Complete user object (JSON)
5. Alternatively, check sessionStorage:
   - Key: `auth0_user_info`
   - Contains all extracted claims as JSON

### Debugging with Different Users
See [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md) for instructions on:
- Testing with different users without logging in each time
- Manually setting up sessionStorage for debugging
- Quick commands for switching between user roles

## Migration from Zitadel

This application was migrated from Zitadel to Auth0. Key changes:

1. **SDK Change**: Using `@auth0/auth0-spa-js` instead of manual OAuth2 implementation
2. **Storage**: Changed from localStorage to sessionStorage for sensitive data
3. **Configuration**: Centralized all auth config in `auth.config.ts`
4. **Claims Format**: Auth0 uses namespace format (`https://domain.com/claim`) instead of URN format (`urn:zitadel:...`)
5. **Token Management**: Auth0 SDK handles token refresh automatically

## Future Enhancements

1. **Production Role Management:**
   - Fetch roles from Auth0 custom claims
   - Use Auth0 Organizations and Roles
   - Implement backend role mapping service

2. **Token Management:**
   - Monitor token expiration
   - Implement automatic refresh (already handled by Auth0 SDK)
   - Add silent authentication flow

3. **Security:**
   - Enhanced CSRF protection
   - Security headers
   - Audit logging
   - Implement backend token validation
   - Add device fingerprinting
   - Implement anomaly detection

4. **User Experience:**
   - Remember me functionality (with user consent)
   - Multi-factor authentication (MFA)
   - Social login providers

## Files Modified

1. `projects/core-services/src/lib/config/auth.config.ts` (NEW)
2. `projects/core-services/src/lib/auth.service.ts`
3. `projects/core-services/src/lib/role.service.ts`
4. `projects/core-services/src/lib/interceptors/auth.interceptor.ts`
5. `src/app/auth-callback/auth-callback.component.ts`
6. `src/app/components/header/header.component.ts`
7. `src/app/app.component.ts`
8. `AUTH0_INTEGRATION.md` (NEW - this file)
9. `ZITADEL_INTEGRATION.md` (DEPRECATED - see this file instead)

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify Auth0 configuration in Dashboard and `auth.config.ts`
3. Review sessionStorage state in DevTools
4. Check network requests in DevTools
5. Consult Auth0 documentation: https://auth0.com/docs
