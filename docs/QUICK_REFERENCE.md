# Quick Reference - Shared Services & Models

## Role Service

### Import
```typescript
import { RoleService } from 'shell/RoleService';
import { User, UserRole } from 'shell/Models';
```

### Methods
```typescript
// Get current user
getCurrentUser(): User | null

// Get current user role
getCurrentUserRole(): UserRole | null

// Check if has required role
hasRole(requiredRole: UserRole): boolean

// Check if can view others' data
canViewOthersData(): boolean

// Set current user
setCurrentUser(user: User | null): void

// Subscribe to user changes
currentUser$: Observable<User | null>
```

### UserRole Enum
```typescript
enum UserRole {
  SUPER_ADMIN = 'super-admin',      // Level 4 - Highest
  ORG_ADMIN = 'org-admin',          // Level 3
  TEAM_LEAD = 'team-lead',          // Level 2
  SALES_EXECUTIVE = 'sales-executive' // Level 1
}
```

---

## Dummy Data Service

### Import
```typescript
import { DummyDataService } from 'shell/DummyDataService';
import { 
  SalesRecord, 
  IncentiveRule, 
  IncentiveEarned, 
  ReportData, 
  SalesExecutive 
} from 'shell/Models';
```

### Methods - Read Operations
```typescript
// Get all sales executives
getSalesExecutives(): SalesExecutive[]

// Get sales records for specific executive
getSalesRecordsForExecutive(salesExecutiveId: string): SalesRecord[]

// Get incentives for specific executive
getIncentivesForExecutive(salesExecutiveId: string): IncentiveEarned[]

// Get report data for specific executive
getReportDataForExecutive(salesExecutiveId: string): ReportData

// Get all incentive rules
getIncentiveRules(): IncentiveRule[]
```

### Methods - Write Operations (Rules Only)
```typescript
// Add new rule
addIncentiveRule(rule: IncentiveRule): void

// Update existing rule
updateIncentiveRule(ruleId: string, updates: Partial<IncentiveRule>): void

// Delete rule
deleteIncentiveRule(ruleId: string): void
```

### Observables
```typescript
salesExecutives$: Observable<SalesExecutive[]>
salesRecords$: Observable<SalesRecord[]>
incentiveRules$: Observable<IncentiveRule[]>
incentivesEarned$: Observable<IncentiveEarned[]>
```

---

## Data Models

### SalesExecutive
```typescript
interface SalesExecutive {
  id: string;
  name: string;
  email: string;
  teamId?: string;
}
```

### SalesRecord
```typescript
interface SalesRecord {
  id: string;
  salesExecutiveId: string;
  salesExecutiveName: string;
  date: Date;
  productName: string;
  amount: number;
  quantity: number;
  status: 'completed' | 'pending' | 'cancelled';
}
```

### IncentiveRule
```typescript
interface IncentiveRule {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'tiered';
  value: number;
  minSalesAmount?: number;
  maxSalesAmount?: number;
  productCategory?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}
```

### IncentiveEarned
```typescript
interface IncentiveEarned {
  id: string;
  salesExecutiveId: string;
  salesExecutiveName: string;
  ruleId: string;
  ruleName: string;
  salesRecordId: string;
  amount: number;
  earnedDate: Date;
  status: 'pending' | 'approved' | 'paid';
}
```

### ReportData
```typescript
interface ReportData {
  salesExecutiveId: string;
  salesExecutiveName: string;
  totalSales: number;
  totalIncentives: number;
  period: string;
  breakdown: {
    month: string;
    sales: number;
    incentives: number;
  }[];
}
```

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
```

---

## MFE Loader Service

### Import
```typescript
import { MfeLoaderService } from 'shell/MfeLoaderService';
import { MfeConfig } from 'shell/Models';
```

### Methods
```typescript
// Get all MFE configs
getConfigs(): MfeConfig[]

// Get configs for specific role
getConfigsForRole(userRole: UserRole): MfeConfig[]

// Get config by name
getConfigByName(name: string): MfeConfig | undefined

// Load specific MFE
loadMfe(config: MfeConfig): Promise<any>

// Preload high-priority MFEs
preloadPriorityMfes(userRole: UserRole): Promise<void>

// Check load status
isMfeLoaded(name: string): boolean
isMfeLoading(name: string): boolean
```

### MfeConfig
```typescript
interface MfeConfig {
  id: string;
  name: string;
  displayName: string;
  remoteName: string;
  exposedModule: string;
  url: string;
  route: string;
  allowedRoles: UserRole[];
  priority: number;  // 10=critical, 5-9=high, 1-4=normal
  icon?: string;
}
```

---

## Event Communication

### Sales Executive Selection Change
MFEs should listen to this event when admin/team-lead selects a different user to view:

```typescript
// Component
ngOnInit() {
  window.addEventListener('salesExecutiveChanged', this.handleExecutiveChange.bind(this));
  
  // Also check session on init
  const selectedId = sessionStorage.getItem('selected_sales_executive_id');
  if (selectedId) {
    this.loadDataForExecutive(selectedId);
  }
}

