# Multi-MFE Examples

Quick reference examples for using the Multi-MFE Wrapper component.

## Basic Usage

### Example 1: Simple Multi-MFE Page

```typescript
// my-dashboard.component.ts
import { Component } from '@angular/core';
import { MfeWrapperComponent } from '../mfe-wrapper/mfe-wrapper.component';

@Component({
  selector: 'app-my-dashboard',
  standalone: true,
  imports: [MfeWrapperComponent],
  template: `
    <h1>My Dashboard</h1>
    <app-mfe-wrapper 
      [names]="['my-sales', 'my-report']"
      [lazyLoad]="true">
    </app-mfe-wrapper>
  `
})
export class MyDashboardComponent {
}
```

### Example 2: Role-Based Dynamic MFEs

```typescript
// admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { MfeWrapperComponent } from '../mfe-wrapper/mfe-wrapper.component';
import { RoleService } from '../../services/role.service';
import { UserRole } from '../../models/roles.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [MfeWrapperComponent],
  template: `
    <h1>Admin Dashboard</h1>
    <app-mfe-wrapper 
      [names]="adminMfes"
      [lazyLoad]="true">
    </app-mfe-wrapper>
  `
})
export class AdminDashboardComponent implements OnInit {
  adminMfes: string[] = [];

  constructor(private roleService: RoleService) {}

  ngOnInit() {
    const user = this.roleService.getCurrentUser();
    
    if (user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ORG_ADMIN) {
      this.adminMfes = ['crud-rules', 'my-sales', 'my-report'];
    } else {
      this.adminMfes = ['my-sales', 'my-report'];
    }
  }
}
```

### Example 3: Priority Loading Strategy

```typescript
// performance-dashboard.component.ts
import { Component } from '@angular/core';
import { MfeWrapperComponent } from '../mfe-wrapper/mfe-wrapper.component';

@Component({
  selector: 'app-performance-dashboard',
  standalone: true,
  imports: [MfeWrapperComponent],
  template: `
    <div class="dashboard">
      <!-- Critical MFEs - load immediately (no lazy load) -->
      <section class="critical-section">
        <h2>Critical Information</h2>
        <app-mfe-wrapper 
          [names]="criticalMfes"
          [lazyLoad]="false">
        </app-mfe-wrapper>
      </section>

      <!-- Additional MFEs - lazy load -->
      <section class="additional-section">
        <h2>Additional Information</h2>
        <app-mfe-wrapper 
          [names]="additionalMfes"
          [lazyLoad]="true">
        </app-mfe-wrapper>
      </section>
    </div>
  `,
  styles: [`
    .critical-section {
      margin-bottom: 2rem;
    }
  `]
})
export class PerformanceDashboardComponent {
  criticalMfes = ['my-sales']; // Above the fold - load immediately
  additionalMfes = ['my-report', 'pokemon']; // Below the fold - lazy load
}
```

### Example 4: Conditional MFE Display

```typescript
// conditional-dashboard.component.ts
import { Component } from '@angular/core';
import { MfeWrapperComponent } from '../mfe-wrapper/mfe-wrapper.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conditional-dashboard',
  standalone: true,
  imports: [CommonModule, MfeWrapperComponent],
  template: `
    <div class="dashboard">
      <div class="controls">
        <button (click)="toggleReports()">
          {{ showReports ? 'Hide' : 'Show' }} Reports
        </button>
      </div>

      <!-- Always show sales -->
      <app-mfe-wrapper 
        [names]="['my-sales']"
        [lazyLoad]="false">
      </app-mfe-wrapper>

      <!-- Conditionally show reports -->
      <app-mfe-wrapper 
        *ngIf="showReports"
        [names]="['my-report']"
        [lazyLoad]="true">
      </app-mfe-wrapper>
    </div>
  `
})
export class ConditionalDashboardComponent {
  showReports = false;

  toggleReports() {
    this.showReports = !this.showReports;
  }
}
```

### Example 5: Using Route Data

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { MfeWrapperComponent } from './components/mfe-wrapper/mfe-wrapper.component';

