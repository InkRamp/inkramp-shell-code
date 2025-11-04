# Local Development Setup
- Step 1: In angular json change to "baseHref": "./" so all assets are relatively served. 
- Step 2: Open 2 terminal windows. In 1 window run the command `npm run watch:prod`
- Step 3: In the second terminal run the command `npx http-server dist/i17e`
- Step 4: In core-services/src/lib/auth.service.ts change to following `private readonly REDIRECT_URI = 'http://127.0.0.1:8080/';`

# ShellModule - Incentive Management System

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.17.

## 🎯 Recent Updates

### ✅ API Integration
- **Real API Integration**: Connected to actual backend API
- **Centralized Configuration**: Easy-to-update API endpoint configuration
- **New API Services**: IncentiveRules, Incentives, Targets, Tasks
- **Authentication**: Tokens stored in sessionStorage with event broadcasting
- **Dev Mimicking**: Test different user roles without authentication
- 📖 **[Read the API Integration Guide](./docs/API_INTEGRATION_GUIDE.md)**
- 📖 **[Read the Migration Guide](./docs/MIGRATION_GUIDE.md)**

### ✅ Authentication & Authorization
- **Zitadel OAuth2**: Full integration with Zitadel for authentication
- **Token Management**: Secure storage in sessionStorage
- **Event Broadcasting**: Auth events emitted for MicroApp consumption
- **Role-Based Access**: User roles and permissions from Zitadel
- 📖 **[Read the Zitadel Integration Guide](./ZITADEL_INTEGRATION.md)**

## ⭐ Multi-MFE Loading

The MFE Wrapper supports **loading multiple Micro Frontends on a single page** with **lazy loading**!

### Quick Example

```typescript
// Load multiple MFEs with lazy loading
<app-mfe-wrapper 
  [names]="['pokemon', 'my-sales', 'my-report']"
  [lazyLoad]="true">
</app-mfe-wrapper>
```

📖 **[Read the Complete Multi-MFE Guide](./MULTI_MFE_GUIDE.md)**

### Key Features
- ✅ Load multiple MFEs on one page
- ✅ Lazy loading with Intersection Observer
- ✅ Backward compatible with single-MFE mode
- ✅ Visual loading states and error handling
- ✅ Demo available at `/multi-mfe-demo` route

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm start
# Navigate to http://localhost:4200/
```

### Build
```bash
npm run build
# Build artifacts will be in dist/
```

### Test
```bash
npm test
```

## 📚 Documentation

- [API Integration Guide](./docs/API_INTEGRATION_GUIDE.md) - How to use the new API services
- [Migration Guide](./docs/MIGRATION_GUIDE.md) - Migrating from dummy data to real API
- [Zitadel Integration](./ZITADEL_INTEGRATION.md) - Authentication setup
- [Multi-MFE Guide](./MULTI_MFE_GUIDE.md) - Loading multiple MFEs
- [Developer Guide](./docs/DEVELOPER_GUIDE.md) - Development best practices

## 🔑 Key Features

### Authentication
- Zitadel OAuth2 integration
- Token-based authentication
- Role-based access control
- Session persistence

### API Integration
- RESTful API client services
- Centralized configuration
- GraphQL-ready architecture
- Automatic token injection
- Error handling

### Local Development
- Dev user mimicking (test different roles)
- Environment-based configuration
- Hot reload support

### Example: Dev User Mimicking
```typescript
// In browser console or initialization
const testAdmin = {
  id: 'dev-1',
  name: 'Dev Admin',
  email: 'admin@test.com',
  role: 'super-admin'
};

localStorage.setItem('dev_mimic_user', JSON.stringify(testAdmin));
// Refresh page to apply
```

## 🏗️ Architecture

### Core Services (`@org/core-services`)
- **AuthService**: Zitadel authentication & token management
- **RoleService**: User roles & permissions
- **BrandContextService**: Multi-tenant brand context
- **EventBusService**: Cross-MFE communication
- **API Services**: IncentiveRules, Incentives, Targets, Tasks

### MFE Integration
- Dynamic module federation
- Role-based MFE loading
- Shared services across MFEs
- Event-driven communication

### API Configuration
```typescript
// Update API endpoint
import { updateApiConfig } from '@org/core-services';

