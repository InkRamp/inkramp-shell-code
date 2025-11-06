# Security Considerations

## Overview

This document outlines security considerations for the i17e Backend API and provides guidance for production deployment.

## Current Security Status

**Development Mode**: The current implementation is optimized for development and testing. Several security enhancements should be implemented before production deployment.

## Known Security Considerations

### 1. Request Forgery (SSRF) Warnings

**Issue**: User-provided IDs are used directly in API URLs to Zitadel.

**Impact**: Potential Server-Side Request Forgery if IDs are not properly validated.

**Mitigation Applied**:
- Created validation middleware in `src/middleware/validation.ts`
- `sanitizeId()` function validates and sanitizes all ID parameters
- Only alphanumeric characters, hyphens, and underscores are allowed
- Length restrictions enforced (1-100 characters)

**Example Usage**:
```typescript
import { sanitizeId } from '../middleware/validation';

async getById(req: Request, res: Response): Promise<void> {
  const id = sanitizeId(req.params.id); // Validated and sanitized
  const response = await client.get(`/management/v1/orgs/${id}`);
}
```

**Production TODO**:
- Apply `sanitizeId()` to all controllers (organization.controller.ts has examples)
- Add whitelist validation for specific ID formats if known
- Implement rate limiting per IP/user
- Add request logging for audit trails

### 2. Input Validation

**Issue**: Request body validation is minimal.

**Current State**: Basic TypeScript typing, no runtime validation.

**Production Requirements**:
```bash
npm install express-validator
# or
npm install joi
```

**Example with express-validator**:
```typescript
import { body, validationResult } from 'express-validator';

// Route with validation
router.post('/', 
  body('name').isString().trim().isLength({ min: 1, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  (req, res) => controller.create(req, res)
);

// In controller
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}
```

### 3. Authentication & Authorization

**Issue**: Currently, all endpoints are public.

**Production Requirements**:
1. **Add Authentication Middleware**:
```typescript
import { Request, Response, NextFunction } from 'express';

async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Verify token with Zitadel
    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Apply to routes
app.use('/api/organizations', authenticate, organizationRoutes);
```

2. **Add Role-Based Access Control (RBAC)**:
```typescript
function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Usage
router.delete('/:id', requireRole('SUPER_ADMIN', 'ORG_ADMIN'), controller.delete);
```

### 4. Rate Limiting

**Issue**: No rate limiting implemented.

**Production Requirements**:
```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### 5. CORS Configuration

**Current State**: CORS origins configurable via environment variables.

**Production Checklist**:
- [ ] Set `CORS_ORIGINS` to only trusted domains
- [ ] Remove development URLs (localhost, 127.0.0.1)
- [ ] Use HTTPS-only origins
- [ ] Consider using credentials only when necessary

### 6. Environment Variables

**Security Requirements**:
- [ ] Never commit `.env` file to version control
- [ ] Use strong, unique `ZITADEL_CLIENT_SECRET`
- [ ] Rotate credentials regularly
- [ ] Use secret management service in production (AWS Secrets Manager, Azure Key Vault, etc.)

### 7. HTTPS/TLS

**Production Requirements**:
- [ ] Deploy behind HTTPS reverse proxy (nginx, Apache, AWS ALB)
- [ ] Enforce HTTPS-only
- [ ] Use TLS 1.2 or higher
- [ ] Implement HSTS headers

```typescript
app.use((req, res, next) => {
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    next();
  } else {
    res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
});
```

### 8. Error Handling

**Issue**: Error messages may expose internal details.

**Production Requirements**:
```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log full error internally
  console.error('Error:', err);
  
  // Return sanitized error to client
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});
```

### 9. SQL Injection / NoSQL Injection

**Current State**: Using Zitadel API (safe), in-memory storage for teams.

**If Adding Database**:
- Use parameterized queries
- Use ORM with proper escaping (TypeORM, Prisma, Sequelize)
- Never concatenate user input into queries

### 10. Cross-Site Scripting (XSS)

**Mitigation**: Server returns JSON only, frontend handles rendering.

**Additional Protection**:
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
    },
  },
}));
```

## Security Summary

### Critical (Fix Before Production)
1. ✅ Input validation on IDs (validation.ts created, partially applied)
2. ⚠️ Authentication middleware (not implemented)
3. ⚠️ Authorization/RBAC (not implemented)
4. ⚠️ Rate limiting (not implemented)
5. ⚠️ HTTPS enforcement (deployment concern)

### Important (Recommended)
1. ⚠️ Request body validation
2. ⚠️ Error message sanitization
3. ✅ CORS configuration via env
4. ⚠️ Security headers (helmet)
5. ⚠️ Audit logging

### Good to Have
1. Token refresh logic
2. Request signing
3. API versioning
4. IP whitelisting
5. DDoS protection

## Production Deployment Checklist

### Before Deployment
- [ ] Apply input validation to all controllers
- [ ] Implement authentication middleware
- [ ] Implement RBAC
- [ ] Add rate limiting
- [ ] Sanitize error messages
- [ ] Set up HTTPS
- [ ] Configure production CORS
- [ ] Use environment-based configuration
- [ ] Set up monitoring and alerting
- [ ] Implement audit logging
- [ ] Add security headers (helmet)
- [ ] Review and rotate all secrets
- [ ] Set up backup and disaster recovery
- [ ] Perform security audit/penetration testing

### Environment Configuration
```env
# Production .env example
NODE_ENV=production
PORT=4000
CORS_ORIGINS=https://yourdomain.com
ZITADEL_ISSUER=https://your-instance.zitadel.cloud
ZITADEL_CLIENT_ID=your_client_id
ZITADEL_CLIENT_SECRET=strong_secret_here

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## Vulnerability Disclosure

If you discover a security vulnerability:
1. Do not open a public issue
2. Email security@yourdomain.com
3. Provide detailed information about the vulnerability
4. Allow time for patching before public disclosure

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)
- [Zitadel Security](https://zitadel.com/docs/guides/manage/secure)

## License

This security documentation is provided as-is for development and production hardening guidance.
