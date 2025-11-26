# Create New MFE Component

Use this prompt when you need to create a new Micro Frontend component.

## Required Context
- Component name and purpose
- Data sources (API endpoints)
- User interactions needed

## Prompt Template

```
Create a new Angular standalone component for [COMPONENT_NAME] that:

1. **Purpose**: [Describe what this component does]

2. **Data Source**: 
   - API endpoint: [endpoint URL or service method]
   - Response type: [TypeScript interface]

3. **UI Requirements**:
   - [List UI elements needed]
   - Include loading state with skeleton loader
   - Include error state with retry option

4. **User Interactions**:
   - [List user actions]

5. **RBAC Requirements**:
   - Required permissions: [permission names]
   - Hide elements based on: [conditions]

Follow the patterns in @org/core-services and use:
- Signal-based state management
- takeUntilDestroyed for subscriptions
- OnPush change detection
- Proper TypeScript types
```

## Example Usage

```
Create a new Angular standalone component for IncentiveListComponent that:

1. **Purpose**: Display a paginated list of incentives for the current user

2. **Data Source**: 
   - API endpoint: IncentivesService.getIncentives()
   - Response type: Incentive[]

3. **UI Requirements**:
   - Virtual scrolling table with columns: name, amount, status, date
   - Include loading state with skeleton loader
   - Include error state with retry option

4. **User Interactions**:
   - Click row to view details
   - Filter by status dropdown
   - Sort by column headers

5. **RBAC Requirements**:
   - Required permissions: ['incentives:read']
   - Hide "Edit" button unless user has 'incentives:write'

Follow the patterns in @org/core-services and use:
- Signal-based state management
- takeUntilDestroyed for subscriptions
- OnPush change detection
- Proper TypeScript types
```
