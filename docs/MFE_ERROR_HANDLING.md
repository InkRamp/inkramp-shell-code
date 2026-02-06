# MFE Error Handling Guide

## Overview

This guide explains the error handling mechanisms implemented in the i17e shell application to handle Module Federation (MFE) failures gracefully. The system ensures that individual MFE failures don't crash the entire application.

## Problem Statement

Previously, when an MFE failed to load, users encountered:
- **JIT Compiler Unavailable Error**: Occurred when dynamically loading components without proper injector setup
- **Application Crash**: The entire shell application would become unresponsive
- **Poor User Experience**: No feedback about what went wrong or how to recover

## Solution Architecture

### 1. Error Boundary Component

The `MfeWrapperComponent` now implements an error boundary pattern with three key states:

```typescript
// Component state management using Angular signals
isLoading = signal(true);      // Shows loading spinner
hasError = signal(false);      // Shows error UI
errorMessage = signal('');     // User-friendly error message
errorDetails = signal(null);   // Technical details for debugging
```

#### Loading State
- Displays animated spinner
- Shows MFE name being loaded
- Provides visual feedback during async operations

#### Error State
- User-friendly error message
- Retry button for recovery
- Collapsible technical details for debugging
- Does not crash the shell application

#### Success State
- Renders the loaded MFE component
- Hides loading indicators
- Seamless user experience

### 2. Fixed JIT Compiler Error

The root cause was improper component creation. The fix:

**Before (causing JIT error):**
```typescript
this.remoteContainer.createComponent(remote.AppComponent);
```

**After (proper injector usage):**
```typescript
const componentRef = createComponent(remote.AppComponent, {
  environmentInjector: this.environmentInjector,
  elementInjector: this.remoteContainer.injector
});
this.remoteContainer.insert(componentRef.hostView);
```

This ensures:
- Proper dependency injection hierarchy
- AOT-compiled components work correctly
- No runtime compilation needed
- Standalone components are properly supported

### 3. Global Error Handler

The `GlobalErrorHandler` service catches all unhandled errors:

```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error | any): void {
    // Identifies error type
    // Logs appropriately
    // Provides user feedback
    // Prevents app crash
  }
}
```

**Error Types Handled:**
1. **Chunk Loading Errors**: Network issues or missing chunks
2. **JIT Compiler Errors**: Runtime compilation failures
3. **MFE Loading Errors**: Remote module failures
4. **Generic Errors**: All other unhandled exceptions

### 4. Resilient MFE Loading

The `MfeLoaderService` now handles failures gracefully:

```typescript
// Before: One failure crashes preloading
await Promise.all(loadPromises);

// After: Continue despite failures
const results = await Promise.allSettled(loadPromises);
```

**Benefits:**
- Other MFEs continue loading if one fails
- Preloading doesn't block the application
- Detailed logging of success/failure rates
- Individual error handling per MFE

## User Experience

### When an MFE Fails

1. **Error UI is Displayed**
   - Warning icon (⚠️)
   - Clear error message
   - Retry button
   - Technical details (collapsed by default)

2. **Rest of Application Works**
   - Navigation remains functional
   - Other MFEs load normally
   - User can continue using available features

3. **Recovery Options**
   - Click "Retry" to attempt reload
   - Navigate to different section
   - Refresh entire page if needed

## Developer Guide

### Handling Errors in Your MFE

Ensure your MFE exports components properly:

```typescript
// MFE remote entry point
export { AppComponent } from './app/app.component';
```

### Testing Error Scenarios

```typescript
// Test error boundary
it('should handle MFE loading errors', async () => {
  component.name = 'nonexistent-mfe';
  await component.ngAfterViewInit();
  
  expect(component.hasError()).toBe(true);
  expect(component.errorMessage()).toContain('configuration not found');
});

// Test retry functionality
it('should allow retry after error', () => {
  component.retryLoad();
  
  expect(component.hasError()).toBe(false);
  expect(component.isLoading()).toBe(true);
});
```

### Debugging Failed MFEs

Check console logs for detailed information:

```
[MfeWrapperComponent] Loading MFE: usersCrud
[MfeWrapperComponent] MFE config: {
  name: 'usersCrud',
  url: 'https://...remoteEntry.js',
  exposedModule: './Component',
  remoteName: 'usersCrud'
}
[MfeWrapperComponent] Error loading MFE usersCrud: Error: ...
[MfeWrapperComponent] Error Details: { ... }
```

### Global Error Handler Integration

The global error handler automatically:
- Catches unhandled errors
- Logs to console with context
- Provides user notifications (placeholder)
- Continues application execution

Future enhancement: Integrate with toast/notification system.

## Configuration

No configuration needed - error handling is automatic.

To customize error messages, edit:
- `src/app/components/mfe-wrapper/mfe-wrapper.component.html` (UI)
- `src/app/components/mfe-wrapper/mfe-wrapper.component.scss` (Styling)
- `src/app/services/global-error-handler.service.ts` (Global handling)

## Best Practices

1. **Always Test MFE Loading**
   - Test with network throttling
   - Test with invalid URLs
   - Test with missing components

2. **Monitor Error Logs**
   - Check browser console regularly
   - Look for patterns in failures
   - Address root causes promptly

3. **Provide Clear Error Messages**
   - User-friendly language
   - Actionable recovery steps
   - Technical details for support

4. **Handle Errors Locally**
   - Catch expected errors in MFE code
   - Only rely on error boundary for unexpected failures
   - Log errors with context

## Troubleshooting

### Error: JIT Compiler Unavailable

**Cause:** Component trying to compile at runtime in AOT-compiled app

**Solution:** Use proper injector when creating components dynamically

### Error: Module Not Found

**Cause:** MFE remoteEntry.js not accessible or wrong URL

**Solution:** 
- Check network connectivity
- Verify MFE deployment
- Check CORS settings
- Verify URL in configuration

### Error: AppComponent Not Exported

**Cause:** MFE doesn't export expected component

**Solution:**
- Ensure MFE exports `AppComponent`
- Check webpack configuration
- Verify build output

### Application Still Crashes

**Cause:** Error occurring outside error boundaries

**Solution:**
- Check GlobalErrorHandler is registered in bootstrap.ts
- Verify all MFEs use MfeWrapperComponent
- Check for synchronous errors in initialization

## Future Enhancements

1. **User Notifications**
   - Toast/snackbar integration
   - Dismissible error messages
   - Persistent error log

2. **Automatic Retry**
   - Exponential backoff
   - Configurable retry attempts
   - Smart retry based on error type

3. **Telemetry Integration**
   - Error tracking service
   - Analytics integration
   - Performance monitoring

4. **Graceful Degradation**
   - Fallback components
   - Feature flags
   - Partial functionality mode

## Related Documentation

- [ARCHITECTURE.md](/.github/docs/ARCHITECTURE.md) - System architecture overview
- [Module Federation Docs](https://webpack.js.org/concepts/module-federation/) - Webpack MF documentation
- [Angular Error Handling](https://angular.dev/guide/error-handling) - Angular official guide
