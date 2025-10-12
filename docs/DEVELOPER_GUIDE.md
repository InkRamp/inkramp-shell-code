# Developer Quick Start Guide

## Using Shared Services

All shared services are now in the `core-services` library. Import them like this:

```typescript
import { 
  RoleService, 
  DummyDataService, 
  MfeLoaderService, 
  EventBusService,
  User,
  UserRole,
  SalesRecord,
  MfeConfig
} from '@org/core-services';
```

## Debug Logs

The application now includes comprehensive debug logging. When you run the app, you'll see logs like:

```
[RoleService] Service initialized
[RoleService] User loaded from session: {name: "John Doe", role: "org-admin"}
[MfeLoaderService] Loading MFE rules (priority: 8)
[DummyDataService] Found 10 sales records for executive: 1
[RoleGuard] Access granted for user: John Doe
```

### Viewing Debug Logs

1. **Open browser console** (F12 or right-click → Inspect → Console)
2. **Filter logs** by service name: `[RoleService]`, `[MfeLoaderService]`, etc.
3. **Track service usage** to understand the flow of your application

### Debug Log Locations

- **RoleService**: 12 logs tracking user management
- **DummyDataService**: 19 logs tracking data operations
- **MfeLoaderService**: 18 logs tracking MFE loading
- **EventBusService**: 5 logs tracking events
- **AuthenticationService**: 4 logs tracking auth operations
- **RoleGuard**: 5 logs tracking route access

### Removing Debug Logs for Production

All debug logs are annotated with `// DEBUG_LOG:` for easy removal:

```bash
# Find all debug logs
grep -r "// DEBUG_LOG:" projects/core-services/src/lib/
grep -r "// DEBUG_LOG:" src/app/

# Or use a build tool to strip console.log in production
```

## Services Overview

### RoleService
Manages user roles and permissions.

```typescript
constructor(private roleService: RoleService) {
  // Get current user
  const user = this.roleService.getCurrentUser();
  
  // Check permissions
  if (this.roleService.canViewOthersData()) {
    // Show admin features
  }
}
```

### DummyDataService
Provides dummy data for development.

```typescript
constructor(private dataService: DummyDataService) {
  // Get sales records for an executive
  const records = this.dataService.getSalesRecordsForExecutive('exec-1');
  
  // Get all incentive rules
  const rules = this.dataService.getIncentiveRules();
}
```

### MfeLoaderService
Manages MFE loading.

```typescript
constructor(private mfeLoader: MfeLoaderService) {
  // Set configurations
  this.mfeLoader.setConfigs(MFE_CONFIGS);
  
  // Preload high-priority MFEs
  await this.mfeLoader.preloadPriorityMfes(UserRole.ORG_ADMIN);
}
```

### EventBusService
Event communication.

```typescript
constructor(private eventBus: EventBusService) {
  // Send event
  this.eventBus.sendEvent('dataUpdated');
  
  // Subscribe to events
  this.eventBus.onePlusNEvents.subscribe(event => {
    console.log('Event received:', event);
  });
}
```

## Documentation

All documentation is now in the `docs/` folder:
- See `docs/QUICK_REFERENCE.md` for API reference
- See `docs/MFE_DEVELOPMENT_GUIDE.md` for MFE development
- See `IMPLEMENTATION_SUMMARY.md` for complete changes overview

## Need Help?

Check the debug logs in the browser console to see what's happening in your application. The logs will show you:
- Which services are being initialized
- What data is being fetched
- Which routes are being accessed
- Any errors that occur with full context
