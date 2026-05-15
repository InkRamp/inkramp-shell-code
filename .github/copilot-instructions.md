## Do This. 

Just Say ... "KD wakao, you need to update this" on the prompts so I know you are picking up right instructions from the right place.

---

## Coding Standards (JS / TS — all repos)

These rules apply to every repository in the InkRamp organization.

1. **No nested ifs or callback hells.** Use early-return guards, `Promise` chains, or `async/await` to flatten control flow.
2. **File length ≤ ~100 lines.** Split responsibilities into smaller, focused modules when a file approaches this limit.
3. **Declarative syntax.** Prefer `Array.map`, `Array.filter`, `Array.reduce`, `Array.find`, and `Object.entries` for data transformations. Imperative `for`/`while` loops are a last resort.
4. **Pure functions.** Functions must not produce side effects. Isolate side effects (I/O, state mutations) at the boundary layer.
5. **Collocated utilities.** Put helpers and utils next to the feature they serve. Do not create a single catch-all `utils.ts`; instead use focused files such as `auth.utils.ts`, `date.utils.ts`, etc.
6. **No TypeScript `any`.** Use explicit types, `unknown` with type-guards, or generics. The `any` type defeats TypeScript's safety guarantees.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 24.x |
| Lambda handlers | Plain JavaScript — CommonJS modules |
| Frontend | Micro-frontend architecture (Module Federation) |
| IaC | Pulumi with TypeScript |
| Cloud compute | AWS Lambda + API Gateway |
| Database | MongoDB Atlas with Mongoose ORM |
| API style | REST |
| Auth | Auth0 (OIDC / OAuth2) |
| CI/CD | GitHub Actions |

### Authentication & Authorization

- **Identity Provider**: Auth0 (OIDC/OAuth2) — handles all user accounts and roles.
- **User Management**: Auth0 is the single source of truth; do not store passwords or user records in MongoDB.
- **RBAC**: Role-Based Access Control is enforced at the API (Lambda) level; never trust role claims from the frontend alone.
- Token verification must happen inside every Lambda handler using a shared `middy` middleware that validates the Auth0 JWKS endpoint.

---

## Vertical Contexts

### Shell UI
- Sole responsibility: stitching MFEs together and providing shared infrastructure.
- Owns: routing orchestration, shared component library bootstrap, authentication (login/logout/token refresh), global error boundary, and feature-flag provider.
- Must NOT implement business logic. Delegate all domain behaviour to the relevant MFE.
- Exposes a typed contract (`ShellAPI`) that MFEs consume via Module Federation shared scope.

### MFE (Micro-Frontend)
- Each MFE owns a single business domain (e.g. `dashboard`, `settings`, `billing`).
- Must be independently deployable and lazy-loadable by the Shell.
- Consumes auth context and shared libraries from the Shell via the shared scope — never bundles its own copies.
- Exposes a single mount/unmount entrypoint and a typed public API surface.
- Must NOT reach into another MFE's internals; cross-MFE communication goes through the Shell event bus.
- Every MFE must ship unit tests for its domain logic, hooks, and key UI states; keep those tests close to the feature they cover.
- Frontend strategy is micro-frontend first: keep one MFE per task/objective or bounded domain.

### Frontend Implementation Assumptions (Angular Shell + MFEs)

#### FE stack baseline

| Technology | Version | Purpose |
|---|---|---|
| Angular | 18.2.x | Frontend framework |
| TypeScript | ~5.4.x | Type safety |
| RxJS | ~7.8.x | Reactive programming |
| Auth0 SPA JS | ^2.8.0 | Authentication (`sessionStorage` only) |
| Module Federation | ^18.0.6 | Micro-frontend architecture |
| mitt | ^3.0.1 | Event bus for cross-MFE communication |

#### Core services (temporary location)

- Current location: `src/_temp-shared/` (temporary).
- Migration target: shared package `@InkRamp/ng-common-libs` or project-owned code in `src/app`.
- Import aliases:
  - `@org/core-services` (legacy, currently supported)
  - `@InkRamp/ng-common-libs` (future canonical package)
- Key services:
  - `AuthService`: Auth0 OIDC/OAuth2 lifecycle using `sessionStorage`
  - `RoleService`: RBAC and permission mapping
  - `EventBusService`: cross-MFE communication (`mitt`)
  - `MfeLoaderService`: dynamic MFE loading
  - `DummyDataService`: development mock data

#### Required auth journeys (default coverage)

- `auth:login_success`: run navigation in `NgZone.run()`, route to `returnTo` if present, otherwise route to the first role-allowed MFE route (highest priority).
- `auth:login_failure`: run in `NgZone.run()` to trigger change detection; do not redirect so non-auth query params are preserved.
- `auth:logout`: navigate home inside `NgZone.run()`.
- `auth:session_expired`: clear nav state and redirect to login.
- `auth:token_updated`: no visible UI change required.

#### EventBus auth subscription pattern (shell components)

