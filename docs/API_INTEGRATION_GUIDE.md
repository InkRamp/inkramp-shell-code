# API Integration Guide

## Overview
This document describes the API integration for the Incentive Management System. The actual backend API is now integrated, replacing the previous dummy data implementation.

## API Configuration

### Base URL
The API endpoint is configurable and currently set to:
```
https://7f1m8qlvpd.execute-api.us-east-1.amazonaws.com/db
```

### Updating the API Endpoint
Since the API domain changes frequently (managed via Pulumi), you can update it in one place:

```typescript
import { updateApiConfig } from '@org/core-services';

// Update the base URL
updateApiConfig({
  baseUrl: 'https://your-new-api-endpoint.com/db'
});
```

Or directly in the configuration file:
`projects/core-services/src/lib/config/api.config.ts`

## Available Services

### 1. Incentive Rules API Service
Manages incentive rules for the brand.

```typescript
import { IncentiveRulesApiService } from '@org/core-services';

constructor(private incentiveRulesApi: IncentiveRulesApiService) {}

// Get all rules
this.incentiveRulesApi.getRules().subscribe(rules => {
  console.log('Incentive rules:', rules);
});

// Get specific rule
this.incentiveRulesApi.getRuleById('rule-id').subscribe(rule => {
  console.log('Rule:', rule);
});

// Create new rule
this.incentiveRulesApi.createRule({
  name: 'New Rule',
  description: 'Rule description',
  type: 'percentage',
  value: 10,
  isActive: true
}).subscribe(rule => {
  console.log('Created rule:', rule);
});

// Update rule
this.incentiveRulesApi.updateRule('rule-id', {
  isActive: false
}).subscribe(rule => {
  console.log('Updated rule:', rule);
});

// Delete rule
this.incentiveRulesApi.deleteRule('rule-id').subscribe(success => {
  console.log('Deleted:', success);
});
```

### 2. Incentives API Service
Manages incentives earned by users.

```typescript
import { IncentivesApiService } from '@org/core-services';

constructor(private incentivesApi: IncentivesApiService) {}

// Get all incentives
this.incentivesApi.getIncentives().subscribe(incentives => {
  console.log('Incentives:', incentives);
});

// Get incentives for specific user
this.incentivesApi.getIncentives({ userId: 'user-123' }).subscribe(incentives => {
  console.log('User incentives:', incentives);
});

// Get incentives by status
this.incentivesApi.getIncentives({ status: 'approved' }).subscribe(incentives => {
  console.log('Approved incentives:', incentives);
});

// Create incentive
this.incentivesApi.createIncentive({
  userId: 'user-123',
  ruleId: 'rule-456',
  amount: 1000,
  earnedDate: new Date().toISOString()
}).subscribe(incentive => {
  console.log('Created incentive:', incentive);
});

// Update incentive
this.incentivesApi.updateIncentive('incentive-id', {
  status: 'approved'
}).subscribe(incentive => {
  console.log('Updated incentive:', incentive);
});
```

### 3. Targets API Service
Manages user targets.

```typescript
import { TargetsApiService } from '@org/core-services';

constructor(private targetsApi: TargetsApiService) {}

// Get all targets
this.targetsApi.getTargets().subscribe(targets => {
  console.log('Targets:', targets);
});

// Get targets for specific user
this.targetsApi.getTargets({ userId: 'user-123' }).subscribe(targets => {
  console.log('User targets:', targets);
});

// Create target
this.targetsApi.createTarget({
  userId: 'user-123',
  name: 'Q1 Sales Target',
  targetValue: 100000,
  unit: 'revenue',
  startDate: '2024-01-01',
  endDate: '2024-03-31'
}).subscribe(target => {
  console.log('Created target:', target);
});

// Update target
this.targetsApi.updateTarget('target-id', {
  currentValue: 50000
}).subscribe(target => {
  console.log('Updated target:', target);
});

// Delete target
this.targetsApi.deleteTarget('target-id').subscribe(success => {
  console.log('Deleted:', success);
});
```

### 4. Tasks API Service
Manages user tasks.

```typescript
import { TasksApiService } from '@org/core-services';

constructor(private tasksApi: TasksApiService) {}

// Get all tasks
this.tasksApi.getTasks().subscribe(tasks => {
  console.log('Tasks:', tasks);
});

// Get tasks for specific user
this.tasksApi.getTasks({ userId: 'user-123' }).subscribe(tasks => {
  console.log('User tasks:', tasks);
});

// Create task
this.tasksApi.createTask({
  userId: 'user-123',
  title: 'Complete sales report',
  priority: 'high',
  dueDate: '2024-12-31'
}).subscribe(task => {
  console.log('Created task:', task);
});

// Update task
this.tasksApi.updateTask('task-id', {
  status: 'completed',
  completedDate: new Date().toISOString()
}).subscribe(task => {
  console.log('Updated task:', task);
});

// Delete task
this.tasksApi.deleteTask('task-id').subscribe(success => {
  console.log('Deleted:', success);
});
```

