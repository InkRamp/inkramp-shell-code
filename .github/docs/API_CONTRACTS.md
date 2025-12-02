# API Contracts

This document describes the API contracts between the frontend application and the Backend-for-Frontend (BFF) layer.

---

## Base Configuration

```typescript
// API base URL configuration
const API_CONFIG = {
  baseUrl: environment.apiBaseUrl,  // e.g., 'https://api.i17e.app/v1'
  timeout: 30000,                   // 30 seconds
  retryAttempts: 3
};
```

---

## Authentication

All API calls (except public endpoints) require a valid Bearer token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

The HttpInterceptor automatically attaches tokens from AuthService.

---

## User Profile API

### Get Current User Profile

```http
GET /auth/me
```

Returns the authenticated user's profile including organization and role information.

**Response:**
```typescript
interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfileData;
  timestamp: string;
  statusCode: number;
}

interface UserProfileData {
  userId: string;
  email: string;
  name: string;
  nickname: string;
  picture: string;
  emailVerified: boolean;
  organizations: Organization[];
  roles: Role[];
  permissions: string[];
}

interface Organization {
  id: string;
  name: string;
  displayName: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
}
```

**Example Response (User with Organization):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "userId": "google-oauth2|105249356619326623912",
    "email": "desai.koustubh@gmail.com",
    "name": "Koustubh Desai",
    "nickname": "desai.koustubh",
    "picture": "https://lh3.googleusercontent.com/a/ACg8ocKW-P24w6QOHgZFKUHJNexqF7q3s-TlGxXO0y5Qp6ECUZxcQQ=s96-c",
    "emailVerified": true,
    "organizations": [
      {
        "id": "org_k8eSphulLyDkEOtw",
        "name": "hdfc",
        "displayName": "HDFC"
      }
    ],
    "roles": [
      {
        "id": "rol_uGMOy1YN4yn0QqO4",
        "name": "team-lead",
        "description": "One who manages a team within an org"
      }
    ],
    "permissions": []
  },
  "timestamp": "2025-12-02T03:37:55.155Z",
  "statusCode": 200
}
```

**Example Response (User without Organization):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "userId": "google-oauth2|109184121663700812552",
    "email": "satyam.evam.jayate@gmail.com",
    "name": "Indian Patriot",
    "nickname": "satyam.evam.jayate",
    "picture": "https://lh3.googleusercontent.com/a/ACg8ocKGHflpReD1w7yQD3I4H_rwD_nykRwye2GXZzOWcKEsuxxY6Q=s96-c",
    "emailVerified": true,
    "organizations": [],
    "roles": [
      {
        "id": "rol_WG6uQ24dUO6EuHnC",
        "name": "org-manager",
        "description": "One who manages an organisation within SaaS"
      },
      {
        "id": "rol_i8djnAh3lXlxDIBn",
        "name": "sales-executive",
        "description": "End user for i17ve"
      },
      {
        "id": "rol_kOPmt7tRuALroBrj",
        "name": "super-admin",
        "description": "One who has access at a SaaS level for this product"
      }
    ],
    "permissions": []
  },
  "timestamp": "2025-12-02T03:35:23.702Z",
  "statusCode": 200
}
```

---

## Standard Response Format

### Success Response

```json
{
  "data": { /* response payload */ },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req-123-abc"
  }
}
```

### Paginated Response

```json
{
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req-123-abc"
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be positive"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req-123-abc"
  }
}
```

---

## Incentive Rules API

### List Rules