updateApiConfig({
  baseUrl: 'https://new-endpoint.com/db'
});
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


-------------------------------------- HOST : COMMANDS --------------------------------
ng new shell --routing --style=scss
cd shell 
ng update @angular/core@18 @angular/cli@18
ng add @angular-architects/module-federation@18 --project shell --type host --port 4100

# For generating modules
ng generate module shell --flat
ng g module shared/remote-wrapper

# For generating library
# Then create a public API file:

# // projects/shared-services/src/index.ts
# export * from './auth.service';
# export * from './event-bus.service';

# 2️⃣ tsconfig path mapping

# In tsconfig.base.json:
# "paths": {
#   "@org/core-services": ["projects/shared-services/src/index.ts"]
# }

# Usage 
# import { AuthService } from '@org/core-services';


pokemon % ng generate library core-services --prefix=org 

-------------------------------------- HOST : COMMANDS --------------------------------


-------------------------------------- REMOTE --------------------------------
ng new pokemon --routing --style=scss
cd pokemon 
ng update @angular/core@18 @angular/cli@18
ng add @angular-architects/module-federation@18 --project pokemon --type remote --port 4101

I have a shell and some remotes in angular. Federation is done dynamically. There are some common problems I need to solve
like authentication, rbac, percieved performance, predictive loading, user preferences, system configurations, prioritized loading etc. 
I want to do all these in a manner that:
1. Some aspects work for both standalone and federated remotes like authentication, rbac, etc. 
2. My solutions are scalable and flexible. 
3. I follow best principles like SOLID and YAGNI
4. There should be high cohesion and low coupling. 
5. Some apps which need virtualization work seamlessly
6. Tell me the native solutions I could use to solve critical problems like huge data, processing, caching etc. 

Now to support all the above on UI i need to convert my existing backend to BFF. After all UI aspects are addressed, dig into these details afterwards. But while making UI decisions
do take this angle into account as well. You see its quite possible that current backend may not support my UI ambitions, so what do I need to do in order to alter them without affecting
exisiting services. Make necessary assumptions and take scenarios from bankking domain. 


---------------- CHAT GPT's -----------------------------------------

Perfect — telemetry is a **cross-cutting concern**, so we need to fold it into both the **functional** and **non-functional requirements** while keeping the federated architecture and standalone use cases in mind. Let’s update the requirements set accordingly.

---

#Perfect — let’s expand the requirements set **once more** to explicitly include **compliance, multi-language support (i18n/l10n), and security**, while keeping the telemetry, federation, and standalone concerns intact. I’ll integrate everything into a **unified, complete requirements specification** so nothing is missed.

---

## **Updated & Comprehensive Requirements**

---

### **1. Functional Requirements (UI, Shell, MFEs, Telemetry, Security, Language)**

#### **1.1 Authentication & Authorization**

* Central auth via shell (SSO, OAuth2/OpenID Connect, JWT-based).
* RBAC enforced across remotes (UI feature visibility, API access).
* Standalone remotes support offline login or local testing mode.
* Token refresh handled centrally; session expiration gracefully managed.

#### **1.2 Dynamic Loading & Performance**

* Lazy-load MFEs; predictive prefetching based on user navigation/workflow.
* Skeleton loaders / shimmer screens for perceived performance.
* Virtualization for large tables/lists.
* Prioritized loading: critical MFEs first.

#### **1.3 State & Preferences**

* User preferences: theme, language, layout, default dashboards, notifications.
* System configurations: feature flags, endpoints, environment-specific configs.
* Observable-based shared state accessible to all MFEs.
* Local caching (IndexedDB / localStorage) for fast UI load.

#### **1.4 Inter-MFE Communication**

* Via shell-provided services or event bus; **no direct cross-MFE imports**.
* Observable-driven updates for state changes, notifications, or system events.
* Works for both standalone and federated modes.

#### **1.5 Data Handling**

