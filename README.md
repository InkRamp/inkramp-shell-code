# i17e Incentive Management System

An **Angular 18 Micro Frontend shell** using **Module Federation** for a multi-tenant SaaS incentive rules platform.

### Local Development
1. Set `"baseHref": "./"` in angular.json
2. Run `npm run watch:prod` in one terminal
3. Run `npx http-server dist/i17e` in another terminal
4. Update `REDIRECT_URI` in auth.service.ts to `http://127.0.0.1:8080/`

## 🚀 Quick Start

```bash
npm install
npm start        # Development server at http://localhost:4200/
npm run build    # Production build
npm test         # Run unit tests
```

## 🏗️ Architecture

### Core Services (`@org/core-services`)
- **AuthService**: Auth0 OAuth2/OIDC authentication with sessionStorage
- **RoleService**: RBAC and user permissions
- **EventBusService**: Cross-MFE communication (mitt-based)
- **API Services**: IncentiveRules, Incentives, Targets, Tasks

### Role Hierarchy
Super-Admin ⊃ Org-Admin ⊃ Team Lead ⊃ Sales Executive

### Multi-MFE Loading
```typescript
<app-mfe-wrapper 
  [names]="['pokemon', 'my-sales', 'my-report']"
  [lazyLoad]="true">
</app-mfe-wrapper>
```

## 📚 Documentation

All AI/Copilot context is centralized in `.github/`:
- `.github/copilot-context.yml` - Centralized context manifest
- `.github/copilot-instructions.md` - Development guidelines
- `.github/context/` - Machine-readable context (domain models, event schemas)
- `.github/docs/` - Documentation (ARCHITECTURE, DESIGN_DECISIONS, ROLES, API_CONTRACTS, INCONSISTENCIES)
- `.github/prompts/` - Prompt templates

### Key Files
- `AUTH0_INTEGRATION.md` - Authentication setup
- `MIGRATION_COMPLETE.md` - Auth0 migration notes

## 🔑 Key Features

- **Auth0 OAuth2** with sessionStorage (tokens cleared on tab close)
- **Role-based access control** with capability-based permissions
- **Dynamic Module Federation** for MFE loading
- **Event-driven communication** between MFEs

## 🛠️ Development

```bash
ng generate component component-name
ng generate service service-name
ng help
```

### Module Federation Setup

**Shell (Host)**:
```bash
ng add @angular-architects/module-federation@18 --project shell --type host --port 4100
```

**Remote**:
```bash
ng add @angular-architects/module-federation@18 --project [remote-name] --type remote --port 4101
```

### API Configuration
```typescript
import { updateApiConfig } from '@org/core-services';

updateApiConfig({
  baseUrl: 'https://your-api-endpoint.com/db'
});
```