handleExecutiveChange(event: CustomEvent) {
  const salesExecutiveId = event.detail.salesExecutiveId;
  this.loadDataForExecutive(salesExecutiveId);
}

ngOnDestroy() {
  window.removeEventListener('salesExecutiveChanged', this.handleExecutiveChange);
}
```

---

## Common Patterns

### Get Current or Selected User Data
```typescript
import { RoleService } from 'shell/RoleService';
import { DummyDataService } from 'shell/DummyDataService';

constructor(
  private roleService: RoleService,
  private dataService: DummyDataService
) {}

loadData() {
  // Get the user ID to load data for
  const selectedId = sessionStorage.getItem('selected_sales_executive_id');
  const currentUser = this.roleService.getCurrentUser();
  
  // Use selected ID if available and user can view others, else use current user
  const userId = (selectedId && this.roleService.canViewOthersData()) 
    ? selectedId 
    : currentUser?.id;
    
  if (userId) {
    const salesData = this.dataService.getSalesRecordsForExecutive(userId);
    const incentives = this.dataService.getIncentivesForExecutive(userId);
    // Process data...
  }
}
```

### Role-Based Feature Display
```typescript
import { RoleService, UserRole } from 'shell/RoleService';

constructor(private roleService: RoleService) {}

ngOnInit() {
  this.roleService.currentUser$.subscribe(user => {
    this.canCreateRules = this.roleService.hasRole(UserRole.TEAM_LEAD);
    this.canViewAllData = this.roleService.canViewOthersData();
  });
}
```

### Observable Data Loading
```typescript
import { DummyDataService } from 'shell/DummyDataService';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

private destroy$ = new Subject<void>();

ngOnInit() {
  this.dataService.incentiveRules$
    .pipe(takeUntil(this.destroy$))
    .subscribe(rules => {
      this.rules = rules.filter(r => r.isActive);
    });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## Session Storage Keys

| Key | Value | Set By | Used By |
|-----|-------|--------|---------|
| `current_user` | JSON stringified User | RoleService | Shell, all MFEs |
| `selected_sales_executive_id` | User ID string | Shell (user selector) | MFEs for data filtering |

---

## Error Handling Template

```typescript
async loadData() {
  try {
    this.isLoading = true;
    this.error = null;
    
    const data = await this.dataService.getSomething();
    this.processData(data);
    
  } catch (error) {
    console.error('[MFE Name] Error:', error);
    this.error = 'Failed to load data. Please try again.';
    
  } finally {
    this.isLoading = false;
  }
}
```

---

## Useful RxJS Operators

```typescript
import { map, filter, tap, catchError, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';

// Filter and map
this.dataService.salesRecords$
  .pipe(
    map(records => records.filter(r => r.status === 'completed')),
    tap(records => console.log('Filtered records:', records.length)),
    takeUntil(this.destroy$)
  )
  .subscribe(records => this.completedRecords = records);

// Error handling
this.dataService.incentiveRules$
  .pipe(
    catchError(error => {
      console.error('Error loading rules:', error);
      return of([]); // Return empty array on error
    }),
    takeUntil(this.destroy$)
  )
  .subscribe(rules => this.rules = rules);
```

---

## TypeScript Tips

### Type Guards
```typescript
function isSalesExecutive(user: User): boolean {
  return user.role === UserRole.SALES_EXECUTIVE;
}

if (isSalesExecutive(currentUser)) {
  // TypeScript knows user is sales executive
}
```

### Optional Chaining
```typescript
const userName = currentUser?.name ?? 'Unknown';
const teamId = salesExecutive?.teamId;
```

### Array Operations
```typescript
// Sum amounts
const total = incentives.reduce((sum, i) => sum + i.amount, 0);

// Group by status
const grouped = incentives.reduce((acc, i) => {
  acc[i.status] = acc[i.status] || [];
  acc[i.status].push(i);
  return acc;
}, {} as Record<string, IncentiveEarned[]>);

// Find max
const maxSale = Math.max(...salesRecords.map(r => r.amount));
```

---

## Debug Helpers

### Console Logging
```typescript
// In component
console.log('[MFE Name] Current user:', this.roleService.getCurrentUser());
console.log('[MFE Name] Selected executive:', sessionStorage.getItem('selected_sales_executive_id'));
console.log('[MFE Name] Available rules:', this.dataService.getIncentiveRules());
```

### Check Service Availability
```typescript
ngOnInit() {
  console.log('Shell services available:', {
    roleService: !!this.roleService,
    dataService: !!this.dataService,
    mfeLoader: !!this.mfeLoader
  });
}
```

### Monitor Events
```typescript
window.addEventListener('salesExecutiveChanged', (e) => {
  console.log('Sales executive changed:', e.detail);
});
```
