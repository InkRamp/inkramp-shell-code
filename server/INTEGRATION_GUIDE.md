# Backend Integration Guide

This guide explains how to integrate the i17e backend API with the Angular frontend application.

## Overview

The backend provides RESTful CRUD APIs for managing:
- **Organizations** - Zitadel organizations
- **Users** - Users within organizations
- **Roles** - System-wide and project-specific roles
- **Projects** - Zitadel projects
- **Teams** - Teams within organizations (stored locally)

## Relationships

```
Organization (1) ──→ (n) Users
Organization (1) ──→ (n) Teams
Team (1) ──→ (n) Users
Project (1) ──→ (n) Roles
System Roles (Common to all organizations)
```

## Prerequisites

1. Backend server running on `http://localhost:4000`
2. Angular frontend application
3. Zitadel credentials (optional - works in mock mode without credentials)

## Quick Start

### 1. Start the Backend Server

```bash
# Navigate to server directory
cd server

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

The server will start on `http://localhost:4000` and display:
```
🚀 i17e Backend API Server
📡 Server running on port 4000
🔗 API URL: http://localhost:4000
```

### 2. Verify Backend is Running

```bash
# Health check
curl http://localhost:4000/health

# Get system roles
curl http://localhost:4000/api/roles?isSystemRole=true
```

## Frontend Integration

### Step 1: Update API Configuration

The frontend authentication service already points to the backend. Verify the configuration:

**File: `src/app/services/authentication.service.ts`**

```typescript
// This should already be configured
const API_URL = 'http://localhost:4000';

login() {
  window.location.href = `${API_URL}/auth/login`;
}

getUserProfile(): Observable<UserProfile | null> {
  return this.http.get<UserProfile | null>(`${API_URL}/auth/me`, { 
    withCredentials: true 
  });
}
```

### Step 2: Create API Services

Create services in your Angular app to interact with the backend.

**File: `src/app/services/organization.service.ts`**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Organization {
  id: string;
  name: string;
  displayName: string;
  primaryDomain: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiUrl = 'http://localhost:4000/api/organizations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ success: boolean; data: Organization[]; total: number }> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: string): Observable<{ success: boolean; data: Organization }> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(org: Partial<Organization>): Observable<{ success: boolean; data: Organization }> {
    return this.http.post<any>(this.apiUrl, org);
  }

  update(id: string, org: Partial<Organization>): Observable<{ success: boolean; data: Organization }> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, org);
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
```

**File: `src/app/services/user-management.service.ts`**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserEntity {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  organizationId: string;
  roleIds: string[];
  teamId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = 'http://localhost:4000/api/users';

  constructor(private http: HttpClient) {}

  getAll(organizationId?: string): Observable<{ success: boolean; data: UserEntity[]; total: number }> {
    let params = new HttpParams();
    if (organizationId) {
      params = params.set('organizationId', organizationId);
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: string): Observable<{ success: boolean; data: UserEntity }> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getByTeam(teamId: string): Observable<{ success: boolean; data: UserEntity[] }> {
    return this.http.get<any>(`${this.apiUrl}/team/${teamId}`);
  }

  create(user: Partial<UserEntity> & { password?: string }): Observable<{ success: boolean; data: UserEntity }> {
    return this.http.post<any>(this.apiUrl, user);
  }

  update(id: string, user: Partial<UserEntity>): Observable<{ success: boolean; data: UserEntity }> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, user);
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
```

