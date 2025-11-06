# API Routes Documentation

This document describes all available API routes for managing Organizations, Users, Roles, and Projects in the i17e application.

## Base URL

```
http://localhost:4000
```

## Entity Relationships

```
┌─────────────────┐
│  Organization   │
└────────┬────────┘
         │ 1:n
         ├──────────────────┐
         │                  │
    ┌────▼─────┐      ┌────▼────┐
    │  Users   │      │  Teams  │
    └──────────┘      └────┬────┘
                           │ 1:n
                      ┌────▼─────┐
                      │  Users   │
                      └──────────┘

┌─────────────────┐
│    Project      │
└────────┬────────┘
         │ 1:n
    ┌────▼─────┐
    │  Roles   │
    └──────────┘

┌─────────────────┐
│  System Roles   │  (Common to all Organizations)
└─────────────────┘
```

## Response Format

All endpoints return JSON with the following structure:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Organizations API

### List All Organizations

**GET** `/api/organizations`

Returns all organizations from Zitadel.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "org-123",
      "name": "MyOrg",
      "displayName": "My Organization",
      "primaryDomain": "myorg.com",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

### Get Organization by ID

**GET** `/api/organizations/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "org-123",
    "name": "MyOrg",
    "displayName": "My Organization",
    "primaryDomain": "myorg.com",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Create Organization

**POST** `/api/organizations`

**Request Body:**
```json
{
  "name": "MyOrg",
  "displayName": "My Organization",
  "primaryDomain": "myorg.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "org-123",
    "name": "MyOrg",
    "displayName": "My Organization",
    "primaryDomain": "myorg.com",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Organization created successfully"
}
```

### Update Organization

**PUT** `/api/organizations/:id`

**Request Body:**
```json
{
  "name": "UpdatedOrg",
  "displayName": "Updated Organization"
}
```

### Delete Organization

**DELETE** `/api/organizations/:id`

**Response:**
```json
{
  "success": true,
  "message": "Organization deleted successfully"
}
```

---

## Users API

### List All Users

**GET** `/api/users`

**Query Parameters:**
- `organizationId` (optional): Filter users by organization

**Examples:**
```
GET /api/users
GET /api/users?organizationId=org-123
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-123",
      "userName": "john.doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John Doe",
      "organizationId": "org-123",
      "roleIds": ["sales-executive"],
      "teamId": "team-456",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

### Get User by ID

**GET** `/api/users/:id`

### Get Users by Team

**GET** `/api/users/team/:teamId`

Returns all users belonging to a specific team.

### Create User

**POST** `/api/users`

**Request Body:**
```json
{
  "userName": "john.doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "organizationId": "org-123",
  "roleIds": ["sales-executive"],
  "teamId": "team-456",
  "password": "SecurePassword123!"
}
```

**Required Fields:**
- `userName`
- `email`
- `firstName`
- `lastName`
- `organizationId`

**Optional Fields:**
- `roleIds` (array of role IDs)
- `teamId`
- `password` (if not provided, user must set it on first login)

### Update User

