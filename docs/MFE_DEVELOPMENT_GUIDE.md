# MFE Development Guide

## Next Steps for MFE Creators

This document provides guidance for developers who will create the three MFEs: mfe-CRUD_RULES, mfe-MY_SALES, and mfe-MY_REPORT.

## 1. mfe-CRUD_RULES

### Purpose
Allow admins and team leads to create, read, update, and delete incentive rules.

### Access
- **Route**: `/rules`
- **Allowed Roles**: super-admin, org-admin, team-lead
- **Priority**: 8 (High - preloaded)

### Required Features

#### Display Rules
- Table/list view of all incentive rules
- Columns: Name, Type, Value, Min/Max Amount, Product Category, Status, Created By, Created Date
- Filters: Active/Inactive, Rule Type, Creator
- Sorting: By any column
- Pagination: 10-20 items per page

#### Create Rule
Form with fields:
- Name (required, text)
- Description (required, textarea)
- Type (required, dropdown: percentage, fixed, tiered)
- Value (required, number)
- Min Sales Amount (optional, number)
- Max Sales Amount (optional, number)
- Product Category (optional, dropdown)
- Is Active (toggle, default: true)

Validation:
- Name: 3-100 characters
- Value: > 0
- Max > Min if both provided

#### Update Rule
- Same form as create
- Pre-populate with existing values
- Disable ID field
- Show last modified date/user

#### Delete Rule
- Confirmation dialog
- Soft delete (mark as inactive) or hard delete
- Check for dependencies (rules in use)

### Data Integration

Import shared services:
```typescript
import { DummyDataService } from 'shell/DummyDataService';
import { RoleService } from 'shell/RoleService';
```

Use DummyDataService methods:
- `getIncentiveRules()` - Get all rules
- `addIncentiveRule(rule)` - Create new rule
- `updateIncentiveRule(id, updates)` - Update rule
- `deleteIncentiveRule(id)` - Delete rule

### UI Guidelines
- Use table/grid component
- Modal dialogs for create/edit
- Toast notifications for success/error
- Loading indicators during operations
- Responsive design for mobile/tablet

---

## 2. mfe-MY_SALES

### Purpose
Display sales history for the current user or selected sales executive.

### Access
- **Route**: `/sales`
- **Allowed Roles**: All roles
- **Priority**: 7 (High - preloaded)

### Required Features

#### Sales History Table
Columns:
- Date
- Product Name
- Quantity
- Amount
- Status (completed, pending, cancelled)
- Actions (view details)

Features:
- Date range filter (default: last 6 months)
- Product filter
- Status filter
- Search by product name
- Sort by any column
- Export to CSV/Excel
- Pagination

#### Summary Cards
Display at top:
- Total Sales Amount (current period)
- Number of Transactions
- Average Transaction Value
- Top Product

#### Listen to Sales Executive Changes
For admin/team lead viewing other users' data:

```typescript
window.addEventListener('salesExecutiveChanged', (event: CustomEvent) => {
  const salesExecutiveId = event.detail.salesExecutiveId;
  this.loadSalesData(salesExecutiveId);
});
```

Also check session on load:
```typescript
const selectedId = sessionStorage.getItem('selected_sales_executive_id');
if (selectedId) {
  this.loadSalesData(selectedId);
}
```

### Data Integration

Import shared services:
```typescript
import { DummyDataService } from 'shell/DummyDataService';
import { RoleService } from 'shell/RoleService';
```

Use DummyDataService methods:
- `getSalesRecordsForExecutive(id)` - Get filtered sales
- `salesRecords$` - Observable of all sales records

### UI Guidelines
- Data table with filters
- Summary cards with icons
- Date range picker
- Status badges (color-coded)
- Responsive layout

---

## 3. mfe-MY_REPORT

### Purpose
Show interactive charts and reports for incentives earned.

### Access
- **Route**: `/reports`
- **Allowed Roles**: All roles
- **Priority**: 6 (High - preloaded)

### Required Features

#### Charts

1. **Pie Chart: Incentives by Rule Type**
   - Percentage, Fixed, Tiered
   - Show count and total amount
   - Interactive (click to drill down)

2. **Bar Chart: Monthly Incentives (Last 6 Months)**
   - X-axis: Month
   - Y-axis: Incentive Amount
   - Compare with sales amount (dual axis)
   - Stacked bars for different rule types

3. **Line Chart: Trend Analysis**
   - Monthly incentive trend
   - Moving average line
   - Target line (if applicable)

#### Summary Metrics
- Total Incentives Earned (YTD)
- Pending Incentives
- Approved Incentives
- Paid Incentives
- Average Incentive per Sale

#### Filters
- Date range selector
- Rule type filter
- Status filter (pending, approved, paid)

#### Listen to Sales Executive Changes
Same as mfe-MY_SALES:

```typescript
window.addEventListener('salesExecutiveChanged', (event: CustomEvent) => {
  const salesExecutiveId = event.detail.salesExecutiveId;
  this.loadReportData(salesExecutiveId);
});
```

