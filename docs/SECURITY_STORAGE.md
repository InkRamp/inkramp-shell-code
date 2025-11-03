# Security and Data Storage Guidelines

## Overview

This document explains the security considerations and storage choices made in the i17e application, particularly regarding sensitive user data and authentication tokens.

## Storage Strategy

### 1. No localStorage Usage

**Decision**: We do NOT use `localStorage` for any user data or authentication tokens.

**Rationale**:
- `localStorage` persists data indefinitely across browser sessions
- Storing sensitive data (user info, tokens) in `localStorage` increases security risk
- Data in `localStorage` is accessible via XSS attacks
- No automatic expiration mechanism

### 2. sessionStorage for Authentication Data

**What we store**:
- OAuth access tokens (`zitadel_token`)
- User information from ID token (`zitadel_user_info`)
- OAuth state and code verifier (temporary, cleared after use)
- Current user session (`current_user`)
- Brand context (`brand_id`)
- UI state (`selected_sales_executive_id`)

**Rationale**:
- `sessionStorage` is cleared when the browser tab/window is closed
- Reduces the window of opportunity for token theft
- Automatically expires when user closes their session
- Still vulnerable to XSS but with reduced exposure time

### 3. In-Memory Storage for Development Features

**What we store**:
- Dev mimic user (for testing different user roles)

**Rationale**:
- Development-only feature should not persist across sessions
- Encourages developers to use proper authentication in production
- No risk of accidentally leaving development data in browser
- Forces intentional re-configuration each development session

## Security Best Practices

### Authentication Tokens
- Tokens are stored in `sessionStorage` only
- Tokens are cleared on logout
- OAuth state/verifier are immediately cleared after successful authentication
- Short-lived tokens should be preferred (implement token refresh if needed)

### User Data
- Minimal user data stored in browser
- Only essential information cached in `sessionStorage`
- Sensitive fields (passwords, payment info) are NEVER stored client-side
- User data synced from backend on each session

### Development vs Production
- Development features (like user mimicking) use in-memory storage only
- Production authentication always goes through proper OAuth flow
- Environment-specific configurations prevent development shortcuts in production

## Impact of Not Using localStorage

### Positive Impacts:
1. **Enhanced Security**: Reduced attack surface for XSS-based token theft
2. **Session Isolation**: Each browser tab maintains independent session
3. **Auto Cleanup**: Browser automatically cleans up data when tab closes
4. **Compliance**: Better alignment with security standards (GDPR, PCI-DSS)

### Trade-offs:
1. **User Experience**: Users must re-authenticate when they close and reopen browser
2. **Development**: Developers need to re-configure test users each session
3. **Session Persistence**: "Remember me" functionality requires server-side implementation

## Future Considerations

### Recommended Enhancements:
1. **Token Refresh**: Implement automatic token refresh for better UX
2. **Secure Cookies**: Consider using httpOnly, secure cookies for tokens (requires backend support)
3. **IndexedDB**: For large datasets that need client-side caching (with encryption)
4. **Remember Me**: Server-side remember-me token with secure cookies

### What NOT to Do:
- ❌ Store authentication tokens in `localStorage`
- ❌ Store user passwords client-side (even hashed)
- ❌ Store payment information client-side
- ❌ Store PII (Personally Identifiable Information) unnecessarily
- ❌ Use development features (mimic user) in production builds

## Questions & Answers

**Q: Why not use localStorage for better user experience?**
A: Security takes precedence. The slight inconvenience of re-authentication is preferable to the risk of token theft. For better UX, implement server-side "remember me" with secure cookies.

**Q: What if I need to persist data across sessions?**
A: Use server-side storage. For non-sensitive UI preferences, consider `localStorage` with encryption, but always evaluate if the data truly needs to persist.

**Q: How do I test different user roles now?**
A: Use `roleService.setDevMimicUser(user)` in the browser console. This is intentionally session-only to prevent development artifacts in production.

**Q: Is sessionStorage completely secure?**
A: No storage mechanism is 100% secure. `sessionStorage` is vulnerable to XSS attacks, but it reduces the window of exposure compared to `localStorage`. Always implement proper XSS prevention (Content Security Policy, input sanitization, etc.).

## Audit Trail

| Date | Change | Reason |
|------|--------|--------|
| 2025-11-03 | Removed localStorage usage for dev_mimic_user | Security improvement - prevent persistence of sensitive user data |
| 2025-11-03 | Moved dev mimic user to in-memory storage | Development feature should not persist across sessions |

## References
- [OWASP Web Storage Security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [GDPR Data Minimization](https://gdpr-info.eu/art-5-gdpr/)
