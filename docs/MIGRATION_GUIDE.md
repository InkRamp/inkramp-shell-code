# Migration Guide: From Dummy Data to Real API

## Overview
This guide shows how to migrate from dummy data services to the real API services.

## Example: Incentive Rules Migration

### Before (Using Dummy Data)
```typescript
import { Component, OnInit } from '@angular/core';
import { DummyDataService, IncentiveRule } from '@org/core-services';

@Component({
  selector: 'app-rules',
  template: `
    <div *ngFor="let rule of rules">
      {{ rule.name }}
    </div>
  `
})
export class RulesComponent implements OnInit {
  rules: IncentiveRule[] = [];

  constructor(private dummyData: DummyDataService) {}

  ngOnInit() {
    // Using dummy data
    this.rules = this.dummyData.getIncentiveRules();
  }
}
```

### After (Using Real API)
```typescript
import { Component, OnInit } from '@angular/core';
import { IncentiveRulesApiService, ApiIncentiveRule } from '@org/core-services';

@Component({
  selector: 'app-rules',
  template: `
    <div *ngFor="let rule of rules">
      {{ rule.name }}
    </div>
  `
})
export class RulesComponent implements OnInit {
  rules: ApiIncentiveRule[] = [];

  constructor(private rulesApi: IncentiveRulesApiService) {}

  ngOnInit() {
    // Using real API
    this.rulesApi.getRules().subscribe(rules => {
      this.rules = rules;
    });
  }
}
```

## Model Mapping

Some field differences between dummy data models and API models:

### Incentive Rules
- Dummy: `createdAt: Date`
- API: `createdAt: string` (ISO date string)
- Solution: Parse dates when needed

```typescript
// Convert API date string to Date object
const date = new Date(apiRule.createdAt);
```

### Incentives
- Dummy: `earnedDate: Date`
- API: `earnedDate: string` (ISO date string)

### Targets
- API adds: `brandId`, `createdAt`, `updatedAt`
- API uses: `currentValue` field for progress tracking

### Tasks
- API adds: `completedDate`, `createdAt`, `updatedAt`
- API uses: Different status values

## Hybrid Approach (Development vs Production)

You can use environment variables or feature flags to switch between dummy data and real API:

```typescript
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { 
  IncentiveRulesApiService, 
  DummyDataService, 
  ApiIncentiveRule,
  IncentiveRule 
} from '@org/core-services';

@Injectable({
  providedIn: 'root'
})
export class IncentiveRulesService {
  private useRealApi = true; // Could be from environment

  constructor(
    private rulesApi: IncentiveRulesApiService,
    private dummyData: DummyDataService
  ) {}

  getRules(): Observable<any[]> {
    if (this.useRealApi) {
      return this.rulesApi.getRules();
    } else {
      return of(this.dummyData.getIncentiveRules());
    }
  }
}
```

## Progressive Migration Strategy

1. **Phase 1: Add API services alongside dummy data**
   - Keep existing dummy data working
   - Add new API services
   - Test API integration

2. **Phase 2: Create adapter layer**
   - Create services that can use either dummy or real API
   - Use feature flags or environment variables

3. **Phase 3: Migrate components one at a time**
   - Update one MFE at a time
   - Test thoroughly
   - Monitor for issues

4. **Phase 4: Remove dummy data**
   - Once all components use real API
   - Remove unused dummy data code
   - Clean up imports

## Testing with Dev Mimic

When testing API integration locally:

```typescript
// In browser console or app initialization
const testUser = {
  id: 'user-1',
  name: 'John Admin',
  email: 'john.admin@company.com',
  role: 'super-admin'
};

localStorage.setItem('dev_mimic_user', JSON.stringify(testUser));

// Also set brand ID if needed
sessionStorage.setItem('current_brand_id', 'my-test-brand');
```

## Common Patterns

### Loading State
```typescript
export class MyComponent implements OnInit {
  loading = false;
  data: any[] = [];

  constructor(private api: SomeApiService) {}

  ngOnInit() {
    this.loading = true;
    this.api.getData().subscribe({
      next: (data) => {
        this.data = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.loading = false;
      }
    });
  }
}
```

### Error Handling
```typescript
export class MyComponent {
  errorMessage: string | null = null;

  loadData() {
    this.errorMessage = null;
    this.api.getData().subscribe({
      next: (data) => {
        this.data = data;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load data. Please try again.';
        console.error('API Error:', err);
      }
    });
  }
}
```

### Create/Update/Delete
```typescript
export class MyComponent {
  createRule() {
    const newRule = {
      name: 'New Rule',
      description: 'Description',
      type: 'percentage' as const,
      value: 10,
      isActive: true
    };

    this.rulesApi.createRule(newRule).subscribe({
      next: (rule) => {
        if (rule) {
          console.log('Rule created:', rule);
          this.refreshRules();
        } else {
          console.error('Failed to create rule');
        }
      }
    });
  }

  updateRule(ruleId: string) {
    this.rulesApi.updateRule(ruleId, { isActive: false }).subscribe({
      next: (rule) => {
        if (rule) {
          console.log('Rule updated:', rule);
        }
      }
    });
  }

  deleteRule(ruleId: string) {
    if (confirm('Are you sure you want to delete this rule?')) {
      this.rulesApi.deleteRule(ruleId).subscribe({
        next: (success) => {
          if (success) {
            console.log('Rule deleted');
            this.refreshRules();
          }
        }
      });
    }
  }
}
```

## Checklist for Migration

- [ ] Identify all components using dummy data
- [ ] Update imports to use API services
- [ ] Update model types (e.g., Date to string)
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test with real API endpoint
- [ ] Test with dev mimic users
- [ ] Test error scenarios
- [ ] Update tests
- [ ] Remove unused dummy data code
- [ ] Update documentation

## Need Help?

- Review `docs/API_INTEGRATION_GUIDE.md` for detailed API documentation
- Check console logs for API errors
- Use dev mimic for testing different user scenarios
- Test with small datasets first
