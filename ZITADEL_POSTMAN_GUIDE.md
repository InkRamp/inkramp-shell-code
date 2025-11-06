# Zitadel Multi-Tenant Postman Collection Guide

## 📋 Overview

This guide accompanies the Postman collection for performing CRUD operations on Zitadel for a multi-tenant architecture where:
- **1 Organization** contains **Multiple Teams (Projects)**
- **Each Team** contains **Multiple Users**
- **Roles** are globally defined and can be assigned at different levels

## 🏗️ Multi-Tenant Architecture

### Hierarchy Structure

```
┌─────────────────────────────────────────────────┐
│              Zitadel Instance                   │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │         Organization (Tenant)             │ │
│  │                                           │ │
│  │  ┌─────────────┐    ┌─────────────┐      │ │
│  │  │  Project 1  │    │  Project 2  │      │ │
│  │  │   (Team)    │    │   (Team)    │      │ │
│  │  │             │    │             │      │ │
│  │  │  ┌───────┐  │    │  ┌───────┐  │      │ │
│  │  │  │User 1 │  │    │  │User 3 │  │      │ │
│  │  │  └───────┘  │    │  └───────┘  │      │ │
│  │  │  ┌───────┐  │    │  ┌───────┐  │      │ │
│  │  │  │User 2 │  │    │  │User 4 │  │      │ │
│  │  │  └───────┘  │    │  └───────┘  │      │ │
│  │  └─────────────┘    └─────────────┘      │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Global Roles: Admin, Developer, Viewer, etc.  │
└─────────────────────────────────────────────────┘
```

## 🔑 Key Concepts & Relationships

### 1. Organizations (Tenants)
- **What:** Top-level container for your multi-tenant system
- **Use Case:** Represents a single customer/company in SaaS
- **Example:** "Acme Corporation", "TechStart Inc."

### 2. Projects (Teams)
- **What:** Subdivision within an organization
- **Use Case:** Departments, teams, or product lines
- **Example:** "Engineering Team", "Sales Team", "Marketing Department"
- **Relationship:** Many projects belong to one organization

### 3. Users
- **What:** Individuals who access the system
- **Types:**
  - **Human Users:** Real people with login credentials
  - **Machine Users:** Service accounts for API access
- **Relationship:** Users can be members of multiple projects via grants

### 4. Roles
- **Global Roles:** Instance-wide, available everywhere
  - Examples: `SUPER_ADMIN`, `BILLING_ADMIN`
- **Project Roles:** Specific to a project/team
  - Examples: `developer`, `team-lead`, `viewer`
- **Organization Roles:** Specific to organization management
  - Examples: `ORG_OWNER`, `ORG_USER_MANAGER`, `ORG_PROJECT_CREATOR`

### 5. Grants (User-to-Project Assignments)
- **What:** Links users to projects with specific roles
- **Use Case:** Assign a user to a team with permissions
- **Example:** User "John Doe" is granted "developer" role in "Engineering Team" project

## 📝 Relationship Matrix

| Entity | Contains | Contained By | Role Assignment Level |
|--------|----------|--------------|----------------------|
| **Organization** | Projects, Members | Instance | Org-level roles (ORG_OWNER, etc.) |
| **Project** | User Grants, Roles | Organization | Project-specific roles |
| **User** | - | Multiple Projects via Grants | Receives roles via grants |
| **Role** | - | Project or Global | Assigned to users via grants |
| **Grant** | User + Project + Roles | - | Links user to project with roles |

## 🚀 Getting Started

### Step 1: Import Collection
1. Open Postman
2. Click **Import**
3. Select `Zitadel_Multi_Tenant_CRUD.postman_collection.json`
4. Collection will appear in your workspace

### Step 2: Create Environment
1. Click **Environments** in Postman
2. Create a new environment (e.g., "Zitadel Dev")
3. Add these variables:

| Variable | Type | Initial Value | Description |
|----------|------|---------------|-------------|
| `zitadel_domain` | default | `your-instance.zitadel.cloud` | Your Zitadel instance URL |
| `zitadel_token` | secret | `your-pat-token` | Your Personal Access Token |
| `org_id` | default | (auto-set) | Organization ID after creation |
| `project_id` | default | (auto-set) | Project ID after creation |
| `user_id` | default | (auto-set) | User ID after creation |
| `grant_id` | default | (auto-set) | Grant ID after creation |

