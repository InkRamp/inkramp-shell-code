# Zitadel Multi-Tenant Quick Reference

## 🎯 Quick Start Checklist

### Before You Begin
- [ ] Import `Zitadel_Multi_Tenant_CRUD.postman_collection.json` into Postman
- [ ] Create a Postman environment
- [ ] Set `zitadel_domain` variable (e.g., `your-instance.zitadel.cloud`)
- [ ] Set `zitadel_token` variable (your PAT or service account token)

### First-Time Setup Flow
```
Step 1: Authenticate
  └─> Run: "Get Access Token (OAuth2)" or use PAT

Step 2: Create Organization
  └─> Run: "Create Organization"
  └─> Auto-saves: org_id

Step 3: Create Project (Team)
  └─> Run: "Create Project"
  └─> Auto-saves: project_id

Step 4: Define Roles
  └─> Run: "Create Project Role" (repeat for each role)
  └─> Examples: developer, admin, viewer

Step 5: Create Users
  └─> Run: "Create User (Human)"
  └─> Auto-saves: user_id

Step 6: Assign User to Team
  └─> Run: "Create User Grant"
  └─> Links user + project + roles
```

## 📊 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ZITADEL INSTANCE                         │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  GLOBAL/INSTANCE ROLES                             │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │    │
│  │  │IAM_OWNER │  │IAM_ADMIN │  │Custom... │         │    │
│  │  └──────────┘  └──────────┘  └──────────┘         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         ORGANIZATION #1 (Tenant)                    │   │
│  │         Name: "Acme Corp"                           │   │
│  │                                                     │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  ORG MEMBERS & ROLES                         │  │   │
│  │  │  User: john@acme.com → ORG_OWNER            │  │   │
│  │  │  User: jane@acme.com → ORG_USER_MANAGER     │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │                                                     │   │
│  │  ┌────────────────────┐  ┌────────────────────┐   │   │
│  │  │   PROJECT #1       │  │   PROJECT #2       │   │   │
│  │  │   (Team/Dept)      │  │   (Team/Dept)      │   │   │
│  │  │   "Engineering"    │  │   "Marketing"      │   │   │
│  │  │                    │  │                    │   │   │
│  │  │ PROJECT ROLES:     │  │ PROJECT ROLES:     │   │   │
│  │  │ • developer        │  │ • content-creator  │   │   │
│  │  │ • team-lead        │  │ • campaign-mgr     │   │   │
│  │  │ • qa-engineer      │  │ • designer         │   │   │
│  │  │                    │  │                    │   │   │
│  │  │ USER GRANTS:       │  │ USER GRANTS:       │   │   │
│  │  │ ┌─────────────┐    │  │ ┌─────────────┐   │   │   │
│  │  │ │ alice@...   │────┼──┼→│ alice@...   │   │   │   │
│  │  │ │ roles:      │    │  │ │ roles:      │   │   │   │
│  │  │ │ • developer │    │  │ │ • designer  │   │   │   │
│  │  │ │ • team-lead │    │  │ │             │   │   │   │
│  │  │ └─────────────┘    │  │ └─────────────┘   │   │   │
│  │  │                    │  │                    │   │   │
│  │  │ ┌─────────────┐    │  │ ┌─────────────┐   │   │   │
│  │  │ │ bob@...     │    │  │ │ carol@...   │   │   │   │
│  │  │ │ roles:      │    │  │ │ roles:      │   │   │   │
│  │  │ │ • developer │    │  │ │ • content...│   │   │   │
│  │  │ └─────────────┘    │  │ │ • campaign..│   │   │   │
│  │  │                    │  │ └─────────────┘   │   │   │
│  │  └────────────────────┘  └────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         ORGANIZATION #2 (Tenant)                    │   │
│  │         Name: "TechStart Inc"                       │   │
│  │         ... (similar structure)                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔗 Relationship Types

### One-to-Many Relationships

| Parent | Child | Description |
|--------|-------|-------------|
| Instance | Organizations | One Zitadel instance hosts many orgs (tenants) |
| Organization | Projects | One org contains many projects (teams) |
| Project | Roles | One project defines many roles |
| Project | Grants | One project can have many user grants |
| User | Grants | One user can have grants to many projects |