* Support large datasets: virtual scrolling, pagination, background loading.
* Heavy processing offloaded to Web Workers or similar off-main-thread solutions.
* Offline caching for frequently accessed data.

#### **1.6 Telemetry**

* Centralized in shell; remotes push events through shell.
* Captures:

  * Performance metrics: load, render, network latency.
  * User behavior: clicks, navigation, feature usage.
  * Error tracking: JS errors, failed API calls.
  * Prioritization: critical vs informational events.
* Works standalone and federated.
* Minimal main thread impact (Web Workers, beacons, async reporting).
* Guarantees delivery under poor network conditions (retry queue).
* Must comply with data privacy (sensitive data anonymized/redacted).

#### **1.7 Multi-language Support**

* Full **i18n/l10n support** for all UI elements.
* Dynamically load language packs per user preference.
* Support standalone mode and federated mode with consistent translations.
* Must support locale-specific formatting for dates, currency, numbers.

#### **1.8 Compliance & Regulatory**

* Support banking-specific compliance:

  * Audit trails for user actions and critical events.
  * Secure handling of sensitive data (PCI, GDPR, etc.).
  * Logging and telemetry must comply with retention policies.
* Any remote or BFF changes must preserve auditability.

#### **1.9 Security**

* End-to-end secure communication (HTTPS, TLS).
* Centralized token validation; short-lived tokens with refresh.
* CSRF/XSS/Clickjacking protections in UI.
* Telemetry and logs must **mask sensitive data** (e.g., account numbers).
* Role-based access ensures least privilege principle.

---

### **2. Non-Functional Requirements**

* **Scalability:** shell and MFEs must scale independently; shared services scale horizontally.
* **Flexibility & Extensibility:** adding new cross-cutting concerns (analytics, telemetry, security enhancements) should not require MFE rewrites.
* **Maintainability:** versioned shared libraries; observable-driven state; clear contracts.
* **Reliability:** graceful degradation for remote failures; offline caching; telemetry must guarantee event delivery.
* **Performance:** predictive loading, skeleton screens, virtual scrolling, caching to ensure high perceived performance.
* **Security & Compliance:** telemetry, preferences, and BFF APIs must comply with banking regulations.
* **Localization:** multi-language support must be seamless, including currency/date/number formatting.

---

### **3. Backend/BFF Requirements**

* **Data Aggregation:** provide UI-tailored endpoints, aggregate multiple services.
* **Personalization:** apply RBAC, feature flags, user preferences at BFF.
* **Performance & Caching:** caching layers (Redis, in-memory); conditional requests/ETags.
* **Telemetry Support:** BFF exposes APIs for telemetry; optionally pre-processes events.
* **Security & Compliance:** all APIs enforce encryption, RBAC, and data privacy; logs/telemetry audit-friendly.
* **Backward Compatibility:** no changes to legacy services; BFF acts as orchestration layer.
* **Localization:** BFF returns locale-specific data where relevant (dates, currency, formatted strings).

---

### **4. Assumptions / Banking Context**

* MFEs represent banking modules: accounts, loans, cards, KYC, transactions, notifications.
* Large datasets: account histories, transactions, loan portfolios.
* Users: internal staff (bank employees) or external customers, with different RBAC/data views.
* Shell orchestrates; remotes may run standalone for testing or isolated modules.
* Telemetry must capture banking-critical events but mask sensitive data.
* Language preferences may differ per user; default fallback available.

---

### **5. Constraints**

* Must support both standalone and federated MFEs.
* Avoid heavy runtime coupling between MFEs.
* Backend evolution is limited to BFF; core services untouched.
* High perceived performance is critical.
* Telemetry, security, and compliance must **not block UI rendering**.
* Localization and accessibility must be **first-class requirements**.

---

This is now a **full, unified requirements spec** covering **UI, federation, telemetry, compliance, security, and language support**, tailored to a banking context.

---

Next step would be a **Requirements Traceability Matrix (RTM)** mapping **each requirement to Shell, MFEs, and BFF responsibilities**. This will give us **clarity on ownership, boundaries, and SOLID separation** before solutioning.

Do you want me to create that RTM now?
YOu need to cleanup all above
