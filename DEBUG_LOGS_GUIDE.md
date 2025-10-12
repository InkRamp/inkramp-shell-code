# Debug Logs Guide

## Overview

This application now includes comprehensive debug logging to make debugging easier. All debug logs are annotated with `// DEBUG_LOG:` comments for easy identification and removal.

## Debug Log Pattern

```typescript
// DEBUG_LOG: <description of what's being logged>
console.log('[ServiceName] <message>', data);
```

## Services with Debug Logs

### 1. RoleService (12 logs)

**Location**: `projects/core-services/src/lib/role.service.ts`

**Logs**:
- Service initialization
- User loading from session storage
- User loaded from session
- Default user creation
- Setting current user
- User saved to/removed from session
- Getting current user
- Getting current user role
- Role permission checks

**Example**:
```
[RoleService] Service initialized
[RoleService] Loading user from session storage
[RoleService] User loaded from session: {id: "1", name: "John Doe"}
[RoleService] hasRole() - Checking if org-admin has team-lead: true
```

### 2. DummyDataService (19 logs)

**Location**: `projects/core-services/src/lib/dummy-data.service.ts`

**Logs**:
- Service initialization with data counts
- Generating sales executives
- Generating sales records
- Generating incentive rules
- Generating incentives earned
- Fetching records for executive
- Fetching incentives for executive
- Generating report data
- Getting all sales executives
- Getting all incentive rules
- Adding new incentive rule
- Updating incentive rule
- Deleting incentive rule

**Example**:
```
[DummyDataService] Service initialized
[DummyDataService] Generated data: {salesExecutives: 5, salesRecords: 50, ...}
[DummyDataService] getSalesRecordsForExecutive() called for: 1
[DummyDataService] Found 10 sales records for executive: 1
```

### 3. MfeLoaderService (18 logs)

**Location**: `projects/core-services/src/lib/mfe-loader.service.ts`

**Logs**:
- Service initialization
- Setting MFE configurations
- Configurations sorted by priority
- Getting all configurations
- Getting configs for specific role
- Getting config by name
- Preloading priority MFEs
- MFE already loaded
- MFE already loading
- Starting MFE load with config details
- Successfully loaded MFE
- Error loading MFE with config details
- Checking if MFE is loaded/loading

**Example**:
```
[MfeLoaderService] Service initialized
[MfeLoaderService] setConfigs() called with 3 configurations
[MfeLoaderService] Loading MFE rules (priority: 8)
[MfeLoaderService] MFE config: {name: "rules", url: "...", exposedModule: "./Module"}
[MfeLoaderService] Successfully loaded MFE rules
```

### 4. EventBusService (5 logs)

**Location**: `projects/core-services/src/lib/event-bus.service.ts`

**Logs**:
- Service initialization
- Event listener registration
- Event received and forwarded
- Sending event
- Event emitted successfully

**Example**:
```
[EventBusService] Service initialized
[EventBusService] Event listener registered for all events
[EventBusService] sendEvent() called with: userChanged
[EventBusService] Event emitted successfully
```

### 5. AuthenticationService (4 logs)

**Location**: `src/app/services/authentication.service.ts`

**Logs**:
- Service initialization
- Initiating login
- Initiating logout
- Fetching user profile

**Example**:
```
[AuthenticationService] Service initialized
[AuthenticationService] login() called, redirecting to backend login endpoint
[AuthenticationService] getUserProfile() called, fetching from backend
```

### 6. RoleGuard (5 logs)

**Location**: `src/app/guards/role.guard.ts`

**Logs**:
- Guard checking access
- No user found
- Current user found with details
- User not authorized
- Access granted

**Example**:
```
[RoleGuard] Checking access for allowed roles: ["org-admin", "team-lead"]
[RoleGuard] Current user: John Doe Role: org-admin
[RoleGuard] Access granted for user: John Doe
```

## Using Debug Logs

### 1. View in Browser Console

```
1. Open Developer Tools (F12)
2. Go to Console tab
3. See logs in real-time
```

### 2. Filter by Service

```javascript
// In browser console, filter by:
[RoleService]
[DummyDataService]
[MfeLoaderService]
// etc.
```

### 3. Track Service Flow

The logs help you understand:
- Which services are being initialized
- What data is being loaded
- Which routes are being accessed
- What errors are occurring
- Service interaction patterns

## Removing Debug Logs for Production

### Option 1: Manual Removal

```bash
# Find all debug logs
grep -r "// DEBUG_LOG:" projects/core-services/src/lib/
grep -r "// DEBUG_LOG:" src/app/

# Edit files and remove lines with DEBUG_LOG comments
```

### Option 2: Build Configuration

Configure your build tool to strip console.log statements in production:

**TypeScript/Webpack**:
```javascript
// Use terser or similar to remove console.log in production
```

**Angular CLI**:
```json
// In angular.json, configure production build to remove logs
{
  "optimization": true,
  "sourceMap": false
}
```

### Option 3: Search and Replace

```bash
# Example: Remove all lines containing DEBUG_LOG and the following console.log
# (Review changes before committing!)
```

## Best Practices

1. **Keep logs during development** - They help identify issues quickly
2. **Use browser console filters** - Filter by [ServiceName] for focused debugging
3. **Check logs when errors occur** - The context will help identify the root cause
4. **Remove before production** - Use the DEBUG_LOG annotation to find and remove
5. **Consider logging levels** - For future: Add different log levels (info, warn, error)

## Statistics

- **Total Services with Logs**: 6
- **Total Debug Annotations**: 63
- **Services in Shared Library**: 4 (RoleService, DummyDataService, MfeLoaderService, EventBusService)
- **Services in Shell**: 1 with logs (AuthenticationService)
- **Guards with Logs**: 1 (RoleGuard)

## Examples of Debug Output

### Service Initialization
```
[RoleService] Service initialized
[DummyDataService] Service initialized
[MfeLoaderService] Service initialized
[EventBusService] Service initialized
[AuthenticationService] Service initialized
```

### Data Operations
```
[DummyDataService] getSalesRecordsForExecutive() called for: 1
[DummyDataService] Found 10 sales records for executive: 1
[DummyDataService] getReportDataForExecutive() called for: 1
[DummyDataService] Report data generated: {totalSales: 45000, ...}
```

### MFE Loading
```
[MfeLoaderService] preloadPriorityMfes() called for role: org-admin
[MfeLoaderService] Preloading 2 priority MFEs: [{name: "rules", priority: 8}, ...]
[MfeLoaderService] Loading MFE rules (priority: 8)
[MfeLoaderService] Successfully loaded MFE rules
```

### Route Guards
```
[RoleGuard] Checking access for allowed roles: ["org-admin", "team-lead"]
[RoleGuard] Current user: John Doe Role: org-admin
[RoleGuard] Access granted for user: John Doe
```

### Error Tracking
```
[MfeLoaderService] Error loading MFE sales: TypeError: Failed to fetch
[MfeLoaderService] Failed config: {name: "sales", url: "...", exposedModule: "..."}
```

---

**Last Updated**: October 12, 2025  
**Status**: Active - Use during development  
**Removal**: Before production deployment
