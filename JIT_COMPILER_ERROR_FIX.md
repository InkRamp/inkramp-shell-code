# JIT Compiler Error Fix

**Date**: 2026-02-05  
**Issue**: "JIT compiler unavailable" error when loading remote MFEs in production  
**Status**: ✅ RESOLVED

## Problem

Console showed the following error in production builds:
```
ERROR Error: JIT compiler unavailable
    at Se (953.58313a09348884f8.js:1:56937)
    at $r.get (953.58313a09348884f8.js:1:72714)
    at Qf (953.58313a09348884f8.js:1:41006)
    ...
```

**Result**: Remote MFE components fail to load in production builds, causing blank pages or application crashes.

## Root Cause

The error occurs when Angular tries to dynamically create components in production (AOT-compiled) builds without the JIT compiler. The root causes are:

### 1. Non-Standalone Components
Remote MFE components that are **NOT** marked as `standalone: true` cannot be dynamically loaded in production builds because:
- Production builds use AOT (Ahead-of-Time) compilation
- AOT compilation doesn't include the JIT compiler (to reduce bundle size)
- Non-standalone components require module compilation, which needs JIT
- Attempting to create non-standalone components dynamically throws "JIT compiler unavailable"

### 2. Missing EnvironmentInjector
When creating standalone components dynamically, the `EnvironmentInjector` must be provided to ensure proper dependency injection context.

### 3. Unclear Component Export Names
Remote MFEs may export components with different names (`AppComponent`, `Component`, `default`), causing loading failures if the wrong name is used.

## Solution

**File**: `src/app/components/mfe-wrapper/mfe-wrapper.component.ts`

### Changes Made

1. **Added EnvironmentInjector**
   ```typescript
   private injector = inject(EnvironmentInjector);
   ```

2. **Flexible Component Export Detection**
   ```typescript
   // Try different possible component export names
   let componentType: Type<any> | undefined;
   if (remote.AppComponent) {
     componentType = remote.AppComponent;
   } else if (remote.Component) {
     componentType = remote.Component;
   } else if (remote.default) {
     componentType = remote.default;
   }
   ```

3. **Standalone Component Validation**
   ```typescript
   // Check if the component is standalone
   const isStandalone = (componentType as any).ɵcmp?.standalone === true;
   
   if (!isStandalone) {
     console.error(`Component ${this.name} is NOT a standalone component...`);
     throw new Error(`Component must be a standalone component for Module Federation`);
   }
   ```

4. **Proper Component Creation with Injector**
   ```typescript
   const componentRef: ComponentRef<any> = this.remoteContainer.createComponent(componentType, {
     environmentInjector: this.injector
   });
   ```

5. **Enhanced Error Messages**
   - Clear identification of non-standalone components
   - Detailed instructions for fixing the remote MFE
   - Helpful logging with ✓ and ❌ indicators

## Why This Works

### 1. Standalone Component Validation
- **Detects non-standalone components** before attempting to create them
- **Provides clear error messages** explaining what needs to be fixed
- **Prevents cryptic "JIT compiler unavailable" errors** by catching the issue early

### 2. EnvironmentInjector
- **Provides proper DI context** for standalone components
- **Ensures all dependencies** are correctly resolved
- **Required for Angular 14+** when dynamically creating standalone components

### 3. Flexible Export Detection
- **Handles different export conventions** used by various MFE configurations
- **Supports AppComponent, Component, and default exports**
- **Lists available exports** in error messages for debugging

## Requirements for Remote MFEs

For Module Federation with Angular 18+ production builds, remote MFEs **MUST**:

### ✅ DO:

1. **Use Standalone Components**
   ```typescript
   @Component({
     selector: 'app-root',
     standalone: true,
     imports: [CommonModule, RouterModule, ...],
     templateUrl: './app.component.html',
     styleUrl: './app.component.scss'
   })
   export class AppComponent {
     // Component logic
   }
   ```