### Step 3: Get Your Access Token

#### Option A: Personal Access Token (PAT)
1. Login to your Zitadel instance
2. Go to your user profile → Personal Access Tokens
3. Create a new PAT with necessary scopes
4. Copy the token and set it in `zitadel_token` variable

#### Option B: Service Account (Recommended for Production)
1. Create a machine user in Zitadel
2. Generate a service account key (JWT)
3. Use the "Get Access Token (OAuth2)" request in the collection
4. Configure with your service account credentials

## 📖 Common Workflows

### Workflow 1: Set Up a New Organization with Team

```
1. Authentication
   └─> Get Access Token (OAuth2)

2. Create Organization
   └─> POST /management/v1/orgs
   └─> Saves org_id to environment

3. Create Project (Team) in Organization
   └─> POST /management/v1/projects
   └─> Saves project_id to environment

4. Define Project Roles
   └─> POST /management/v1/projects/{project_id}/roles
   └─> Create roles: "developer", "team-lead", "viewer"

5. Create Users
   └─> POST /management/v1/users/human
   └─> Saves user_id to environment

6. Assign Users to Project with Roles (Grant)
   └─> POST /management/v1/users/{user_id}/grants
   └─> Link user to project with specific roles
```

### Workflow 2: Add User to Existing Team

```
1. List Projects
   └─> POST /management/v1/projects/_search
   └─> Find the project/team you want

2. Create or Find User
   └─> POST /management/v1/users/human (create)
   └─> OR POST /management/v1/users/_search (find)

3. Create User Grant
   └─> POST /management/v1/users/{user_id}/grants
   └─> Body: { userId, projectId, roleKeys: ["developer"] }
```

### Workflow 3: View All Users in a Team

```
1. Get Project ID
   └─> Use environment variable or search

2. List Project Grants
   └─> POST /management/v1/projects/{project_id}/grants/_search
   └─> Returns all users with access to this project
```

### Workflow 4: Update User's Role in Team

```
1. Get User's Grants
   └─> POST /management/v1/users/{user_id}/grants/_search
   └─> Find the grant_id for the specific project

2. Update Grant
   └─> PUT /management/v1/users/{user_id}/grants/{grant_id}
   └─> Body: { roleKeys: ["team-lead", "developer"] }
```

## 🎯 Example Scenarios

### Scenario 1: E-commerce Multi-Tenant Platform

**Setup:**
- Organization: "FashionStore Inc."
- Projects:
  - "Customer Service Team" (roles: agent, supervisor)
  - "Warehouse Team" (roles: picker, manager)
  - "Marketing Team" (roles: content-creator, campaign-manager)

**Implementation:**
1. Create organization "FashionStore Inc."
2. Create 3 projects for each team
3. Define roles in each project
4. Create users for each team
5. Grant users to their respective projects with roles

### Scenario 2: Software Development Company

**Setup:**
- Organization: "DevCo"
- Projects:
  - "Project Alpha" (roles: developer, qa, product-owner)
  - "Project Beta" (roles: developer, qa, product-owner)
  - "Infrastructure Team" (roles: devops, sre)

**Cross-Team Users:**
- User "Jane" is a developer in both Project Alpha and Beta
- User "Bob" is QA in Alpha and developer in Infrastructure

**Implementation:**
1. Create organization "DevCo"
2. Create 3 projects
3. Create users
4. Grant Jane to both Alpha and Beta with "developer" role
5. Grant Bob to Alpha with "qa" role AND Infrastructure with "developer" role

## 🔐 Security Best Practices

### 1. Use Service Accounts for API Access
- Create machine users for automated systems
- Use JWT-based authentication
- Rotate keys regularly

### 2. Principle of Least Privilege
- Only grant necessary roles
- Use project-specific roles instead of org-wide when possible
- Regularly audit user grants

### 3. Environment Separation
- Use different Zitadel instances/orgs for dev/staging/prod
- Never share production tokens in documentation
- Use Postman environments to switch between instances

