# Module Federation Configuration Guide for Remote MFEs

## ⚠️ IMPORTANT: Using @opensourcekd/ng-common-libs

If your remote MFE uses the `@opensourcekd/ng-common-libs` package (for AuthService, EventBusService, etc.), you **MUST** exclude it from Module Federation sharing to avoid "JIT compiler unavailable" errors.

### Required Configuration

In your remote MFE's `webpack.config.js`:

```javascript
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'your-mfe-name',
  
  filename: 'remoteEntry.js',
  
  exposes: {
    './Component': './src/app/app.component.ts',
  },

  shared: {
    // CRITICAL: Exclude @opensourcekd/ng-common-libs from Module Federation sharing
    // Pass it as the second parameter to shareAll()
    ...shareAll({ 
      singleton: true, 
      strictVersion: false, 
      requiredVersion: 'auto' 
    }, ['@opensourcekd/ng-common-libs']),  // <-- Add this exclusion array
  },
});
```

### Why This is Required

The `@opensourcekd/ng-common-libs` package is built with Rollup/TypeScript (not Angular compiler):
- ❌ Does NOT contain Angular metadata (`ɵfac`, `ɵprov`, `ɵinj`)
- ❌ Cannot be shared via Module Federation in production (AOT mode)
- ✅ Must be bundled directly into each application

**Without this exclusion**: Your MFE will fail with "JIT compiler unavailable" error in production builds.

**With this exclusion**: Each app bundles its own copy (~34-50 KB increase), but everything works correctly.

## Complete Example Configuration

### Remote MFE webpack.config.js

```javascript
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'mfeCrudRules',
  
  filename: 'remoteEntry.js',
  
  exposes: {
    './Component': './src/app/app.component.ts',
  },

  shared: {
    // Exclude non-Angular-compiled packages from sharing
    ...shareAll({ 
      singleton: true, 
      strictVersion: false, 
      requiredVersion: 'auto',
      eager: false
    }, [
      '@opensourcekd/ng-common-libs',  // ← Required exclusion
      // Add any other non-Angular packages here
    ]),
    
    // Share shell's core services (if needed)
    '@org/core-services': { 
      singleton: true, 
      strictVersion: false, 
      requiredVersion: 'auto',
      import: false  // Don't import if not needed
    },
  },
});
```

## Package Installation

Add the package to your MFE's `package.json`:

```bash
npm install @opensourcekd/ng-common-libs@^1.2.6
```

Or manually in `package.json`:

```json
{
  "dependencies": {
    "@opensourcekd/ng-common-libs": "^1.2.6"
  }
}
```

## Using Services in Your MFE

### Import and Use AuthService

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { AuthService, UserInfo } from '@opensourcekd/ng-common-libs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,  // ← Must be standalone for Module Federation
  imports: [CommonModule],
  template: `
    <div>
      <h1>My MFE</h1>
      @if (user()) {
        <p>Welcome, {{ user()?.name }}</p>
      }
    </div>
  `
})
export class AppComponent implements OnInit {
  private auth = inject(AuthService);
  user = signal<UserInfo | null>(null);

  async ngOnInit() {
    const isAuthenticated = await this.auth.isAuthenticated();
    if (isAuthenticated) {
      this.user.set(this.auth.getUser());
    }
  }
}
```

### Import and Use EventBusService

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { EventBusService } from '@opensourcekd/ng-common-libs';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '...'
})
export class AppComponent implements OnInit {
  private eventBus = inject(EventBusService);

  ngOnInit() {
    // Subscribe to events from shell or other MFEs
    this.eventBus.onePlusNEvents.subscribe(event => {
      console.log('Event received:', event);
    });
  }

  sendEvent() {
    // Send event to shell or other MFEs
    this.eventBus.sendEvent('mfe:action-completed');
  }
}
```

## Troubleshooting

### "JIT compiler unavailable" Error

**Symptoms**: 
```
ERROR Error: JIT compiler unavailable
    at Se (953.58313a09348884f8.js:1:56937)
    ...
```

