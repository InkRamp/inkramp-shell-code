# Multi-MFE Loading Guide

## Overview

The MFE Wrapper component now supports loading **multiple Micro Frontends (MFEs) on a single page** with built-in **lazy loading** capabilities using the Intersection Observer API.

## Features

### 1. Multiple MFEs on One Page
- Load any number of MFEs on a single page
- Each MFE is rendered in its own isolated container
- Maintains backward compatibility with single-MFE mode

### 2. Lazy Loading
- MFEs are loaded only when they come into view (default behavior)
- Uses Intersection Observer API for optimal performance
- 50px rootMargin to start loading before MFE enters viewport
- Can be disabled to load all MFEs immediately

### 3. Visual Feedback
- Loading indicators for each MFE
- Error state display
- Placeholder messages while waiting for lazy load

## Usage

### Single MFE (Backward Compatible)

The component still works exactly as before for single MFE usage:

```html
<!-- Via route data -->
<app-mfe-wrapper></app-mfe-wrapper>

<!-- Via input property -->
<app-mfe-wrapper [name]="'pokemon'"></app-mfe-wrapper>
```

### Multiple MFEs

To load multiple MFEs on a single page:

```html
<app-mfe-wrapper 
  [names]="['pokemon', 'my-sales', 'my-report']"
  [lazyLoad]="true">
</app-mfe-wrapper>
```

### Component Implementation

```typescript
import { Component } from '@angular/core';
import { MfeWrapperComponent } from '../mfe-wrapper/mfe-wrapper.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MfeWrapperComponent],
  template: `
    <div class="dashboard">
      <h1>My Dashboard</h1>
      <app-mfe-wrapper 
        [names]="mfeList" 
        [lazyLoad]="true">
      </app-mfe-wrapper>
    </div>
  `
})
export class DashboardComponent {
  mfeList = ['my-sales', 'my-report', 'pokemon'];
}
```

## API Reference

### Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | `string \| null` | `''` | Single MFE name (backward compatible) |
| `names` | `string[]` | `[]` | Array of MFE names for multi-MFE mode |
| `lazyLoad` | `boolean` | `true` | Enable/disable lazy loading |

### Behavior

- **Single MFE Mode**: When only `name` is provided or `names` has one element, uses the backward-compatible single container mode
- **Multi-MFE Mode**: When `names` has multiple elements, creates separate containers for each MFE
- **Lazy Loading**: When enabled, MFEs load as they come into viewport (50px threshold)
- **Immediate Loading**: When `lazyLoad` is `false`, all MFEs load immediately

## Loading Strategy

### With Lazy Loading (default)

1. Component initializes and creates empty containers for all MFEs
2. Intersection Observer watches each MFE container
3. When a container enters viewport (with 50px margin), its MFE starts loading
4. Visual feedback shows loading state
5. MFE renders when loaded

### Without Lazy Loading

1. Component initializes
2. All MFEs start loading immediately in sequence
3. Each MFE renders as it completes loading

## Examples

### Dashboard with Priority MFEs

```typescript
export class DashboardComponent {
  // Load critical MFEs immediately, others with lazy load
  criticalMfes = ['my-sales'];
  additionalMfes = ['my-report', 'pokemon', 'notifications'];
}
```

```html
<!-- Critical MFEs - load immediately -->
<app-mfe-wrapper 
  [names]="criticalMfes" 
  [lazyLoad]="false">
</app-mfe-wrapper>

<!-- Additional MFEs - lazy load -->
<app-mfe-wrapper 
  [names]="additionalMfes" 
  [lazyLoad]="true">
</app-mfe-wrapper>
```

### Dynamic MFE List Based on User Role

```typescript
export class RoleBasedDashboard implements OnInit {
  mfeList: string[] = [];
  
  constructor(private roleService: RoleService) {}
  
  ngOnInit() {
    const role = this.roleService.getCurrentUserRole();
    
    if (role === 'admin') {
      this.mfeList = ['crud-rules', 'my-sales', 'my-report'];
    } else {
      this.mfeList = ['my-sales', 'my-report'];
    }
  }
}
```

```html
<app-mfe-wrapper 
  [names]="mfeList" 
  [lazyLoad]="true">
</app-mfe-wrapper>
```

## Styling

The multi-MFE layout includes:

- **Grid Layout**: Responsive grid with proper spacing
- **Card Style**: Each MFE in a bordered card with shadow
- **Headers**: MFE name and status display
- **States**: Loading, error, and placeholder states

### Customization

Override these CSS classes in your component styles:

```scss
::ng-deep {
  .mfe-grid {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
  }
  
  .mfe-wrapper {
    border-color: your-color;
    border-radius: your-radius;
  }
}
```

## Browser Compatibility

- **Modern Browsers**: Full support with Intersection Observer
- **Legacy Browsers**: Automatically falls back to immediate loading if Intersection Observer is not available

## Performance Considerations

1. **Lazy Loading**: Reduces initial page load by deferring off-screen MFEs
2. **50px Threshold**: Provides smooth user experience by preloading before scroll
3. **Single Loading**: Each MFE loads only once, even if scrolled multiple times
4. **Memory**: Consider page size - too many MFEs may impact memory

## Best Practices

### ✅ Do

- Use lazy loading for pages with 3+ MFEs
- Group related MFEs together
- Consider user workflow when ordering MFEs
- Use immediate loading for above-the-fold critical MFEs
- Test with actual MFE content for accurate performance

### ❌ Don't

- Load more than 10 MFEs on a single page (performance impact)
- Mix critical and non-critical MFEs with same loading strategy
- Forget to handle error states in your design
- Assume all MFEs are available (check configurations)

## Demo

Visit `/multi-mfe-demo` route to see the multi-MFE functionality in action with:
- Multiple MFEs loaded on one page
- Lazy loading enabled
- Visual loading states
- Responsive grid layout

## Troubleshooting

### MFE Not Loading

1. Check MFE name matches configuration in `src/configs/mfe.ts`
2. Verify MFE URL is accessible
3. Check browser console for errors
4. Ensure user has proper role/permissions

### Performance Issues

1. Reduce number of MFEs on page
2. Enable lazy loading
3. Prioritize critical MFEs
4. Check network tab for slow MFE responses

### Layout Issues

1. Verify CSS is not being overridden
2. Check MFE content doesn't break container
3. Test responsive behavior
4. Ensure proper spacing with grid gap

## Migration from Single MFE

Existing single-MFE usage continues to work without changes:

```html
<!-- Before (still works) -->
<app-mfe-wrapper [name]="'pokemon'"></app-mfe-wrapper>

<!-- After (new capability) -->
<app-mfe-wrapper [names]="['pokemon', 'my-sales']"></app-mfe-wrapper>
```

## Technical Details

### Implementation

- Uses `@ViewChildren` for multiple containers
- Intersection Observer with 50px rootMargin
- ChangeDetectorRef for manual change detection
- Proper cleanup in ngOnDestroy
- TypeScript interfaces for type safety

### State Management

Each MFE maintains its own state:

```typescript
interface MfeLoadState {
  name: string;
  loaded: boolean;
  loading: boolean;
  error?: string;
}
```

## Future Enhancements

Potential improvements:

- Priority-based loading order
- Custom loading animations per MFE
- Error recovery/retry mechanisms
- MFE communication patterns
- Shared state management across MFEs
- Performance metrics and analytics