## Brand Context

All API calls automatically use the current brand ID from the `BrandContextService`.

```typescript
import { BrandContextService } from '@org/core-services';

constructor(private brandContext: BrandContextService) {}

// Get current brand ID
const brandId = this.brandContext.getBrandId();

// Set brand ID
this.brandContext.setBrandId('my-brand-id');

// Subscribe to brand ID changes
this.brandContext.brandId$.subscribe(brandId => {
  console.log('Brand ID changed:', brandId);
});
```

## Authentication & Token Storage

### Token Storage
Authentication tokens are now stored in **sessionStorage** (not localStorage) for better security:

```typescript
import { AuthService } from '@org/core-services';

constructor(private auth: AuthService) {}

// Get token (automatically from sessionStorage)
const token = this.auth.getToken();

// Check if authenticated
if (this.auth.isAuthenticated()) {
  console.log('User is authenticated');
}
```

### Authentication Events
The auth service emits events via the EventBus that MicroApps can consume:

```typescript
import { EventBusService } from '@org/core-services';

constructor(private eventBus: EventBusService) {}

ngOnInit() {
  // Subscribe to authentication events
  this.eventBus.onePlusNEvents.subscribe(event => {
    try {
      const parsedEvent = JSON.parse(event as string);
      
      if (parsedEvent.type === 'auth:token_updated') {
        console.log('Token updated:', parsedEvent.payload);
      } else if (parsedEvent.type === 'auth:user_info_updated') {
        console.log('User info updated:', parsedEvent.payload);
      } else if (parsedEvent.type === 'auth:logout') {
        console.log('User logged out');
      }
    } catch (e) {
      // Not a JSON event, ignore
    }
  });
}
```

## Local Development User Mimicking

For local development, you can mimic different users without authentication:

```typescript
import { RoleService, User, UserRole } from '@org/core-services';

// In browser console or component
const testUser: User = {
  id: 'test-123',
  name: 'Test Admin',
  email: 'test@example.com',
  role: UserRole.SUPER_ADMIN
};

// Set dev mimic user
localStorage.setItem('dev_mimic_user', JSON.stringify(testUser));

// Or use the service method
const roleService = inject(RoleService);
roleService.setDevMimicUser(testUser);

// Clear mimic user
roleService.setDevMimicUser(null);
```

This allows you to test different user roles and permissions without going through the full authentication flow.

## Error Handling

All API services handle errors gracefully and return default values to prevent UI breakage:

- List endpoints return empty arrays `[]` on error
- Single item endpoints return `null` on error
- Delete/Update endpoints return `false` on error

Errors are logged to console for debugging:

```typescript
this.incentiveRulesApi.getRules().subscribe(rules => {
  // rules will be [] if API fails
  // Check console for error details
  if (rules.length === 0) {
    console.log('No rules found or error occurred');
  }
});
```

## GraphQL Migration Preparation

The current implementation is structured to make GraphQL migration easy:

1. **Service Layer**: All API calls are abstracted in service classes
2. **Models**: Clear separation between API models and domain models
3. **Configuration**: Centralized endpoint configuration
4. **Pure Functions**: Services use pure functions that can be easily adapted

To migrate to GraphQL:
1. Replace HTTP calls with GraphQL queries/mutations
2. Update the API models to match GraphQL schema
3. Keep the same service interfaces
4. Update `api.config.ts` to point to GraphQL endpoint

## Best Practices

1. **Always use the service layer** - Don't make direct HTTP calls
2. **Subscribe to observables** - All methods return RxJS Observables
3. **Handle errors** - Services return safe defaults, but log errors for debugging
4. **Use brandId context** - Don't hardcode brand IDs
5. **Keep concerns separated** - Zitadel for auth, API for data
6. **Test with dev mimic** - Use local dev user mimicking for testing

## Related Files

- API Configuration: `projects/core-services/src/lib/config/api.config.ts`
- API Models: `projects/core-services/src/lib/models/api.model.ts`
- Brand Context: `projects/core-services/src/lib/brand-context.service.ts`
- Auth Service: `projects/core-services/src/lib/auth.service.ts`
- Role Service: `projects/core-services/src/lib/role.service.ts`
- API Services:
  - `projects/core-services/src/lib/incentive-rules-api.service.ts`
  - `projects/core-services/src/lib/incentives-api.service.ts`
  - `projects/core-services/src/lib/targets-api.service.ts`
  - `projects/core-services/src/lib/tasks-api.service.ts`