**PUT** `/api/users/:id`

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "roleIds": ["team-lead"],
  "teamId": "team-789",
  "isActive": true
}
```

All fields are optional. Only provided fields will be updated.

### Delete User

**DELETE** `/api/users/:id`

Deactivates the user in Zitadel.

---

## Roles API

### List All Roles

**GET** `/api/roles`

**Query Parameters:**
- `projectId` (optional): Filter roles by project
- `isSystemRole` (optional): Filter system roles only

**Examples:**
```
GET /api/roles?isSystemRole=true
GET /api/roles?projectId=proj-123
```

**System Roles (isSystemRole=true):**
```json
{
  "success": true,
  "data": [
    {
      "id": "super-admin",
      "name": "SUPER_ADMIN",
      "description": "Super administrator with full access",
      "permissions": ["*"],
      "isSystemRole": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "org-admin",
      "name": "ORG_ADMIN",
      "description": "Organization administrator",
      "permissions": ["org:*", "team:*", "user:*"],
      "isSystemRole": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "team-lead",
      "name": "TEAM_LEAD",
      "description": "Team leader with team management access",
      "permissions": ["team:read", "team:update", "user:read"],
      "isSystemRole": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "sales-executive",
      "name": "SALES_EXECUTIVE",
      "description": "Sales executive with basic access",
      "permissions": ["sales:read", "sales:write"],
      "isSystemRole": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 4
}
```

### Get Role by ID

**GET** `/api/roles/:id`

**Query Parameters:**
- `projectId` (required for project-specific roles)

**Examples:**
```
GET /api/roles/super-admin
GET /api/roles/custom-role?projectId=proj-123
```

### Create Role

**POST** `/api/roles?projectId=proj-123`

Creates a new role in the specified project. System roles cannot be created.

**Request Body:**
```json
{
  "name": "custom-role",
  "description": "Custom project role",
  "permissions": ["feature:read", "feature:write"]
}
```

### Update Role

**PUT** `/api/roles/:id?projectId=proj-123`

**Request Body:**
```json
{
  "name": "updated-role",
  "description": "Updated role description",
  "permissions": ["feature:read"]
}
```

### Delete Role

**DELETE** `/api/roles/:id?projectId=proj-123`

Deletes the role from the project. System roles cannot be deleted.

---

## Projects API

### List All Projects

**GET** `/api/projects`

**Query Parameters:**
- `organizationId` (optional): Filter projects by organization

**Examples:**
```
GET /api/projects
GET /api/projects?organizationId=org-123
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "proj-123",
      "name": "Sales App",
      "organizationId": "org-123",
      "roleIds": ["sales-executive", "team-lead"],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

### Get Project by ID

**GET** `/api/projects/:id`

Returns project details including all associated roles.

### Create Project

**POST** `/api/projects`

**Request Body:**
```json
{
  "name": "Sales App",
  "organizationId": "org-123",
  "roleIds": ["sales-executive", "team-lead"]
}
```

**Required Fields:**
- `name`
- `organizationId`

**Optional Fields:**
- `roleIds` (array of role IDs to add to the project)

### Update Project

**PUT** `/api/projects/:id`

**Request Body:**
```json
{
  "name": "Updated Sales App",
  "roleIds": ["sales-executive", "team-lead", "manager"]
}
```

### Delete Project

**DELETE** `/api/projects/:id`

### Add Role to Project

**POST** `/api/projects/:id/roles`

**Request Body:**
```json
{
  "roleKey": "manager",
  "displayName": "Manager Role"
}
```

### Remove Role from Project

**DELETE** `/api/projects/:id/roles/:roleId`

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server error or Zitadel error |

## Common Error Responses

**Invalid Input:**
```json
{
  "success": false,
  "error": "projectId is required for non-system roles"
}
```

**Zitadel Error:**
```json
{
  "success": false,
  "error": "Failed to create organization"
}
```

**Not Found:**
```json
{
  "success": false,
  "error": "Not Found",
  "path": "/api/invalid"
}
```

## Testing the API

### Using cURL

**Get all organizations:**
```bash
curl http://localhost:4000/api/organizations
```

**Create a user:**
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "john.doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "organizationId": "org-123",
    "roleIds": ["sales-executive"]
  }'
```

**Get system roles:**
```bash
curl http://localhost:4000/api/roles?isSystemRole=true
```

### Using JavaScript/Fetch

```javascript
// Get all users in an organization
const response = await fetch('http://localhost:4000/api/users?organizationId=org-123');
const data = await response.json();

// Create a project
const response = await fetch('http://localhost:4000/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My Project',
    organizationId: 'org-123',
    roleIds: ['sales-executive']
  })
});
const data = await response.json();
```

## Notes

1. **Authentication**: All endpoints are currently public for development. Add authentication middleware for production.

2. **Pagination**: Not implemented yet. All results are returned in a single response.

3. **Validation**: Input validation is minimal. Add comprehensive validation for production.

4. **Rate Limiting**: Not implemented. Add rate limiting for production.

5. **Zitadel Permissions**: Ensure your Zitadel client has the necessary permissions to manage organizations, users, roles, and projects.