### Many-to-Many Relationships

| Entity A | Entity B | Via | Description |
|----------|----------|-----|-------------|
| Users | Projects | Grants | Users can belong to multiple projects; Projects can have multiple users |
| Users | Roles | Grants | Users can have multiple roles; Roles can be assigned to multiple users |

## 🎨 Common Use Case Patterns

### Pattern 1: Employee in Multiple Departments
```
User: Alice Johnson
├─> Organization: Acme Corp
├─> Grant 1: Engineering Project
│   └─> Roles: [developer]
└─> Grant 2: Innovation Lab Project
    └─> Roles: [developer, team-lead]
```

**API Calls:**
1. Create User (Alice)
2. Create Grant #1: Alice → Engineering → [developer]
3. Create Grant #2: Alice → Innovation Lab → [developer, team-lead]

### Pattern 2: Contractor (External User)
```
User: Bob Smith (Contractor)
├─> Organization: Acme Corp
└─> Grant: Specific Project Only
    └─> Roles: [external-developer]
    └─> Time-limited access
```

**API Calls:**
1. Create User (Bob) with metadata marking as contractor
2. Create Grant: Bob → Specific Project → [external-developer]
3. Later: Delete Grant when contract ends

### Pattern 3: Department Manager
```
User: Carol Admin
├─> Organization: Acme Corp
│   └─> Org Role: ORG_USER_MANAGER (can manage users)
└─> Grant: Marketing Project
    └─> Roles: [campaign-manager, admin]
```

**API Calls:**
1. Create User (Carol)
2. Add Org Member: Carol → [ORG_USER_MANAGER]
3. Create Grant: Carol → Marketing → [campaign-manager, admin]

## 📋 Essential API Endpoints Quick Reference

### Authentication
```
POST /oauth/v2/token
  → Get access token

POST /oauth/v2/introspect
  → Verify token validity
```

### Organizations (Tenant Management)
```
POST /management/v1/orgs
  → Create new organization

POST /admin/v1/orgs/_search
  → List all organizations

GET /management/v1/orgs/me
  → Get current org details

DELETE /admin/v1/orgs/{orgId}
  → Delete organization
```

### Projects (Team Management)
```
POST /management/v1/projects
  → Create new project/team

POST /management/v1/projects/_search
  → List all projects in org

GET /management/v1/projects/{projectId}
  → Get project details

DELETE /management/v1/projects/{projectId}
  → Delete project
```

### Project Roles
```
POST /management/v1/projects/{projectId}/roles
  → Create role in project
  → Body: { roleKey, displayName, group }

POST /management/v1/projects/{projectId}/roles/_search
  → List roles in project

DELETE /management/v1/projects/{projectId}/roles/{roleKey}
  → Delete role
```

### Users
```
POST /management/v1/users/human
  → Create human user
  → Body: { userName, profile, email, password }

POST /management/v1/users/machine
  → Create service account

POST /management/v1/users/_search
  → Search/list users
  → Body: { query, queries }

GET /management/v1/users/{userId}
  → Get user details

DELETE /management/v1/users/{userId}
  → Delete user
```

### User Grants (Team Assignment)
```
POST /management/v1/users/{userId}/grants
  → Assign user to project with roles
  → Body: { userId, projectId, roleKeys: [] }

POST /management/v1/users/{userId}/grants/_search
  → List all projects user has access to

POST /management/v1/projects/{projectId}/grants/_search
  → List all users in a project

PUT /management/v1/users/{userId}/grants/{grantId}
  → Update user's roles in project

DELETE /management/v1/users/{userId}/grants/{grantId}
  → Remove user from project
```

### Organization Members
```
POST /management/v1/orgs/me/members
  → Add user as org member
  → Body: { userId, roles: ["ORG_OWNER"] }

POST /management/v1/orgs/me/members/_search
  → List org members

DELETE /management/v1/orgs/me/members/{userId}
  → Remove org member
```

## 💡 Postman Collection Tips

### Auto-Setting Variables
These requests automatically save IDs to environment:
- ✅ Create Organization → saves `org_id`
- ✅ Create Project → saves `project_id`
- ✅ Create User (Human) → saves `user_id`
- ✅ Create User (Machine) → saves `machine_user_id`

