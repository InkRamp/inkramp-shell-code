# InkRamp — Auth0 Authentication Contracts  

> **SDK:** `@auth0/auth0-spa-js ^2.8.0`  
> **Storage:** `sessionStorage` only — never `localStorage`  
> **Identity Provider:** Auth0 (OIDC / OAuth2)
>
> This file documents the three `sessionStorage` keys expected after a successful login. Keep it in sync whenever the Auth0 SDK integration or token claim shape changes.

---

## sessionStorage keys written after login

| Key | Type | Description |
|---|---|---|
| `auth0_access_token` | `string` | Raw bearer token used for authenticated API calls |
| `auth0_decoded_token` | `object` | Decoded access-token payload, including org-to-role mapping |
| `auth0_user_info` | `object` | User profile returned by Auth0 |

---

## Key 1: `auth0_access_token`

Stored as a plain string token value:

```text
<JWT access token string>
```

---

## Key 2: `auth0_decoded_token`

Stored as a JSON object with this shape:

```json
{
  "org_and_roles": {
    "org-inkramp": ["admin"]
  },
  "iss": "https://dev-26sow24tone5na8a.us.auth0.com/",
  "sub": "google-oauth2|123456789012345678901",
  "aud": [
    "https://inkramp",
    "https://dev-26sow24tone5na8a.us.auth0.com/userinfo"
  ],
  "iat": 1778873817,
  "exp": 1778960217,
  "scope": "openid profile email",
  "azp": "21DGfAeeidKC4hw10PDx5HcOu1gZZF1s",
  "permissions": []
}
```

### Notes

- `org_and_roles` is the current RBAC claim shape.
- Roles are grouped by organization key, for example `org-inkramp`.
- `permissions` may be empty even when roles are present.

---

## Key 3: `auth0_user_info`

Stored as a JSON object with this shape:

```json
{
  "given_name": "John",
  "family_name": "Doe",
  "nickname": "john.doe",
  "name": "John Doe",
  "picture": "https://example.com/profile-picture.jpg",
  "updated_at": "2026-05-15T19:28:53.157Z",
  "email": "john.doe@example.com",
  "email_verified": true,
  "sub": "google-oauth2|123456789012345678901"
}
```

---

## How application code should use auth state

- Treat these keys as the persisted session contract for the shell.
- Prefer reading auth state through `AuthService` rather than directly from `sessionStorage`.
- Use `auth0_access_token` for API authorization headers.
- Use `auth0_decoded_token.org_and_roles` for frontend role-aware routing and feature gating.
- Re-verify RBAC inside every Lambda by validating the Auth0 JWT via JWKS middleware.

Example role lookup:

```typescript
const orgRoles = decodedToken.org_and_roles?.['org-inkramp'] ?? [];
```

---

## Security notes

- Tokens live in `sessionStorage` and are cleared when the browser session ends.
- Do **not** move auth state to `localStorage`.
- Never trust frontend roles alone; every protected backend route must validate the token server-side.
