# Incentive Management System - Implementation Notes

## Overview
This implementation adds a comprehensive role-based MFE architecture for managing sales incentives.

## Key Features Implemented

### 1. Multi-MFE Loading (NEW)

The MFE Wrapper component now supports loading **multiple MFEs on a single page** with lazy loading:

- **Multiple MFEs**: Load any number of MFEs on one page using `[names]` input
- **Lazy Loading**: Uses Intersection Observer API to load MFEs as they come into view
- **Backward Compatible**: Single MFE mode still works exactly as before
- **Visual Feedback**: Loading states, error handling, and placeholders
- **Performance**: 50px viewport margin for smooth preloading
- **Flexibility**: Can disable lazy loading for immediate load of all MFEs

See [MULTI_MFE_GUIDE.md](./MULTI_MFE_GUIDE.md) for detailed usage and examples.

### 2. Role-Based Access Control (RBAC)
- **Roles Defined**: 
  - `super-admin` - Full system access
  - `org-admin` - Organization-level management
  - `team-lead` - Team management and rule creation
  - `sales-executive` - View own sales and incentives
  
- **Role Hierarchy**: Privileges descend from super-admin to sales-executive
- **Role Service**: Centralized role management with session persistence
- **Route Guards**: Role-based route protection using Angular guards

### 3. MFE Architecture with Priority Loading

#### MFE Configurations
Three new MFEs have been configured:

1. **mfe-CRUD_RULES** (`/rules`)
   - For admins and team leads to create/manage incentive rules
   - Priority: 8 (High)
   - Allowed roles: super-admin, org-admin, team-lead

2. **mfe-MY_SALES** (`/sales`)
   - View sales history for all roles
   - Admins/team leads can view any sales executive's data
   - Priority: 7 (High)
   - Allowed roles: All

3. **mfe-MY_REPORT** (`/reports`)
   - Interactive charts showing incentives earned
   - Priority: 6 (High)
   - Allowed roles: All

#### Priority Loading System
- **MfeLoaderService**: Manages MFE loading with priority support
- Priority levels:
  - 10: Critical (load immediately)
  - 5-9: High (preload on login)
  - 1-4: Normal (load on demand)
- High-priority MFEs are preloaded after login for better performance

#### Multi-MFE Support
- **MfeWrapperComponent** now supports loading multiple MFEs on a single page
- Lazy loading with Intersection Observer API
- Backward compatible with single-MFE mode
- Demo available at `/multi-mfe-demo` route

### 4. Shared Services Architecture

Services exposed to MFEs via Module Federation:

1. **RoleService** (`./RoleService`)
   - User role management
   - Permission checking
   - Session persistence

2. **DummyDataService** (`./DummyDataService`)
   - Centralized dummy data for development
   - Sales records, incentive rules, earned incentives
   - Report data generation
   - CRUD operations for rules

3. **MfeLoaderService** (`./MfeLoaderService`)
   - MFE loading with priority
   - Load state tracking
   - Role-based MFE filtering

4. **Models** (`./Models`)
   - Shared TypeScript interfaces
   - Data models, role enums, MFE configs

### 5. Dummy Data Structure

All dummy data is centralized in `DummyDataService`:

- **Sales Executives**: 5 demo users across 2 teams
- **Sales Records**: 50 sales records spanning 5 months
- **Incentive Rules**: 4 different rule types (percentage, fixed, tiered)
- **Incentives Earned**: 30 incentive records with various statuses
- **Report Data**: Automatically generated with 6-month breakdown

### 6. Enhanced Shell UI

#### Navigation
- Role-based navigation menu showing only allowed MFEs
- Active route highlighting
- Clean, modern design with proper spacing

#### Sales Executive Selector
- Visible only to admins and team leads
- Allows viewing other users' data
- Selection stored in session and broadcast via custom event
- MFEs can listen to `salesExecutiveChanged` event

#### Header Layout
- Left: Application title
- Center: Sales executive selector (for admins/team leads)
- Right: User info and logout button

### 7. Unblocking Fetches
- All services use RxJS Observables
- BehaviorSubject for state management
- Non-blocking async operations
- Services shared via Module Federation

### 8. Route Configuration

Routes with role-based guards:
```typescript
/rules       -> CRUD_RULES (admin, team-lead only)
/sales       -> MY_SALES (all roles)
/reports     -> MY_REPORT (all roles)
/lazy        -> Demo component
/multi-mfe-demo -> Multi-MFE showcase
/auth-callback -> OAuth callback
```

## Technical Implementation Details