**File: `src/app/services/team.service.ts`**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Team {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  leaderId?: string;
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = 'http://localhost:4000/api/teams';

  constructor(private http: HttpClient) {}

  getAll(organizationId?: string): Observable<{ success: boolean; data: Team[]; total: number }> {
    let params = new HttpParams();
    if (organizationId) {
      params = params.set('organizationId', organizationId);
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: string): Observable<{ success: boolean; data: Team }> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(team: Partial<Team>): Observable<{ success: boolean; data: Team }> {
    return this.http.post<any>(this.apiUrl, team);
  }

  update(id: string, team: Partial<Team>): Observable<{ success: boolean; data: Team }> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, team);
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  addMember(teamId: string, userId: string): Observable<{ success: boolean; data: Team }> {
    return this.http.post<any>(`${this.apiUrl}/${teamId}/members`, { userId });
  }

  removeMember(teamId: string, userId: string): Observable<{ success: boolean; data: Team }> {
    return this.http.delete<any>(`${this.apiUrl}/${teamId}/members/${userId}`);
  }
}
```

**File: `src/app/services/role-management.service.ts`**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RoleEntity {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RoleManagementService {
  private apiUrl = 'http://localhost:4000/api/roles';

  constructor(private http: HttpClient) {}

  getAll(projectId?: string, isSystemRole?: boolean): Observable<{ success: boolean; data: RoleEntity[]; total: number }> {
    let params = new HttpParams();
    if (projectId) {
      params = params.set('projectId', projectId);
    }
    if (isSystemRole !== undefined) {
      params = params.set('isSystemRole', isSystemRole.toString());
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  getSystemRoles(): Observable<{ success: boolean; data: RoleEntity[]; total: number }> {
    return this.getAll(undefined, true);
  }

  getById(id: string, projectId?: string): Observable<{ success: boolean; data: RoleEntity }> {
    let params = new HttpParams();
    if (projectId) {
      params = params.set('projectId', projectId);
    }
    return this.http.get<any>(`${this.apiUrl}/${id}`, { params });
  }

  create(role: Partial<RoleEntity>, projectId: string): Observable<{ success: boolean; data: RoleEntity }> {
    const params = new HttpParams().set('projectId', projectId);
    return this.http.post<any>(this.apiUrl, role, { params });
  }

  update(id: string, role: Partial<RoleEntity>, projectId: string): Observable<{ success: boolean; data: RoleEntity }> {
    const params = new HttpParams().set('projectId', projectId);
    return this.http.put<any>(`${this.apiUrl}/${id}`, role, { params });
  }

  delete(id: string, projectId: string): Observable<{ success: boolean; message: string }> {
    const params = new HttpParams().set('projectId', projectId);
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { params });
  }
}
```

### Step 3: Use Services in Components

**Example: Organization Management Component**

```typescript
import { Component, OnInit } from '@angular/core';
import { OrganizationService, Organization } from '../services/organization.service';

@Component({
  selector: 'app-organization-list',
  template: `
    <div class="organization-list">
      <h2>Organizations</h2>
      <button (click)="loadOrganizations()">Refresh</button>
      
      <div *ngFor="let org of organizations" class="org-card">
        <h3>{{ org.displayName }}</h3>
        <p>{{ org.name }}</p>
        <p>Domain: {{ org.primaryDomain }}</p>
      </div>
    </div>
  `
})
export class OrganizationListComponent implements OnInit {
  organizations: Organization[] = [];

  constructor(private orgService: OrganizationService) {}

  ngOnInit() {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.orgService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.organizations = response.data;
        }
      },
      error: (error) => {
        console.error('Failed to load organizations:', error);
      }
    });
  }
}
```

**Example: Team Management Component**

```typescript
import { Component, OnInit } from '@angular/core';
import { TeamService, Team } from '../services/team.service';

@Component({
  selector: 'app-team-management',
  template: `
    <div class="team-management">
      <h2>Teams</h2>
      
      <div class="create-team">
        <input [(ngModel)]="newTeam.name" placeholder="Team Name">
        <input [(ngModel)]="newTeam.description" placeholder="Description">
        <button (click)="createTeam()">Create Team</button>
      </div>
      
      <div *ngFor="let team of teams" class="team-card">
        <h3>{{ team.name }}</h3>
        <p>{{ team.description }}</p>
        <p>Members: {{ team.memberIds.length }}</p>
        <button (click)="deleteTeam(team.id)">Delete</button>
      </div>
    </div>
  `
})
export class TeamManagementComponent implements OnInit {
  teams: Team[] = [];
  newTeam: Partial<Team> = {};

  constructor(private teamService: TeamService) {}

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.teamService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.teams = response.data;
        }
      },
      error: (error) => {
        console.error('Failed to load teams:', error);
      }
    });
  }

  createTeam() {
    if (!this.newTeam.name) {
      alert('Team name is required');
      return;
    }

    this.newTeam.organizationId = 'org-123'; // Get from current user context
    
    this.teamService.create(this.newTeam).subscribe({
      next: (response) => {
        if (response.success) {
          this.teams.push(response.data);
          this.newTeam = {};
        }
      },
      error: (error) => {
        console.error('Failed to create team:', error);
      }
    });
  }

  deleteTeam(id: string) {
    this.teamService.delete(id).subscribe({
      next: () => {
        this.teams = this.teams.filter(t => t.id !== id);
      },
      error: (error) => {
        console.error('Failed to delete team:', error);
      }
    });
  }
}
```