### Request Dependencies
Some requests depend on others being run first:

```
1. Authentication (always first)
   ↓
2. Create Organization (sets org_id)
   ↓
3. Create Project (uses org context, sets project_id)
   ↓
4. Create Project Roles (uses project_id)
   ↓
5. Create Users (uses org context, sets user_id)
   ↓
6. Create User Grants (uses user_id + project_id)
```

### Search Query Patterns

**Empty Search (list all):**
```json
{
  "query": {
    "offset": 0,
    "limit": 100,
    "asc": true
  },
  "queries": []
}
```

**Search by Name:**
```json
{
  "query": { "offset": 0, "limit": 100 },
  "queries": [
    {
      "userNameQuery": {
        "userName": "alice",
        "method": "TEXT_QUERY_METHOD_CONTAINS"
      }
    }
  ]
}
```

**Search by Organization:**
```json
{
  "query": { "offset": 0, "limit": 100 },
  "queries": [
    {
      "orgQuery": {
        "orgId": "{{org_id}}"
      }
    }
  ]
}
```

## 🚨 Common Mistakes to Avoid

### ❌ Mistake 1: Wrong API Level
```
❌ Using /admin/v1/... without instance admin role
✅ Use /management/v1/... for org-level operations
```

### ❌ Mistake 2: Missing Organization Context
```
❌ Creating project without being in org context
✅ Ensure token/session has org context before creating projects
```

### ❌ Mistake 3: Confusing Roles vs Grants
```
❌ Trying to assign role directly to user
✅ Create Grant that links user + project + roles
```

### ❌ Mistake 4: Not Setting Variables
```
❌ Manually copying IDs for each request
✅ Let test scripts auto-save IDs to environment
```

### ❌ Mistake 5: Deleting Instead of Deactivating
```
❌ DELETE user (permanent, cannot undo)
✅ POST /users/{id}/_deactivate (reversible)
```

## 📖 Learning Exercises

### Exercise 1: Single Team Setup
1. Create an organization "MyCompany"
2. Create a project "DevTeam"
3. Add roles: developer, qa, lead
4. Create 3 users
5. Grant each user to DevTeam with different roles
6. List all users in DevTeam
7. Update one user's roles
8. Remove one user from team

### Exercise 2: Cross-Team User
1. Create organization "TechCorp"
2. Create two projects: "Backend" and "Frontend"
3. Create role "fullstack-dev" in both projects
4. Create user "Alice"
5. Grant Alice to both projects with "fullstack-dev" role
6. List Alice's grants (should show 2)
7. Update Alice to be "lead" in Backend only

### Exercise 3: Organization Hierarchy
1. Create org "Enterprise"
2. Add yourself as ORG_OWNER
3. Create 3 projects: Sales, Engineering, Support
4. Create different roles in each project
5. Create 10 users
6. Distribute users across projects with various role combinations
7. Query: Find all users in Engineering
8. Query: Find all projects Alice belongs to

## 🔧 Debugging Tips

### View Current Environment
In Postman, click the "eye" icon to see all environment variables and their current values.

### Check Response Status
- `200 OK` - Success for GET/PUT/DELETE
- `201 Created` - Success for POST create operations
- `401 Unauthorized` - Token issue
- `403 Forbidden` - Permission issue
- `404 Not Found` - Resource doesn't exist

### Enable Request Logging
In Postman:
1. Open Console (View → Show Postman Console)
2. Run requests
3. See full request/response details

### Test Token
Run "Introspect Token" request to verify:
- Token is valid
- Token hasn't expired
- Token has correct scopes

## 📚 Next Steps

After mastering the basics:
1. **Automation**: Create Postman test scripts for workflows
2. **CI/CD**: Export collection for automated testing
3. **SDKs**: Use Zitadel SDKs (Go, .NET, JS) in your application
4. **OIDC Integration**: Integrate authentication in your app
5. **Custom Roles**: Design role hierarchy for your use case
6. **Monitoring**: Set up observability for Zitadel operations

---

**Quick Links:**
- Full Guide: `ZITADEL_POSTMAN_GUIDE.md`
- Postman Collection: `Zitadel_Multi_Tenant_CRUD.postman_collection.json`
- Zitadel Docs: https://zitadel.com/docs