export const routes: Routes = [
  {
    path: 'multi-dashboard',
    component: MfeWrapperComponent,
    data: { 
      mfeNames: ['my-sales', 'my-report', 'pokemon']
    }
  }
];
```

```typescript
// Enhanced MfeWrapperComponent (if you want to support route data)
// In ngAfterViewInit, add:
const routeMfeNames = this.route.snapshot.data['mfeNames'];
if (routeMfeNames && Array.isArray(routeMfeNames)) {
  mfeNames = routeMfeNames;
}
```

### Example 6: Programmatic MFE Management

```typescript
// dynamic-mfe-manager.component.ts
import { Component } from '@angular/core';
import { MfeWrapperComponent } from '../mfe-wrapper/mfe-wrapper.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dynamic-mfe-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, MfeWrapperComponent],
  template: `
    <div class="manager">
      <h2>MFE Manager</h2>
      
      <div class="controls">
        <label>
          Available MFEs:
          <select [(ngModel)]="selectedMfe">
            <option value="">-- Select MFE --</option>
            <option *ngFor="let mfe of availableMfes" [value]="mfe">
              {{ mfe }}
            </option>
          </select>
        </label>
        <button (click)="addMfe()" [disabled]="!selectedMfe">
          Add MFE
        </button>
      </div>

      <div class="active-mfes">
        <h3>Active MFEs:</h3>
        <ul>
          <li *ngFor="let mfe of activeMfes; let i = index">
            {{ mfe }}
            <button (click)="removeMfe(i)">Remove</button>
          </li>
        </ul>
      </div>

      <app-mfe-wrapper 
        [names]="activeMfes"
        [lazyLoad]="true">
      </app-mfe-wrapper>
    </div>
  `
})
export class DynamicMfeManagerComponent {
  availableMfes = ['pokemon', 'my-sales', 'my-report'];
  activeMfes: string[] = [];
  selectedMfe = '';

  addMfe() {
    if (this.selectedMfe && !this.activeMfes.includes(this.selectedMfe)) {
      this.activeMfes = [...this.activeMfes, this.selectedMfe];
      this.selectedMfe = '';
    }
  }

  removeMfe(index: number) {
    this.activeMfes = this.activeMfes.filter((_, i) => i !== index);
  }
}
```

### Example 7: User Preference Based Loading

```typescript
// preference-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { MfeWrapperComponent } from '../mfe-wrapper/mfe-wrapper.component';

@Component({
  selector: 'app-preference-dashboard',
  standalone: true,
  imports: [MfeWrapperComponent],
  template: `
    <h1>My Personalized Dashboard</h1>
    <app-mfe-wrapper 
      [names]="userPreferredMfes"
      [lazyLoad]="true">
    </app-mfe-wrapper>
  `
})
export class PreferenceDashboardComponent implements OnInit {
  userPreferredMfes: string[] = [];

  ngOnInit() {
    // Load user preferences from localStorage
    const savedPreferences = localStorage.getItem('user_mfe_preferences');
    
    if (savedPreferences) {
      this.userPreferredMfes = JSON.parse(savedPreferences);
    } else {
      // Default MFEs if no preference saved
      this.userPreferredMfes = ['my-sales', 'my-report'];
    }
  }

  savePreferences() {
    localStorage.setItem('user_mfe_preferences', JSON.stringify(this.userPreferredMfes));
  }
}
```

## Advanced Patterns

### Pattern 1: MFE Communication via Event Bus

```typescript
// event-bus-dashboard.component.ts
import { Component } from '@angular/core';
import { MfeWrapperComponent } from '../mfe-wrapper/mfe-wrapper.component';

@Component({
  selector: 'app-event-bus-dashboard',
  standalone: true,
  imports: [MfeWrapperComponent],
  template: `
    <app-mfe-wrapper 
      [names]="['my-sales', 'my-report']"
      [lazyLoad]="true">
    </app-mfe-wrapper>
  `
})
export class EventBusDashboardComponent {
  // MFEs can communicate via window events
  // Example: my-sales MFE emits an event when a sale is selected
  // my-report MFE listens and updates the chart
}
```

### Pattern 2: Responsive MFE Layout

```typescript
// responsive-dashboard.component.ts
import { Component, HostListener, OnInit } from '@angular/core';
import { MfeWrapperComponent } from '../mfe-wrapper/mfe-wrapper.component';

@Component({
  selector: 'app-responsive-dashboard',
  standalone: true,
  imports: [MfeWrapperComponent],
  template: `
    <app-mfe-wrapper 
      [names]="displayMfes"
      [lazyLoad]="isMobile">
    </app-mfe-wrapper>
  `
})
export class ResponsiveDashboardComponent implements OnInit {
  isMobile = false;
  displayMfes: string[] = [];
  
  allMfes = ['my-sales', 'my-report', 'pokemon'];
  mobileMfes = ['my-sales']; // Show only critical MFE on mobile

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    this.displayMfes = this.isMobile ? this.mobileMfes : this.allMfes;
  }
}
```

## Tips and Best Practices

1. **Use lazy loading for better performance** - Enable lazy loading for pages with multiple MFEs
2. **Prioritize critical MFEs** - Load above-the-fold MFEs immediately, others with lazy load
3. **Keep MFE count reasonable** - Don't load more than 10 MFEs on a single page
4. **Test with real content** - MFE sizes vary, test with actual content for accurate performance
5. **Handle errors gracefully** - MFEs might fail to load, ensure good error UX
6. **Consider mobile users** - Reduce MFE count or use different layouts on mobile devices
7. **Cache user preferences** - Remember which MFEs users prefer to see
8. **Monitor performance** - Track MFE load times and optimize accordingly
