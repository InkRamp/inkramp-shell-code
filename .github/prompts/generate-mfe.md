# Generate New Micro Frontend

Use this prompt when scaffolding a new Angular Micro Frontend application.

## Prerequisites

- Angular CLI installed
- @angular-architects/module-federation package
- Understanding of the shell application structure

## Prompt Template

```
Scaffold a new Angular Micro Frontend with the following specifications:

1. **MFE Name**: [mfe-name] (e.g., mfe-rule-editor, mfe-dashboard)

2. **Purpose**: [Description of what this MFE does]

3. **Port**: [Port number for standalone development, e.g., 4104]

4. **Routes Exposed**:
   - [path]: [description]
   - [path]: [description]

5. **Shared Services Needed**:
   - AuthService (required)
   - RoleService (required if RBAC needed)
   - EventBusService (required for cross-MFE communication)
   - [Other services from @org/core-services]

6. **Components to Create**:
   - [ComponentName]: [purpose]
   - [ComponentName]: [purpose]

7. **API Services Needed**:
   - [ServiceName]: [endpoints it will call]

Requirements:
- Use Angular 18 with standalone components
- Configure Module Federation with proper exposes
- Import shared dependencies as singletons
- Follow folder-per-feature structure
- Include proper TypeScript types
- Use OnPush change detection
- Export route metadata for shell consumption
```

## Example Usage

```
Scaffold a new Angular Micro Frontend with the following specifications:

1. **MFE Name**: mfe-rule-editor

2. **Purpose**: Create and manage incentive rules with a visual rule builder

3. **Port**: 4104

4. **Routes Exposed**:
   - /rules: List all rules with filtering
   - /rules/create: Create new rule form
   - /rules/:id: View/edit existing rule
   - /rules/:id/evaluate: Test rule evaluation

5. **Shared Services Needed**:
   - AuthService (required)
   - RoleService (for permission checks)
   - EventBusService (emit rule.created, rule.updated events)

6. **Components to Create**:
   - RuleListComponent: Paginated table of rules with filters
   - RuleFormComponent: Form for creating/editing rules
   - ConditionBuilderComponent: Visual builder for rule conditions
   - ActionConfigComponent: Configure rule actions
   - RulePreviewComponent: Preview rule output

7. **API Services Needed**:
   - RuleService: CRUD operations for rules via /api/rules
   - RuleEvaluationService: Test rule evaluation

Requirements:
- Use Angular 18 with standalone components
- Configure Module Federation with proper exposes
- Import shared dependencies as singletons
- Follow folder-per-feature structure
- Include proper TypeScript types
- Use OnPush change detection
- Export route metadata for shell consumption
```

## Generated Structure

```
mfe-rule-editor/
├── src/
│   ├── app/
│   │   ├── remote-entry/
│   │   │   ├── entry.routes.ts       # Exposed routes
│   │   │   └── entry.component.ts    # Entry component
│   │   ├── components/
│   │   │   ├── rule-list/
│   │   │   ├── rule-form/
│   │   │   ├── condition-builder/
│   │   │   └── action-config/
│   │   ├── services/
│   │   │   ├── rule.service.ts
│   │   │   └── rule-evaluation.service.ts
│   │   ├── models/
│   │   │   └── rule.model.ts
│   │   └── app.routes.ts
│   ├── bootstrap.ts
│   └── main.ts
├── webpack.config.js                  # Module Federation config
├── angular.json
├── package.json
└── README.md
```

## Webpack Configuration Template

```javascript
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'mfe-rule-editor',
  exposes: {
    './routes': './src/app/remote-entry/entry.routes.ts',
  },
  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    }),
  },
});
```

## Route Metadata Export

```typescript
// entry.routes.ts
import { Routes } from '@angular/router';
import { RuleListComponent } from '../components/rule-list/rule-list.component';
import { RuleFormComponent } from '../components/rule-form/rule-form.component';

export const routes: Routes = [
  { path: '', component: RuleListComponent },
  { path: 'create', component: RuleFormComponent },
  { path: ':id', component: RuleFormComponent },
];

// Route metadata for shell
export const routeMetadata = {
  path: 'rules',
  displayName: 'Rule Editor',
  icon: 'rule',
  requiredPermission: 'rule.view',
};
```

## Post-Generation Checklist

- [ ] Verify Module Federation config in webpack.config.js
- [ ] Add MFE to shell's remote configuration
- [ ] Test standalone development (ng serve)
- [ ] Test federated loading from shell
- [ ] Implement authentication flow with AuthService
- [ ] Add proper error boundaries
- [ ] Document any specific setup requirements