### Webpack Configuration
- **Container Name**: `shell`
- **Exposes**: Services and models for MFE consumption
- **Shared**: All Angular packages with singleton pattern

### TypeScript Configuration
- Includes all TypeScript files except specs
- Proper compilation for exposed modules

### Styling
- No inline SCSS (per requirements)
- Component-level SCSS with design tokens
- Reusable color variables
- Responsive layout

### Build Output
- Production build: ~82 KB initial bundle
- Lazy-loaded chunks for routes
- Module Federation remoteEntry.js generated
- Optimized with tree-shaking

## Assumptions Made

1. **Zitadel Integration**: Existing auth service will be integrated with role mapping
2. **MFE Deployment**: MFE URLs are placeholders - to be updated when MFEs are deployed
3. **Brand Support**: Data models support brand-specific abstraction (to be implemented with GraphQL later)
4. **API Integration**: Dummy data structure matches future API contracts
5. **User Assignment**: For demo, default user is sales-executive (can be changed via session storage)

## Future Enhancements

1. **Actual MFE Implementation**: Build the three MFEs (CRUD_RULES, MY_SALES, MY_REPORT)
2. **API Integration**: Replace dummy data with real API calls
3. **GraphQL Layer**: Add brand-specific abstraction
4. **Shared SCSS**: Extract common styles to shared library
5. **Token-based Design**: Implement design tokens for multi-brand support
6. **Performance Monitoring**: Add telemetry for MFE loading times
7. **Error Boundaries**: Add error handling for failed MFE loads
8. **Offline Support**: Add service worker for offline capability

## How to Test

### Testing Different Roles
Change the user role in browser console:
```javascript
// Set user as admin
sessionStorage.setItem('current_user', JSON.stringify({
  id: '99',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'org-admin'
}));
// Reload page
location.reload();
```

### Testing Sales Executive Selection
1. Log in as admin or team lead
2. Use the dropdown in the header to select a sales executive
3. Navigate to sales or reports to see their data
4. MFEs will receive `salesExecutiveChanged` event

### Viewing Dummy Data
Check browser console for service logs or inspect:
```javascript
// In browser console
window.sessionStorage.getItem('current_user')
window.sessionStorage.getItem('selected_sales_executive_id')
```

## Files Modified/Created

### New Files
- `src/app/models/` - All model definitions
- `src/app/services/role.service.ts` - Role management
- `src/app/services/dummy-data.service.ts` - Centralized data
- `src/app/services/mfe-loader.service.ts` - MFE loading
- `src/app/guards/role.guard.ts` - Route protection
- `src/app/routes/mfe-routes.ts` - MFE route definitions
- `src/app/components/multi-mfe-demo/` - Multi-MFE demo component
- `MULTI_MFE_GUIDE.md` - Multi-MFE usage documentation

### Modified Files
- `src/configs/mfe.ts` - Added new MFE configs
- `src/app/app.routes.ts` - Added role-based routes and multi-MFE demo route
- `src/app/app.component.ts` - Integrated new services
- `src/app/app.component.html` - New UI layout with multi-MFE demo link
- `src/app/app.component.scss` - Enhanced styling
- `src/app/components/mfe-wrapper/mfe-wrapper.component.ts` - Multi-MFE and lazy loading support
- `src/app/components/mfe-wrapper/mfe-wrapper.component.html` - Multiple MFE container support
- `src/app/components/mfe-wrapper/mfe-wrapper.component.scss` - Grid layout styles
- `webpack.config.js` - Exposed services
- `tsconfig.app.json` - Include/exclude configuration
- `angular.json` - Budget adjustments
- `IMPLEMENTATION_NOTES.md` - Updated with multi-MFE feature

## Deployment Notes

1. **Build Command**: `npm run build`
2. **Output**: `dist/i17e/`
3. **Base Href**: Currently set to GitHub Pages - update for production
4. **MFE URLs**: Update in `src/configs/mfe.ts` when MFEs are deployed
5. **Webpack Remotes**: Currently using production URLs

## SOLID Principles Applied

- **Single Responsibility**: Each service has one clear purpose
- **Open/Closed**: MFE configs easily extensible without modifying core
- **Liskov Substitution**: Role hierarchy properly implemented
- **Interface Segregation**: Clean interfaces for each model type
- **Dependency Inversion**: Services injected, not instantiated directly

## DRY Principle Applied

- Centralized data in single service
- Reusable role guard function
- Shared models across services
- Common styling variables

## YAGNI Principle Applied

- No premature abstractions
- Simple, focused implementations
- Features implemented only as specified
- No over-engineering of data structures