## Common Use Cases

### 1. Loading Users for an Organization

```typescript
// In your component
loadOrgUsers(orgId: string) {
  this.userService.getAll(orgId).subscribe(response => {
    if (response.success) {
      this.users = response.data;
    }
  });
}
```

### 2. Assigning Roles to Users

```typescript
assignRole(userId: string, roleId: string) {
  this.userService.getById(userId).subscribe(response => {
    if (response.success) {
      const user = response.data;
      const updatedRoles = [...user.roleIds, roleId];
      
      this.userService.update(userId, { roleIds: updatedRoles }).subscribe(
        updateResponse => {
          console.log('Role assigned successfully');
        }
      );
    }
  });
}
```

### 3. Managing Team Members

```typescript
addUserToTeam(teamId: string, userId: string) {
  this.teamService.addMember(teamId, userId).subscribe(response => {
    if (response.success) {
      console.log('User added to team');
      
      // Also update user's teamId
      this.userService.update(userId, { teamId }).subscribe();
    }
  });
}

removeUserFromTeam(teamId: string, userId: string) {
  this.teamService.removeMember(teamId, userId).subscribe(response => {
    if (response.success) {
      console.log('User removed from team');
      
      // Also clear user's teamId
      this.userService.update(userId, { teamId: undefined }).subscribe();
    }
  });
}
```

### 4. Getting System Roles

```typescript
loadSystemRoles() {
  this.roleService.getSystemRoles().subscribe(response => {
    if (response.success) {
      this.systemRoles = response.data;
      // systemRoles will contain: SUPER_ADMIN, ORG_ADMIN, TEAM_LEAD, SALES_EXECUTIVE
    }
  });
}
```

## Error Handling

All API responses follow a consistent format:

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

Handle errors consistently:

```typescript
this.organizationService.create(newOrg).subscribe({
  next: (response) => {
    if (response.success) {
      // Success handling
      this.organizations.push(response.data);
    } else {
      // API-level error
      this.showError(response.error);
    }
  },
  error: (httpError) => {
    // HTTP-level error
    this.showError(httpError.error?.error || 'Network error');
  }
});
```

## CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:4200` (Angular dev server)
- `http://127.0.0.1:8080` (Static file server)
- `https://opensourcekd.github.io` (Production)

If you need to add more origins, update `server/src/index.ts`:

```typescript
app.use(cors({
  origin: ['http://localhost:4200', 'http://your-domain.com'],
  credentials: true,
}));
```

## Environment Configuration

For production, update the API URLs using Angular environment files:

**File: `src/environments/environment.ts`**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000'
};
```

**File: `src/environments/environment.prod.ts`**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com'
};
```

Then use in services:
```typescript
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private apiUrl = `${environment.apiUrl}/api/organizations`;
  // ...
}
```

## Testing the Integration

1. Start the backend server: `cd server && npm run dev`
2. Start the Angular app: `ng serve`
3. Open browser to `http://localhost:4200`
4. Open browser console to see API requests/responses
5. Test CRUD operations through your UI

## Troubleshooting

### CORS Errors
- Ensure backend is running
- Check CORS configuration includes your frontend URL
- Verify requests include proper headers

### 404 Not Found
- Verify backend endpoint exists (check `http://localhost:4000/`)
- Check the URL path is correct
- Ensure backend server is running

### Connection Refused
- Backend server not running - start with `npm run dev`
- Wrong port - verify backend is on port 4000

### Zitadel Integration Errors
- Backend works in mock mode without Zitadel credentials
- For full Zitadel integration, configure `.env` file with credentials
- Check Zitadel console for API permissions

## Next Steps

1. **Add Authentication Middleware**: Protect API endpoints
2. **Add Validation**: Validate request bodies
3. **Add Pagination**: For large datasets
4. **Add Caching**: Redis or in-memory caching
5. **Add Rate Limiting**: Prevent abuse
6. **Add Logging**: Structured logging with Winston
7. **Add Testing**: Unit and integration tests

## Support

For issues or questions:
1. Check backend logs in terminal
2. Check browser console for frontend errors
3. Verify API responses with `curl` or Postman
4. Review the [API Documentation](./API_DOCUMENTATION.md)