```http
GET /api/rules
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |
| status | string | Filter by status: active, paused, archived |
| teamId | string | Filter by team (for team leads) |
| search | string | Search in rule name/description |

**Response:**
```typescript
interface Rule {
  id: string;
  name: string;
  description: string;
  orgId: string;
  createdBy: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  status: 'active' | 'paused' | 'archived';
  effectiveFrom: string;  // ISO date
  effectiveTo?: string;   // ISO date
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface RuleCondition {
  field: string;
  operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: string | number | string[];
}

interface RuleAction {
  type: 'bonus' | 'multiplier' | 'tier' | 'notification';
  params: Record<string, unknown>;
}
```

### Get Rule by ID

```http
GET /api/rules/:id
```

### Create Rule

```http
POST /api/rules
```

**Request Body:**
```json
{
  "name": "Q1 Sales Bonus",
  "description": "Bonus for exceeding Q1 targets",
  "conditions": [
    {
      "field": "salesAmount",
      "operator": "gte",
      "value": 100000
    }
  ],
  "actions": [
    {
      "type": "bonus",
      "params": {
        "amount": 5000,
        "currency": "USD"
      }
    }
  ],
  "effectiveFrom": "2024-01-01T00:00:00Z",
  "effectiveTo": "2024-03-31T23:59:59Z"
}
```

### Update Rule

```http
PUT /api/rules/:id
```

### Delete Rule

```http
DELETE /api/rules/:id
```

### Evaluate Rule

```http
POST /api/rules/:id/evaluate
```

**Request Body:**
```json
{
  "userId": "user-123",
  "context": {
    "salesAmount": 150000,
    "period": "Q1-2024"
  }
}
```

**Response:**
```json
{
  "data": {
    "matched": true,
    "actions": [
      {
        "type": "bonus",
        "result": {
          "amount": 5000,
          "currency": "USD"
        }
      }
    ]
  }
}
```

---

## Incentives API

### List Incentives

```http
GET /api/incentives
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| userId | string | Filter by user |
| status | string | pending, approved, paid |
| period | string | e.g., "2024-Q1" |

**Response:**
```typescript
interface Incentive {
  id: string;
  userId: string;
  userName: string;
  ruleId: string;
  ruleName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  period: string;
  calculatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
}
```

### Get Incentive Details

```http
GET /api/incentives/:id
```

### Approve Incentive

```http
POST /api/incentives/:id/approve
```

### Reject Incentive

```http
POST /api/incentives/:id/reject
```

**Request Body:**
```json
{
  "reason": "Data verification required"
}
```

---

## Targets API

### List Targets

```http
GET /api/targets
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | Filter by assignee |
| teamId | string | Filter by team |
| period | string | Target period |
| status | string | active, completed, missed |

**Response:**
```typescript
interface Target {
  id: string;
  userId: string;
  userName: string;
  type: 'sales' | 'units' | 'customers' | 'custom';
  metric: string;
  targetValue: number;
  currentValue: number;
  percentage: number;
  period: string;
  status: 'active' | 'completed' | 'missed';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}
```

### Create Target

```http
POST /api/targets
```

### Update Target

```http
PUT /api/targets/:id
```

### Update Progress

```http
PATCH /api/targets/:id/progress
```

**Request Body:**
```json
{
  "currentValue": 75000
}
```

---

## Dashboard API

### Personal Dashboard

```http
GET /api/dashboard/personal
```

**Response:**
```typescript
interface PersonalDashboard {
  user: {
    id: string;
    name: string;
    role: string;
  };
  period: string;
  summary: {
    totalIncentives: number;
    pendingIncentives: number;
    targetsCompleted: number;
    totalTargets: number;
  };
  recentIncentives: Incentive[];
  activeTargets: Target[];
  rank?: number;
}
```

### Team Dashboard

```http
GET /api/dashboard/team
```

**Response:**
```typescript
interface TeamDashboard {
  team: {
    id: string;
    name: string;
    memberCount: number;
  };
  period: string;
  summary: {
    totalIncentives: number;
    averagePerMember: number;
    topPerformer: string;
    targetsAchievementRate: number;
  };
  memberPerformance: MemberPerformance[];
  leaderboard: LeaderboardEntry[];
}

interface MemberPerformance {
  userId: string;
  userName: string;
  incentivesEarned: number;
  targetsCompleted: number;
  totalTargets: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  score: number;
  change: number;  // position change from previous period
}
```

---

## Leaderboard API

### Get Leaderboard

```http
GET /api/leaderboard
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| scope | string | personal, team, org |
| period | string | Target period |
| metric | string | Ranking metric |
| limit | number | Top N entries |

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Invalid or expired token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input data |
| CONFLICT | 409 | Resource conflict (e.g., duplicate) |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limiting

- Standard endpoints: 100 requests/minute
- Report endpoints: 20 requests/minute
- Export endpoints: 5 requests/minute

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312800
```

---

## Versioning

API version is included in the URL path:
```
https://api.i17e.app/v1/rules
```

Breaking changes will increment the version number.
