# Zitadel Multi-Tenant Study Materials - Complete Package

## 📦 What's Included

This package contains comprehensive study materials for learning Zitadel CRUD operations in a multi-tenant architecture.

### Files in This Package

1. **Zitadel_Multi_Tenant_CRUD.postman_collection.json** (26 KB)
   - Ready-to-import Postman collection
   - 38 fully configured API requests
   - Auto-variable setting via test scripts
   - Organized in 8 logical sections

2. **ZITADEL_POSTMAN_GUIDE.md** (14 KB)
   - Comprehensive learning guide
   - Multi-tenant architecture explanation
   - Step-by-step workflows
   - Common scenarios and examples
   - Troubleshooting section
   - 4-week learning path

3. **ZITADEL_QUICK_REFERENCE.md** (15 KB)
   - Quick reference guide
   - Visual ASCII diagrams
   - API endpoint cheat sheet
   - Common patterns and mistakes
   - Learning exercises
   - Debugging tips

4. **ZITADEL_INTEGRATION.md** (6.8 KB) *(existing file)*
   - OAuth2 authentication details
   - Integration with this repository's app
   - Role mapping information

## 🎯 Your Multi-Tenant Architecture

Based on your requirements:

```
Multi-Tenant Structure:
┌─────────────────────────────────────┐
│        1 ORGANIZATION               │
│         (Your Tenant)               │
│                                     │
│  ┌──────────────────────────────┐  │
│  │      Multiple TEAMS          │  │
│  │   (Projects in Zitadel)      │  │
│  │                              │  │
│  │  Team 1  Team 2  Team 3      │  │
│  │    │       │       │          │  │
│  │    ├─Users ├─Users ├─Users   │  │
│  │    └─Roles └─Roles └─Roles   │  │
│  └──────────────────────────────┘  │
│                                     │
│  Global Roles (Common Across All): │
│  • admin, developer, viewer, etc.  │
└─────────────────────────────────────┘
```

### Key Relationships

- **Organization ↔ Teams**: One org has multiple teams (Zitadel Projects)
- **Team ↔ Users**: Each team has multiple users (via User Grants)
- **Roles**: Global roles are available across all teams
- **User Grants**: Link users to teams with specific roles

## 🚀 Getting Started (5 Minutes)

### Step 1: Import to Postman
1. Open Postman desktop app or web
2. Click **Import** button
3. Select `Zitadel_Multi_Tenant_CRUD.postman_collection.json`
4. Collection appears in left sidebar

### Step 2: Set Up Environment
1. Click **Environments** (left sidebar)
2. Click **+** to create new environment
3. Name it "Zitadel Study"
4. Add these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| zitadel_domain | your-instance.zitadel.cloud | your-instance.zitadel.cloud |
| zitadel_token | your-pat-token-here | your-pat-token-here |

5. Click **Save**
6. Select this environment in top-right dropdown

### Step 3: Get Your Access Token

**Option A: Use Personal Access Token (PAT)**
1. Login to your Zitadel instance
2. Go to your profile → Personal Access Tokens
3. Create new PAT
4. Copy token to `zitadel_token` variable

**Option B: Use Service Account**
1. Run "Get Access Token (OAuth2)" request
2. Token auto-saves to environment

### Step 4: Run First Request
1. Expand "1. Organizations" folder
2. Click "Create Organization"
3. Review the request body (change name if desired)
4. Click **Send**
5. Check response - `org_id` auto-saved to environment!

### Step 5: Continue Learning
Follow the workflows in `ZITADEL_POSTMAN_GUIDE.md`

## 📚 Recommended Learning Path

### Day 1: Basics (1-2 hours)
- [ ] Read the architecture section in `ZITADEL_POSTMAN_GUIDE.md`
- [ ] Import collection and set up environment
- [ ] Authenticate successfully
- [ ] Create your first organization
- [ ] Create your first project (team)

### Day 2: Users & Roles (1-2 hours)
- [ ] Create project roles (developer, admin, viewer)
- [ ] Create 2-3 human users
- [ ] Understand the difference between org roles and project roles
- [ ] Practice user CRUD operations

### Day 3: Grants & Assignments (1-2 hours)
- [ ] Assign users to your project via grants
- [ ] Test different role combinations
- [ ] List users in a project
- [ ] List projects a user belongs to
- [ ] Update and delete grants

### Day 4: Advanced (2-3 hours)
- [ ] Create multiple projects
- [ ] Assign one user to multiple projects
- [ ] Use advanced query endpoints
- [ ] Create organization members
- [ ] Test all update and delete operations

### Day 5: Practice Scenarios (2-3 hours)
- [ ] Complete Exercise 1 in `ZITADEL_QUICK_REFERENCE.md`
- [ ] Complete Exercise 2 in `ZITADEL_QUICK_REFERENCE.md`
- [ ] Complete Exercise 3 in `ZITADEL_QUICK_REFERENCE.md`
- [ ] Design your own scenario

## 🎓 Study Tips

### 1. Use the Postman Console
- Open with: View → Show Postman Console
- See full request/response details
- Debug authentication issues

### 2. Leverage Auto-Variables
The collection automatically saves IDs from responses:
- Creating org → saves `org_id`
- Creating project → saves `project_id`
- Creating user → saves `user_id`

### 3. Cross-Reference with Zitadel Console
- Open your Zitadel web console alongside Postman
- Create entities via API, verify in console
- Understand the UI representation of API operations

### 4. Experiment Safely
- Use a test/dev Zitadel instance
- Don't worry about breaking things
- Practice delete/recreate workflows

### 5. Take Notes
Create a document mapping your understanding:
- Draw your org structure
- Document your test users and their roles
- Note any questions or unclear concepts

## 📖 Documentation Guide

