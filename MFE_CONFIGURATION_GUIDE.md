# Module Federation Configuration Guide for Remote MFEs

## ⚠️ IMPORTANT: Using @opensourcekd/ng-common-libs

When using the `@opensourcekd/ng-common-libs` package (for AuthService, EventBusService, etc.), you **MUST** use version 1.2.7 or later to avoid "JIT compiler unavailable" errors.

### Required Version

In your remote MFE's `package.json`:

```json
{
  "dependencies": {
    "@opensourcekd/ng-common-libs": "^1.2.7"
  }
}
```

**Version 1.2.6 has JIT compiler issues - do not use it!**

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
    // Share the package as singleton (v1.2.7+ works correctly)
    ...shareAll({ 
      singleton: true, 
      strictVersion: false, 
      requiredVersion: 'auto' 
    }),
    '@opensourcekd/ng-common-libs': { 
      singleton: true, 
      strictVersion: false, 
      requiredVersion: 'auto' 
    },
  },
});
```

### Why This is Required

Version 1.2.7 of `@opensourcekd/ng-common-libs`:
- ✅ Contains proper Angular metadata (`ɵfac`, `ɵprov`, `ɵinj`)
- ✅ Can be shared via Module Federation in production (AOT mode)
- ✅ Works correctly as a singleton across shell and MFEs

**Version 1.2.6 does NOT work with Module Federation and will cause JIT compiler errors.**

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
    // Share all packages including @opensourcekd/ng-common-libs (v1.2.7+)
    ...shareAll({ 
      singleton: true, 
      strictVersion: false, 
      requiredVersion: 'auto',
      eager: false
    }),
    '@opensourcekd/ng-common-libs': { 
      singleton: true, 
      strictVersion: false, 
      requiredVersion: 'auto'
    },
    
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
npm install @opensourcekd/ng-common-libs@^1.2.7
```

Or manually in `package.json`:

```json
{
  "dependencies": {
    "@opensourcekd/ng-common-libs": "^1.2.7"
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
1. ✅ Check `package.json` - ensure you're using v1.2.7 or later
2. ✅ Run `npm install` to update the package
3. ✅ Rebuild your MFE: `npm run build`
4. ✅ Clear browser cache and test again
5. ✅ Verify the shell also uses v1.2.7 or later

### Module Not Found Error

**Symptoms**: 
```
ERROR in ./src/app/app.component.ts
Module not found: Error: Can't resolve '@opensourcekd/ng-common-libs'
```

**Solution**: 
1. ✅ Install the package: `npm install @opensourcekd/ng-common-libs@^1.2.7`
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
- @opensourcekd/ng-common-libs: `^1.2.7` ✅ (v1.2.6 has issues)

### Remote MFE Version Requirements
- Angular: `^18.2.x` (must match shell's major.minor version)
- @opensourcekd/ng-common-libs: `^1.2.7` ✅ (must use v1.2.7 or later)

### Version Compatibility Matrix

| Shell Package | Remote Package | Compatible |
|---------------|----------------|------------|
| 1.2.7         | 1.2.7          | ✅ Yes     |
| 1.2.7         | 1.2.8+         | ✅ Yes     |
| 1.2.6         | Any            | ❌ No - has JIT compiler issues |
| Any           | 1.2.6          | ❌ No - has JIT compiler issues |

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

- [ ] Added `@opensourcekd/ng-common-libs@^1.2.7` to package.json dependencies
- [ ] Verified using version 1.2.7 or later (NOT 1.2.6)
- [ ] Package is shared via Module Federation in webpack.config.js
- [ ] Component is marked as `standalone: true`
- [ ] All dependencies are in component's `imports` array
- [ ] Angular version matches shell (18.2.x)
- [ ] Production build succeeds (`npm run build`)
- [ ] Tested loading in shell application
- [ ] No "JIT compiler unavailable" errors in browser console
- [ ] Services (AuthService, EventBusService) work correctly

---

**Need Help?** See [OPENSOURCEKD_PACKAGE_FIX.md](./OPENSOURCEKD_PACKAGE_FIX.md) for detailed technical explanation.
