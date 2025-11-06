# i17e Backend API

Backend server for i17e application with Zitadel integration for managing organizations, users, roles, and projects.

## Features

- ✅ **CRUD operations** for Organizations, Users, Roles, and Projects
- ✅ **Zitadel Integration** for authentication and entity management
- ✅ **Relationship Management**: 
  - Organization → Users (1:n)
  - Organization → Teams (1:n)
  - Team → Users (1:n)
  - Project → Roles (1:n)
  - System-wide common roles
- ✅ **RESTful API** with comprehensive endpoints
- ✅ **TypeScript** for type safety
- ✅ **CORS enabled** for frontend integration

## Prerequisites

- Node.js 18+ and npm
- Zitadel account and credentials

## Installation

```bash
cd server
npm install
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your Zitadel credentials:
```env
ZITADEL_ISSUER=https://your-instance.zitadel.cloud
ZITADEL_CLIENT_ID=your_client_id
ZITADEL_CLIENT_SECRET=your_client_secret
PORT=4000
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## API Endpoints

### Organizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizations` | Get all organizations |
| GET | `/api/organizations/:id` | Get organization by ID |
| POST | `/api/organizations` | Create new organization |
| PUT | `/api/organizations/:id` | Update organization |
| DELETE | `/api/organizations/:id` | Delete organization |

**Example Request:**
```bash
# Create organization
curl -X POST http://localhost:4000/api/organizations \
  -H "Content-Type: application/json" \
  -d '{"name": "MyOrg", "displayName": "My Organization"}'
```

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (filter by `?organizationId=xxx`) |
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/users/team/:teamId` | Get users by team |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

**Example Request:**
```bash
# Create user
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

# Get users by organization
curl http://localhost:4000/api/users?organizationId=org-123
```

### Roles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roles` | Get all roles (filter by `?projectId=xxx` or `?isSystemRole=true`) |
| GET | `/api/roles/:id` | Get role by ID |
| POST | `/api/roles` | Create new role (requires `?projectId=xxx`) |
| PUT | `/api/roles/:id` | Update role (requires `?projectId=xxx`) |
| DELETE | `/api/roles/:id` | Delete role (requires `?projectId=xxx`) |

**System Roles (Common to all organizations):**
- `super-admin` - Super administrator with full access
- `org-admin` - Organization administrator
- `team-lead` - Team leader
- `sales-executive` - Sales executive

**Example Request:**
```bash
# Get system roles
curl http://localhost:4000/api/roles?isSystemRole=true

# Create project role
curl -X POST http://localhost:4000/api/roles?projectId=proj-123 \
  -H "Content-Type: application/json" \
  -d '{"name": "custom-role", "description": "Custom project role"}'
```

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects (filter by `?organizationId=xxx`) |
| GET | `/api/projects/:id` | Get project by ID |
| POST | `/api/projects` | Create new project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/roles` | Add role to project |
| DELETE | `/api/projects/:id/roles/:roleId` | Remove role from project |

**Example Request:**
```bash
# Create project
curl -X POST http://localhost:4000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales App",
    "organizationId": "org-123",
    "roleIds": ["sales-executive", "team-lead"]
  }'

# Add role to project
curl -X POST http://localhost:4000/api/projects/proj-123/roles \
  -H "Content-Type: application/json" \
  -d '{"roleKey": "manager", "displayName": "Manager"}'
```

## Data Relationships

```
Organization (1) ──────→ (n) Users
     │
     └──────→ (n) Teams ──────→ (n) Users
     │
     └──────→ (n) Projects ──────→ (n) Roles

System Roles (Common to all Organizations)
```

### Relationship Details

1. **Organization to Users (1:n)**
   - Each organization can have multiple users
   - Each user belongs to one organization
   - Filter users by organization: `GET /api/users?organizationId=xxx`

2. **Organization to Teams (1:n)**
   - Each organization can have multiple teams
   - Each team belongs to one organization
   - Teams are stored locally or in Zitadel metadata

3. **Team to Users (1:n)**
   - Each team can have multiple users
   - Each user can belong to one team
   - Access via: `GET /api/users/team/:teamId`

4. **Project to Roles (1:n)**
   - Each project can have multiple roles
   - Roles can be project-specific or system-wide
   - Manage via: `POST /api/projects/:id/roles`

5. **System Roles**
   - Common roles shared across all organizations
   - Cannot be deleted or modified via API
   - Available to all projects

## Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Project Structure
```
server/
├── src/
│   ├── config/          # Configuration files
│   │   └── zitadel.config.ts
│   ├── controllers/     # Request handlers
│   │   ├── organization.controller.ts
│   │   ├── user.controller.ts
│   │   ├── role.controller.ts
│   │   └── project.controller.ts
│   ├── models/          # Data models and DTOs
│   │   └── entities.ts
│   ├── routes/          # API routes
│   │   ├── organization.routes.ts
│   │   ├── user.routes.ts
│   │   ├── role.routes.ts
│   │   └── project.routes.ts
│   └── index.ts         # Main server file
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Endpoints

1. Create/update controller in `src/controllers/`
2. Create/update routes in `src/routes/`
3. Register routes in `src/index.ts`
4. Update this README with new endpoints

## Testing

Test the API using the root endpoint for documentation:
```bash
curl http://localhost:4000/
```

Or check health:
```bash
curl http://localhost:4000/health
```

## Troubleshooting

### Zitadel Authentication Failed
- Verify your credentials in `.env`
- Check that client has proper permissions in Zitadel
- Ensure the issuer URL is correct

### CORS Errors
- Check that the frontend origin is in the CORS whitelist
- Update `src/index.ts` to add your frontend URL

### Port Already in Use
- Change the PORT in `.env`
- Or kill the process using port 4000

## Integration with Frontend

Update the frontend authentication service to point to this backend:

```typescript
// In src/app/services/authentication.service.ts
const API_URL = 'http://localhost:4000';
```

## License

ISC