### Data Integration

Import shared services:
```typescript
import { DummyDataService } from 'shell/DummyDataService';
import { RoleService } from 'shell/RoleService';
```

Use DummyDataService methods:
- `getReportDataForExecutive(id)` - Get report data with breakdown
- `getIncentivesForExecutive(id)` - Get incentives for calculations

### Recommended Chart Library
- Chart.js with ng2-charts
- Or ApexCharts
- Or D3.js for advanced visualizations

### UI Guidelines
- Grid layout for charts (2 columns on desktop, 1 on mobile)
- Interactive legends
- Tooltips with detailed data
- Export chart as image
- Print-friendly view

---

## Common Setup for All MFEs

### 1. Angular Configuration

#### angular.json
```json
{
  "projectType": "application",
  "architect": {
    "build": {
      "builder": "ngx-build-plus:browser",
      "options": {
        "outputPath": "dist/mfe-[NAME]",
        "extraWebpackConfig": "webpack.config.js"
      }
    }
  }
}
```

### 2. Webpack Configuration

#### webpack.config.js
```javascript
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: '[mfe-name]',
  
  filename: 'remoteEntry.js',
  
  exposes: {
    './Component': './src/app/app.component.ts',
  },

  shared: {
    ...shareAll({ 
      singleton: true, 
      strictVersion: true, 
      requiredVersion: 'auto' 
    }),
  },

  remotes: {
    shell: 'https://opensourcekd.github.io/i17e/remoteEntry.js'
  }
});
```

### 3. Accessing Shell Services

#### Import in Component
```typescript
import { Component, OnInit } from '@angular/core';
import { DummyDataService } from 'shell/DummyDataService';
import { RoleService } from 'shell/RoleService';
import { User, UserRole } from 'shell/Models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private roleService: RoleService,
    private dataService: DummyDataService
  ) {}

  ngOnInit() {
    this.roleService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loadData();
    });
  }

  loadData() {
    // Load MFE-specific data
  }
}
```

### 4. TypeScript Configuration

#### Add to tsconfig.json paths
```json
{
  "compilerOptions": {
    "paths": {
      "shell/*": ["node_modules/shell/*"]
    }
  }
}
```

### 5. Standalone Mode Support

For local development without shell:

```typescript
// In app.component.ts
ngOnInit() {
  // Check if running standalone
  const isStandalone = !window['shell'];
  
  if (isStandalone) {
    // Use mock data or local services
    this.initStandaloneMode();
  } else {
    // Use shell services
    this.initFederatedMode();
  }
}
```

---

## Deployment

### Build Commands
```bash
# Development
npm run build -- --configuration development

# Production
npm run build -- --configuration production
```

### Output
All MFEs should build to `dist/mfe-[NAME]/` and be deployed to:
```
https://opensourcekd.github.io/all-mfe-builds/mfe-[NAME]/
```

### Update Shell Configuration
Once deployed, update the URLs in shell's `src/configs/mfe.ts`:

```typescript
{
  id: 'mfe-crud-rules',
  name: 'crud-rules',
  // ... other config
  url: 'https://opensourcekd.github.io/all-mfe-builds/mfe-CRUD_RULES/remoteEntry.js',
}
```

---

## Testing

### Unit Tests
Each MFE should include:
- Component tests
- Service tests (if any local services)
- Guard tests (if any)
- Pipe tests (if any)

### Integration Tests
Test with shell:
1. Run shell locally
2. Point MFE config to localhost
3. Test navigation and data sharing

### E2E Tests
Test complete user flows:
- Create rule → View in sales → See in reports
- Change user → See updated data
- Role-based access

---

## Best Practices

### 1. Error Handling
```typescript
try {
  const data = await this.dataService.getSomething();
} catch (error) {
  console.error('[MFE Name] Error loading data:', error);
  this.showErrorMessage('Failed to load data. Please try again.');
}
```

### 2. Loading States
```typescript
isLoading = false;

async loadData() {
  this.isLoading = true;
  try {
    const data = await this.dataService.getData();
    this.processData(data);
  } finally {
    this.isLoading = false;
  }
}
```

### 3. Subscription Management
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.dataService.data$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.handleData(data);
    });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 4. Responsive Design
Use CSS Grid/Flexbox:
```scss
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}
```

### 5. Accessibility
- Use semantic HTML
- Add ARIA labels
- Keyboard navigation support
- Screen reader friendly

---

## Support

For questions or issues:
1. Check IMPLEMENTATION_NOTES.md in shell repository
2. Review shared service interfaces
3. Test with dummy data first
4. Debug using browser console

## Sample Data Available

The DummyDataService provides:
- 5 sales executives
- 50 sales records (across 5 months)
- 4 incentive rules (different types)
- 30 incentives earned
- Auto-generated report data

All data is realistic and interconnected for testing complete workflows.