### Quick Reference First
Start with `ZITADEL_QUICK_REFERENCE.md` for:
- Visual diagrams
- Quick start checklist
- API endpoint reference
- Common patterns

### Comprehensive Guide Second
Use `ZITADEL_POSTMAN_GUIDE.md` for:
- Deep architecture understanding
- Detailed workflows
- Production best practices
- Troubleshooting

### Collection Comments
Each request in the collection has:
- **Description**: What the endpoint does
- **Request Body**: Example data
- **Field Explanations**: What each field means

## 🔍 Understanding Key Concepts

### What is a "Grant"?
A grant is the connection between a user, a project, and roles:
```
Grant = User + Project + Roles

Example:
{
  userId: "user-123",
  projectId: "project-456",
  roleKeys: ["developer", "reviewer"]
}

This means: User-123 is a developer AND reviewer in Project-456
```

### Organization vs Project Roles

**Organization Roles** (Org-level permissions):
- `ORG_OWNER`: Manage entire org
- `ORG_USER_MANAGER`: Manage users
- `ORG_PROJECT_CREATOR`: Create projects

**Project Roles** (Team-level permissions):
- You define these yourself
- Examples: developer, admin, viewer, qa-engineer
- Scoped to specific projects

### Global vs Project Roles

**Global Roles**:
- Instance-wide
- Managed at admin level
- Examples: `IAM_OWNER`, `IAM_ADMIN`
- Usually for system administrators

**Project Roles**:
- Scoped to a project
- You create and manage these
- Perfect for team permissions
- Can be different per project

## ❓ FAQ

### Q: Can one user be in multiple teams?
**A:** Yes! Users can have grants to multiple projects. Each grant can have different roles.

### Q: Are roles shared between organizations?
**A:** No. Project roles are scoped to their project. Each organization/project defines its own roles.

### Q: What's the difference between deleting and deactivating a user?
**A:** 
- **Deactivate**: Reversible, user can be reactivated
- **Delete**: Permanent, cannot be undone

### Q: Can I rename a project?
**A:** Yes, use the "Update Project" endpoint to change the name.

### Q: How do I remove a user from a team?
**A:** Delete the grant that links the user to that project.

### Q: Can a user have multiple roles in the same team?
**A:** Yes! When creating a grant, provide an array of role keys: `["developer", "reviewer", "team-lead"]`

## 🛠️ Troubleshooting

### Collection Won't Import
- Ensure you're using Postman desktop app or web (v9+)
- Check JSON file is valid (open in text editor)
- Try drag-and-drop into Postman

### "Unauthorized" Errors
- Verify `zitadel_token` is set in environment
- Check token hasn't expired
- Run "Introspect Token" request to verify

### Variables Not Auto-Setting
- Check response status is 200 or 201
- Look at the "Test" tab in request to see script
- Manually set variable if needed

### "Resource Not Found"
- Ensure you created the parent resource first
- Check `org_id`, `project_id`, `user_id` are set
- Verify you're in correct organization context

## 🔗 Additional Resources

### Official Documentation
- [Zitadel Docs](https://zitadel.com/docs)
- [API Reference](https://zitadel.com/docs/apis/introduction)
- [Console Guide](https://zitadel.com/docs/guides/manage/console)

### Learning Resources
- [Zitadel Blog](https://zitadel.com/blog)
- [Zitadel GitHub](https://github.com/zitadel/zitadel)
- [Community Discord](https://zitadel.com/chat)

### Related Technologies
- OAuth2/OIDC concepts
- Multi-tenancy patterns
- RBAC (Role-Based Access Control)
- Identity & Access Management (IAM)

## 📝 Your Action Items

### Immediate (Today)
- [ ] Import Postman collection
- [ ] Set up environment variables
- [ ] Run your first successful request
- [ ] Read the Quick Reference guide

### This Week
- [ ] Complete Day 1-3 of learning path
- [ ] Create a test organization structure
- [ ] Practice CRUD operations on all entities
- [ ] Document your understanding

### This Month
- [ ] Complete all learning exercises
- [ ] Design your actual multi-tenant structure
- [ ] Test complex scenarios
- [ ] Plan integration with your application

## 🎉 Success Criteria

You'll know you've mastered Zitadel CRUD when you can:
- ✅ Explain the relationship between orgs, projects, users, and roles
- ✅ Create a complete org structure via API
- ✅ Assign users to multiple teams with different roles
- ✅ Query relationships (find users in team, find teams for user)
- ✅ Update and remove grants confidently
- ✅ Troubleshoot common API errors
- ✅ Design a multi-tenant architecture for your product

## 🙏 Important Note

These materials are created for **educational purposes** to help you learn Zitadel APIs. 

**Per your request:** No changes have been made to your application code. This is purely study material that you can use independently.

When you're ready to integrate Zitadel into your application:
1. Review `ZITADEL_INTEGRATION.md` for existing integration
2. Use the knowledge from this collection
3. Implement authentication flows in your Angular app
4. Set up proper RBAC based on your learned structure

## 📞 Support

If you have questions while studying:
1. Check the troubleshooting sections in the guides
2. Review Zitadel official documentation
3. Search Zitadel GitHub issues
4. Ask in Zitadel community Discord
5. Open an issue in Zitadel repository

## ✨ Next Steps

1. **Import the collection** into Postman
2. **Read `ZITADEL_QUICK_REFERENCE.md`** for quick start
3. **Follow the learning path** day by day
4. **Practice with real scenarios** from your product needs
5. **Document your architecture** design
6. **Share your learnings** with your team

---

**Happy Learning! 🚀**

You now have everything you need to master Zitadel CRUD operations for your multi-tenant product.

Study at your own pace, experiment freely, and build with confidence!