### 4. Token Management
- Store tokens securely (use Postman vault or secret variables)
- Set token expiration
- Implement token refresh flow

## 🔄 API Request Patterns

### Pattern 1: Search/List Endpoints
Most list operations use a `_search` endpoint with POST method:

```json
{
  "query": {
    "offset": 0,
    "limit": 100,
    "asc": true
  },
  "queries": [
    // Optional filters here
  ]
}
```

### Pattern 2: Automatic Variable Setting
Many create operations have test scripts that automatically save IDs:

```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("org_id", jsonData.id);
}
```

### Pattern 3: Nested Resources
Resources follow a hierarchical URL pattern:

```
/management/v1/orgs/{org_id}
/management/v1/projects/{project_id}
/management/v1/projects/{project_id}/roles
/management/v1/users/{user_id}
/management/v1/users/{user_id}/grants
```

## 📊 Understanding Zitadel API Levels

### Admin API (`/admin/v1/...`)
- **Scope:** Instance-wide operations
- **Use Cases:**
  - List all organizations
  - Instance-level user searches
  - Global role management
- **Permissions:** Requires instance admin access

### Management API (`/management/v1/...`)
- **Scope:** Organization-level operations
- **Use Cases:**
  - Manage projects within org
  - Manage users within org
  - Project role definitions
- **Permissions:** Requires org-level permissions

### Auth API (`/oauth/v2/...`)
- **Scope:** Authentication & authorization
- **Use Cases:**
  - Get access tokens
  - Introspect tokens
  - User info retrieval

## 🛠️ Troubleshooting

### Issue: "Unauthorized" Error
**Solution:**
- Verify `zitadel_token` is set correctly
- Check token hasn't expired
- Ensure service account has necessary permissions

### Issue: "Resource not found"
**Solution:**
- Verify the org_id/project_id/user_id variables are set
- Check you're using the correct organization context
- Run the "Get Organization by ID" request to verify access

### Issue: "Permission denied"
**Solution:**
- Check your user/service account has the required role
- Verify you're operating in the correct organization context
- Review the role hierarchy (org roles vs project roles)

### Issue: Variable not auto-setting
**Solution:**
- Check the response status code (should be 200 or 201)
- Review the test script in the request
- Manually copy the ID from response and set in environment

## 📚 Additional Resources

- [Zitadel Official Documentation](https://zitadel.com/docs)
- [Zitadel API Reference](https://zitadel.com/docs/apis/introduction)
- [Zitadel Console](https://zitadel.com/docs/guides/manage/console) - Web UI for visual management
- [OAuth2 & OIDC Guide](https://zitadel.com/docs/guides/integrate/oauth)

## 💡 Tips for Study & Learning

1. **Start Small:** Create one org, one project, one user first
2. **Use Console:** Cross-reference Postman operations with Zitadel web console
3. **Experiment:** Try different role combinations to understand permissions
4. **Test Scenarios:** Simulate real-world use cases (employee onboarding, team changes)
5. **Study Responses:** Examine the JSON structure returned by each endpoint
6. **Chain Requests:** Practice workflows by running requests in sequence
7. **Export Data:** Use list endpoints to see relationships between entities

## 🎓 Learning Path

### Week 1: Basics
- [ ] Set up Postman environment
- [ ] Authenticate successfully
- [ ] Create org, project, user
- [ ] Understand the basic hierarchy

### Week 2: Roles & Grants
- [ ] Create project roles
- [ ] Assign users to projects
- [ ] Update and remove grants
- [ ] Understand role inheritance

### Week 3: Advanced Operations
- [ ] Multi-project user assignments
- [ ] Complex search queries
- [ ] Organization membership management
- [ ] Machine user creation and usage

### Week 4: Production Patterns
- [ ] Service account setup
- [ ] Token refresh flows
- [ ] Bulk operations
- [ ] Migration strategies

## 📞 Support & Community

If you encounter issues or have questions:
1. Check the troubleshooting section above
2. Review Zitadel documentation
3. Join Zitadel Discord/Community
4. Search existing GitHub issues

---

**Happy Learning! 🚀**

This collection is designed for educational purposes. For production use, implement proper security measures, error handling, and monitoring.