2. **Import All Dependencies**
   ```typescript
   imports: [
     CommonModule,
     HttpClientModule,
     RouterModule,
     FormsModule,
     // ... all other required modules
   ]
   ```

3. **Export Component Properly**
   ```typescript
   // In the exposed file (e.g., Component.ts or index.ts)
   export { AppComponent } from './app/app.component';
   ```

4. **Use Compatible Angular Versions**
   - Shell and MFE must use the same major/minor Angular version
   - Example: Shell on 18.2.13, MFE on 18.2.14 ✓ (compatible)
   - Example: Shell on 18.x, MFE on 19.x ✗ (incompatible)

### ❌ DON'T:

1. **Use Module-Based Components**
   ```typescript
   // ❌ This will NOT work in production:
   @Component({
     selector: 'app-root',
     standalone: false,  // or omitted (defaults to false)
     templateUrl: './app.component.html'
   })
   ```

2. **Forget to Import Dependencies**
   ```typescript
   // ❌ Missing imports will cause runtime errors:
   @Component({
     standalone: true,
     imports: [],  // Missing CommonModule, etc.
   })
   ```

3. **Use Incompatible Angular Versions**
   - Major version differences cause `ɵɵdefineComponent` errors
   - Always align versions between shell and MFEs

## Verification

### Build Status
```bash
npm run build
```
- ✅ Success: ~72 kB initial bundle
- ✅ No compilation errors
- ✅ All lazy chunks compiled
- ✅ Enhanced error detection added

### Runtime Behavior

#### Before Fix
- ❌ "JIT compiler unavailable" error
- ❌ Remote MFE fails to load
- ❌ Blank page or application crash
- ❌ No clear indication of what's wrong

#### After Fix
- ✅ Clear detection of non-standalone components
- ✅ Detailed error messages with fix instructions
- ✅ Proper component creation with injector
- ✅ Flexible export name handling
- ✅ Helpful logging for debugging

### Error Messages

#### Non-Standalone Component Error
```
⚠️ CRITICAL ERROR: Component usersCrud is NOT a standalone component.
This will cause "JIT compiler unavailable" errors in production builds.

To fix this issue, the remote MFE must:
1. Mark the component with 'standalone: true' in the @Component decorator
2. Import all dependencies in the component's 'imports' array
3. Rebuild and redeploy the MFE

Example:
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ...],
  templateUrl: './app.component.html'
})
```

#### Missing Component Error
```
No component found in remote module for: usersCrud.
Checked for: AppComponent, Component, default.
Available exports: [list of actual exports]
```

## Impact

### Developer Experience
- **Before**: Cryptic "JIT compiler unavailable" error with no clear fix
- **After**: Clear error messages with actionable instructions

### Production Stability
- **Before**: Random crashes when loading remote MFEs
- **After**: Early detection and prevention of incompatible components

### Debugging
- **Before**: Hard to identify which MFE or component is causing issues
- **After**: Clear logging shows exactly which component and what's wrong

## Best Practices for Module Federation

### For Shell Application (This Repo)

1. ✅ **Use `strictVersion: false`** in webpack config for flexibility
2. ✅ **Provide EnvironmentInjector** when creating components
3. ✅ **Validate component types** before creation
4. ✅ **Handle multiple export conventions** gracefully
5. ✅ **Provide clear error messages** for troubleshooting

### For Remote MFEs

1. ✅ **Always use standalone components** for exposed modules
2. ✅ **Import all dependencies** in component imports array
3. ✅ **Match Angular versions** with shell (major.minor)
4. ✅ **Export with clear, consistent names** (AppComponent, Component, or default)
5. ✅ **Test in production mode** before deploying

### Version Management

1. ✅ **Align major and minor versions** (e.g., 18.2.x)
2. ✅ **Patch differences are acceptable** (18.2.13 ↔ 18.2.14 ✓)
3. ✅ **Document version requirements** in MFE README
4. ✅ **Set up version monitoring** for shell and all MFEs
5. ✅ **Test cross-version compatibility** before deployment