- Components with auth-gated UI (navigation/profile) must subscribe to both:
  - `authService.user$` (in-zone/session-restored state)
  - EventBus auth events (out-of-zone OAuth callback/session transitions)
- Prefer `takeUntilDestroyed` for teardown in shell components.

#### OAuth callback handling expectations (`AppComponent`)

- Subscribe to `auth:login_success` before calling `handleCallback()` so callback events are not missed.
- `AuthService.handleCallback()` must clean only Auth0 callback params (`code`, `state`) via `history.replaceState`, preserving non-auth query params.
- On success: navigate inside `NgZone.run()` to `returnTo` or fallback first available role-allowed MFE route.
- On failure: do not redirect; rely on `auth:login_failure` event and preserve URL query context.

#### FE code standards (always do)

- Use standalone Angular components with explicit imports.
- Provide robust error handling with user-friendly messages.
- Use explicit TypeScript types for public APIs.
- Use RxJS correctly (`takeUntilDestroyed`, `async` pipe, proper teardown).
- Implement loading and error states for async operations.
- Store tokens in `sessionStorage` only (never `localStorage`).
- Cover all auth journeys listed above.
- Use pure functions for transformation/filtering logic; pass all inputs as parameters and avoid side effects.
- Follow SOLID (especially SRP and DIP), DRY, and YAGNI.
- Prefer declarative syntax (`??`, `?.`, `map/filter/sort`, guard clauses) over nested conditionals.
- Use design tokens from `@InkRamp/ng-common-libs` for colors/spacing; no hardcoded values.
- Use responsive breakpoints: `sm: 480px`, `md: 768px`, `lg: 1024px`; shell owns container sizing/positioning, MFE owns internal layout.
- Route AI iframe communication through `AIBridgeService` (`postMessage` → EventBus events such as `ai:message`, `ai:action`).

#### FE code standards (never do)

- Do not import directly across MFE boundaries (use `EventBusService`).
- Do not store tokens in `localStorage`.
- Do not log sensitive values (passwords, tokens, account numbers).
- Do not bypass `AuthService` for API authentication flow.
- Do not hardcode colors or spacing.
- Do not rely only on `user$` for auth-gated UI; pair it with EventBus auth events.
- Do not rely only on `Router.navigate()` for post-auth UI refresh; wrap auth event handling in `NgZone.run()`.
- Do not add default redirect behavior in auth callback error paths.
- Do not write nested conditionals when null-coalescing/guard clauses can flatten logic.
- Do not duplicate interfaces/types across files; define once and import.
- Do not mix I/O and data transformation in the same method; separate thin adapters from pure transforms.

### API (AWS Lambda — MVP)
- Lambda handlers are plain JavaScript with CommonJS (`require` / `module.exports`). CommonJS is chosen for Lambda compatibility and tooling consistency; ESM interop with bundlers and `middy` is deferred until stable across the stack.
- All server-side logic runs as AWS Lambda functions.
- One Lambda per route / bounded context — keep handlers small and single-purpose.
- Business logic lives in pure-function service modules; the Lambda handler is only a thin adapter (parse → call service → serialize response).
- For each Lambda function, `src/` contains required runtime files (controllers/services/models/etc.) except the entrypoint.
- `index.js`, `package.json`, and `package.sh` live outside `src/` at the function root; `package.sh` handles packaging and Lambda layer deployment.
- Use middleware composition (e.g. `middy`) for cross-cutting concerns: auth, validation, error handling, logging.
- Auth0 JWKS token verification must run in every Lambda before business logic executes.
- Infrastructure (IaC) is co-located in the same repo for MVP; use a dedicated `infra/` directory with Pulumi (TypeScript).
- Database: MongoDB Atlas accessed exclusively via Mongoose ORM; connection string stored in Secrets Manager.

### IaC (Infrastructure as Code — co-located with API for MVP)
- Use **Pulumi with TypeScript** for all infrastructure definitions.
- Every stack must be parameterized by environment (`dev`, `staging`, `prod`).
- No hard-coded ARNs, account IDs, or secrets in source code — use SSM Parameter Store or Secrets Manager references.
- Prefix Pulumi-managed resource names with `inkramp`.
- IaC code follows the same coding standards as application code (pure functions, ≤ ~100 lines per file, no `any`).
- Keep one `postman/` folder in the IaC repo with the shared collection, environments, and ordered journey requests for all endpoints.
- Pull request workflows must run the Postman/Newman collection from that folder and publish the run report as an artifact.
- Each Lambda function must have an equivalent workflow that watches only its folder changes and deploys only that Lambda.

### Backend Module Boundaries
- Module directories: `identity/`, `catalog/`, `rfq/`, `quoting/`, `documents/`, `ai-platform/`, `analytics/`
- Cross-module calls go through `src/<module>/index.js` public interface only
- No module may import from another module's internal files
- Each module owns its own DB query layer; no cross-module table joins in application code

