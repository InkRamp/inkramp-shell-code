# Multi-MFE Loading - Quick Start

## Problem Solved ✅

**Before:** Could only show 1 MFE at a time on any given page.

**Now:** Can show **N number of MFEs** on any given page with **lazy loading** support.

## How to Use

### 1️⃣ Single MFE (Backward Compatible)

```html
<!-- Still works exactly as before -->
<app-mfe-wrapper [name]="'pokemon'"></app-mfe-wrapper>
```

### 2️⃣ Multiple MFEs (NEW!)

```html
<!-- Load multiple MFEs with lazy loading -->
<app-mfe-wrapper 
  [names]="['pokemon', 'my-sales', 'my-report']"
  [lazyLoad]="true">
</app-mfe-wrapper>
```

### 3️⃣ Multiple MFEs Without Lazy Loading

```html
<!-- Load all MFEs immediately -->
<app-mfe-wrapper 
  [names]="['pokemon', 'my-sales']"
  [lazyLoad]="false">
</app-mfe-wrapper>
```

## Component API

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | `string \| null` | `''` | Single MFE name (backward compatible) |
| `names` | `string[]` | `[]` | **Array of MFE names for multi-MFE mode** |
| `lazyLoad` | `boolean` | `true` | **Enable/disable lazy loading** |

## Features

✅ **Multiple MFEs** - Load any number of MFEs on one page
✅ **Lazy Loading** - MFEs load as they come into viewport (50px margin)
✅ **Backward Compatible** - Single MFE mode works unchanged
✅ **Visual Feedback** - Loading indicators and error states
✅ **Performance** - Intersection Observer API for optimal performance
✅ **Flexible** - Can disable lazy loading for immediate load

## Live Demo

Visit `/multi-mfe-demo` route to see the feature in action!

## Example Component

```typescript
import { Component } from '@angular/core';
import { MfeWrapperComponent } from '../mfe-wrapper/mfe-wrapper.component';

@Component({
  selector: 'app-my-dashboard',
  standalone: true,
  imports: [MfeWrapperComponent],
  template: `
    <h1>My Dashboard</h1>
    
    <!-- Multiple MFEs with lazy loading -->
    <app-mfe-wrapper 
      [names]="mfeList"
      [lazyLoad]="true">
    </app-mfe-wrapper>
  `
})
export class MyDashboardComponent {
  mfeList = ['my-sales', 'my-report', 'pokemon'];
}
```

## Documentation

📖 [Complete Guide](./MULTI_MFE_GUIDE.md) - Comprehensive documentation
📘 [Code Examples](./MULTI_MFE_EXAMPLES.md) - 7+ real-world examples
📝 [Implementation Notes](./IMPLEMENTATION_NOTES.md) - Technical details

## Testing

Run the test suite:
```bash
npm test
```

All tests passing ✅ (2 SUCCESS)

## Migration

No migration needed! Existing single-MFE code continues to work:

```html
<!-- Before (still works) -->
<app-mfe-wrapper [name]="'pokemon'"></app-mfe-wrapper>

<!-- After (new capability) -->
<app-mfe-wrapper [names]="['pokemon', 'my-sales']"></app-mfe-wrapper>
```

## Browser Compatibility

- ✅ Modern browsers with Intersection Observer support
- ✅ Automatic fallback to immediate loading on legacy browsers

## Performance Tips

1. Use lazy loading for 3+ MFEs
2. Load critical MFEs immediately (above the fold)
3. Lazy load below-the-fold MFEs
4. Don't exceed 10 MFEs per page

## Technical Implementation

- Uses `@ViewChildren` for multiple containers
- Intersection Observer with 50px rootMargin
- ChangeDetectorRef for manual change detection
- Proper cleanup in ngOnDestroy
- TypeScript interfaces for type safety

## Support

For issues or questions, see:
- [Multi-MFE Guide](./MULTI_MFE_GUIDE.md) - Full documentation
- [Examples](./MULTI_MFE_EXAMPLES.md) - Code examples
- Component tests - `mfe-wrapper.component.spec.ts`