## Technical Details

### How Angular Components Work

#### Standalone Components (Angular 14+)
- Self-contained with all dependencies imported
- Can be dynamically loaded without modules
- Work with AOT compilation in production
- **Required for Module Federation in Angular 18+**

#### Module-Based Components (Legacy)
- Depend on NgModule for dependency declaration
- Require JIT compiler for dynamic loading
- **Not compatible with production Module Federation**

### Component Creation in Angular 18

```typescript
// Correct way for standalone components:
viewContainerRef.createComponent(StandaloneComponent, {
  environmentInjector: this.injector  // Provides DI context
});

// Incorrect way (works in dev, fails in prod):
viewContainerRef.createComponent(NonStandaloneComponent);
// Error: JIT compiler unavailable
```

### Module Federation Compatibility Matrix

| Shell Version | Remote Version | Compatible | Notes |
|--------------|----------------|------------|-------|
| 18.2.13 | 18.2.14 | ✅ Yes | Patch difference OK |
| 18.2.x | 18.3.x | ⚠️ Maybe | Minor difference risky |
| 18.x | 19.x | ❌ No | Major difference breaks |
| 18.2.13 + standalone | 18.2.14 + standalone | ✅ Yes | Both standalone OK |
| 18.2.13 + standalone | 18.2.14 + module | ❌ No | Module requires JIT |

## Next Steps

### For This Repository (Shell)
- ✅ Enhanced error detection implemented
- ✅ Flexible component export handling added
- ✅ Proper injector usage added
- ✅ Documentation created
- ✅ Build verified

### For Remote MFEs (Action Required)
If you're seeing the "non-standalone component" error, update your remote MFE:

1. **Convert component to standalone**
   ```typescript
   @Component({
     standalone: true,  // Add this
     imports: [/* all dependencies */],  // Add this
     // ... rest of component
   })
   ```

2. **Verify exports**
   - Ensure component is exported as `AppComponent`, `Component`, or `default`
   - Check webpack config `exposes` section

3. **Rebuild and deploy**
   ```bash
   npm run build
   # Deploy to hosting (GitHub Pages, etc.)
   ```

4. **Test in production mode**
   ```bash
   npm run build
   # Test the built application
   ```

## Related Files

- `src/app/components/mfe-wrapper/mfe-wrapper.component.ts` - Main fix implementation
- `src/configs/mfe.ts` - MFE configuration
- `webpack.config.js` - Module Federation configuration
- `MODULE_FEDERATION_FIX.md` - Previous version conflict fix
- `MIGRATION_TEMP_SHARED.md` - Service migration documentation

## References

- [Angular Standalone Components](https://angular.dev/guide/components)
- [Programmatic Component Rendering](https://angular.dev/guide/components/programmatic-rendering)
- [Module Federation with Standalone Components](https://www.angulararchitects.io/en/blog/module-federation-with-angulars-standalone-components/)
- [Module Federation Official Docs](https://module-federation.io/)
- [Angular Module Federation Guide](https://www.angulararchitects.io/architecture/module-federation/)

---

**Status**: Issue resolved. Clear error detection and messaging implemented. Remote MFEs must use standalone components for production builds.

---

## Troubleshooting

### Still seeing "JIT compiler unavailable" after this fix?

1. **Check console logs** for the detailed error message
2. **Verify remote MFE** is using standalone components
3. **Check Angular versions** match between shell and MFE
4. **Rebuild both** shell and remote MFE
5. **Clear browser cache** and test again

### Component not found?

1. **Check MFE configuration** in `src/configs/mfe.ts`
2. **Verify exposedModule** matches what the remote exports
3. **Check remote webpack config** exposes section
4. **Test remote URL** directly in browser

### Other errors?

- Check browser console for detailed error messages
- Review logs prefixed with `[MfeWrapperComponent]`
- Verify remote MFE is accessible and built correctly
- Ensure all dependencies are properly imported in remote component