**Solution**: 
1. ✅ Check `webpack.config.js` - ensure `@opensourcekd/ng-common-libs` is in the exclusion array
2. ✅ Rebuild your MFE: `npm run build`
3. ✅ Clear browser cache and test again
4. ✅ Verify the shell also excludes the package

### Module Not Found Error

**Symptoms**: 
```
ERROR in ./src/app/app.component.ts
Module not found: Error: Can't resolve '@opensourcekd/ng-common-libs'
```

**Solution**: 
1. ✅ Install the package: `npm install @opensourcekd/ng-common-libs`
2. ✅ Verify it's in `package.json` dependencies
3. ✅ Delete `node_modules` and `package-lock.json`, then `npm install` again

### Component is Not Standalone Error

**Symptoms**: 
```
Component must be a standalone component for Module Federation
```

**Solution**: 
1. ✅ Add `standalone: true` to your component decorator
2. ✅ Move all dependencies to the `imports` array
3. ✅ Remove the component from any `@NgModule` declarations

```typescript
// ❌ Wrong
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})

// ✅ Correct
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ...],
  templateUrl: './app.component.html'
})
```

## Version Compatibility

### Shell Version Requirements
- Angular: `^18.2.13`
- @opensourcekd/ng-common-libs: `^1.2.6`

### Remote MFE Version Requirements
- Angular: `^18.2.x` (must match shell's major.minor version)
- @opensourcekd/ng-common-libs: `^1.2.x` (patch differences are OK)

### Version Compatibility Matrix

| Shell Angular | Remote Angular | Compatible |
|---------------|----------------|------------|
| 18.2.13       | 18.2.14        | ✅ Yes     |
| 18.2.13       | 18.3.0         | ⚠️ Risky   |
| 18.2.13       | 19.0.0         | ❌ No      |

## Testing Your Configuration

### 1. Build Your MFE
```bash
npm run build
```

Should complete without errors.

### 2. Test Production Build Locally
```bash
npx http-server dist/your-mfe-name -p 3000 -c-1
```

### 3. Load in Shell
Update shell's `src/configs/mfe.ts`:
```typescript
export const MFE_CONFIGS: MfeConfig[] = [
  {
    name: 'yourMfe',
    url: 'http://localhost:3000/remoteEntry.js',
    displayName: 'Your MFE',
    route: 'your-route',
    exposedModule: './Component'
  }
];
```

### 4. Check Browser Console
- ✅ No "JIT compiler unavailable" errors
- ✅ Component loads successfully
- ✅ Services work correctly

## References

- [OPENSOURCEKD_PACKAGE_FIX.md](./OPENSOURCEKD_PACKAGE_FIX.md) - Detailed explanation of the fix
- [JIT_COMPILER_ERROR_FIX.md](./JIT_COMPILER_ERROR_FIX.md) - Remote component requirements
- [MODULE_FEDERATION_FIX.md](./MODULE_FEDERATION_FIX.md) - Version compatibility issues
- [Module Federation Docs](https://module-federation.io/)
- [@opensourcekd/ng-common-libs on npm](https://www.npmjs.com/package/@opensourcekd/ng-common-libs)

## Quick Checklist for Remote MFE Developers

Before deploying your remote MFE:

- [ ] Added `@opensourcekd/ng-common-libs` to package.json dependencies
- [ ] Excluded `@opensourcekd/ng-common-libs` from Module Federation sharing in webpack.config.js
- [ ] Component is marked as `standalone: true`
- [ ] All dependencies are in component's `imports` array
- [ ] Angular version matches shell (18.2.x)
- [ ] Production build succeeds (`npm run build`)
- [ ] Tested loading in shell application
- [ ] No "JIT compiler unavailable" errors in browser console
- [ ] Services (AuthService, EventBusService) work correctly

---

**Need Help?** See [OPENSOURCEKD_PACKAGE_FIX.md](./OPENSOURCEKD_PACKAGE_FIX.md) for detailed technical explanation.