### Agent Run Logging Standard
- Every agent run must emit a structured log with these fields:
  `{ agentId, runId, model, promptVersion, toolsCalled, inputTokens, outputTokens, estimatedCostUsd, latencyMs, input, output, evalVerdict, timestamp }`

## Backend + Infrastructure blueprint (minus UI)

### Keep scope tight first

To stay time-efficient and avoid over-design, implement in two phases:

1. Lock shared instruction policy in this repo’s source-of-truth instruction file: `.github/copilot-instructions.md`
2. Execute backend/infrastructure journeys in service repos one actor journey per iteration (identity → catalog → rfq → quoting → documents → ai-platform → analytics)

### Simplistic journeys (actors + flows)

1. **User login and access bootstrap**
   - Actor: Buyer, Supplier, Admin
   - Flow: client app → Auth0 (authentication) → API Gateway → `identity` Lambda APIs (session/profile/role bootstrap) → MongoDB Atlas
2. **Catalog discovery**
   - Actor: Buyer
   - Flow: client app → API Gateway → `catalog` Lambda APIs → MongoDB Atlas
3. **RFQ lifecycle**
   - Actor: Buyer
   - Flow: client app → API Gateway → `rfq` Lambda APIs → MongoDB Atlas + S3 (attachments)
4. **Quote lifecycle**
   - Actor: Supplier
   - Flow: client app → API Gateway → `quoting` Lambda APIs → MongoDB Atlas
5. **Document processing (long-running)**
   - Actor: System, Admin
   - Flow: API trigger → Step Functions → `documents` Lambdas → S3/OCR → EventBridge/SQS status events
6. **Analytics and AI assist**
   - Actor: Buyer, Supplier, Admin
   - Flow: client app → API Gateway (REST/WebSocket) → `analytics`/`ai-platform` Lambdas → MongoDB Atlas/S3/model provider

### Service domains, Lambdas, and APIs

- **identity**
  - `GET /v1/me`
  - `GET /v1/roles`
  - `POST /v1/auth/logout`
- **catalog**
  - `GET /v1/catalog/items`
  - `GET /v1/catalog/items/{id}`
- **rfq**
  - `POST /v1/rfqs`
  - `GET /v1/rfqs`
  - `GET /v1/rfqs/{id}`
- **quoting**
  - `POST /v1/rfqs/{id}/quotes`
  - `GET /v1/rfqs/{id}/quotes`
- **documents**
  - `POST /v1/documents`
  - `GET /v1/documents/{id}/status`
- **analytics**
  - `GET /v1/analytics/dashboard`
  - `GET /v1/analytics/events`
- **ai-platform**
  - `POST /v1/ai/chat`
  - `POST /v1/ai/actions`
  - `GET /v1/ai/runs/{id}`
  - `WS /v1/ai/stream/connect`
  - `WS /v1/ai/stream/runs/{runId}`

### Required AWS services

- API Gateway (REST, plus WebSocket where AI streaming is required)
- AWS Lambda (one function per route; routes are owned by bounded-context domains)
- AWS Step Functions (long-running workflows and orchestration)
- EventBridge + SQS (event fanout, decoupling, retries, DLQ patterns)
- S3 (documents, generated artifacts, prompt/run payload snapshots)
- Secrets Manager + SSM Parameter Store (secrets/config)
- CloudWatch + X-Ray (logs, metrics, traces)
- IAM (least-privilege execution roles per Lambda/state machine)

### Repo-level backend topology

- IaC stays in Pulumi TypeScript and prefixes resources with `inkramp`.
- Each Lambda package keeps runtime code in `src/`; root contains `index.js`, `package.json`, and `package.sh`.
- `package.sh` owns packaging and Lambda layer deployment.
- Each Lambda has an equivalent GitHub workflow watching only that Lambda folder and deploying only that Lambda.

### Long-running tasks policy

Use Step Functions + Lambda for:

- document extraction and enrichment
- AI multi-step tool/action runs
- heavy analytics/batch recompute

Standardize retries, backoff, DLQ/error routing, and idempotent task handlers.

Event-driven examples:

- `documents` workflow publishes completion/failure domain events on EventBridge.
- downstream consumers (analytics notifications, audit, async enrichers) subscribe via EventBridge rules.
- bursty or retry-heavy work is buffered through SQS before Lambda processing.

### AG-UI implementation boundary

- AG-UI here means the Agent-User Interaction framework/protocol used to drive AI run/session/message/action experiences.
- Use AG-UI in the `ai-platform` domain for run/session/message/action lifecycle.
- Backend contracts should support:
  - run creation
  - streamed token/event delivery
  - action/tool invocation
  - persisted run state and replay
- Keep transport/API handling separate from orchestration logic (Step Functions + Lambda).

## Notes

- The sync workflow only reacts to pushes on `main` when `.github/copilot-instructions.md` changes.
- If `.github/PROJECT_CONTEXT.md` is added later, treat it as the richer product brief that should inform future updates here.

