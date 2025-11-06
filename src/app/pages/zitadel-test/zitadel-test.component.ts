import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Organization {
  id: string;
  name: string;
  displayName: string;
  primaryDomain: string;
}

interface User {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  roleIds: string[];
  teamId?: string;
  isActive: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
}

interface Project {
  id: string;
  name: string;
  organizationId: string;
  roleIds: string[];
}

interface Team {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  leaderId?: string;
  memberIds: string[];
}

@Component({
  selector: 'app-zitadel-test',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './zitadel-test.component.html',
  styleUrls: ['./zitadel-test.component.scss']
})
export class ZitadelTestComponent implements OnInit {
  // Hardcoded API URL for testing
  private readonly API_URL = 'http://localhost:4000/api';

  // Active tab
  activeTab: 'organizations' | 'users' | 'roles' | 'projects' | 'teams' = 'organizations';

  // Data arrays
  organizations: Organization[] = [];
  users: User[] = [];
  roles: Role[] = [];
  projects: Project[] = [];
  teams: Team[] = [];

  // Form models
  newOrg = { name: '', displayName: '', primaryDomain: '' };
  newUser = { userName: '', email: '', firstName: '', lastName: '', organizationId: '', password: 'TempPassword123!', roleIds: ['sales-executive'], teamId: '' };
  newProject = { name: '', organizationId: '', roleIds: [] as string[] };
  newTeam = { name: '', description: '', organizationId: '', leaderId: '' };
  
  // Edit models
  editingOrg: Organization | null = null;
  editingUser: User | null = null;
  editingProject: Project | null = null;
  editingTeam: Team | null = null;

  // Status message
  statusMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAll();
  }

  setActiveTab(tab: 'organizations' | 'users' | 'roles' | 'projects' | 'teams') {
    this.activeTab = tab;
    this.clearMessages();
  }

  clearMessages() {
    this.statusMessage = '';
    this.errorMessage = '';
  }

  showStatus(message: string) {
    this.statusMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.statusMessage = '', 3000);
  }

  showError(message: string) {
    this.errorMessage = message;
    this.statusMessage = '';
  }

  // Load all data
  loadAll() {
    this.loadOrganizations();
    this.loadUsers();
    this.loadRoles();
    this.loadProjects();
    this.loadTeams();
  }

  // ========== ORGANIZATIONS ==========
  loadOrganizations() {
    this.http.get<any>(`${this.API_URL}/organizations`).subscribe({
      next: (response) => {
        if (response.success) {
          this.organizations = response.data;
          this.showStatus(`Loaded ${this.organizations.length} organizations`);
        }
      },
      error: (error) => this.showError(`Failed to load organizations: ${error.message}`)
    });
  }

  createOrganization() {
    if (!this.newOrg.name) {
      this.showError('Organization name is required');
      return;
    }

    this.http.post<any>(`${this.API_URL}/organizations`, this.newOrg).subscribe({
      next: (response) => {
        if (response.success) {
          this.organizations.push(response.data);
          this.newOrg = { name: '', displayName: '', primaryDomain: '' };
          this.showStatus('Organization created successfully');
        }
      },
      error: (error) => this.showError(`Failed to create organization: ${error.error?.error || error.message}`)
    });
  }

  editOrganization(org: Organization) {
    this.editingOrg = { ...org };
  }

  updateOrganization() {
    if (!this.editingOrg) return;

    this.http.put<any>(`${this.API_URL}/organizations/${this.editingOrg.id}`, this.editingOrg).subscribe({
      next: (response) => {
        if (response.success) {
          const index = this.organizations.findIndex(o => o.id === this.editingOrg!.id);
          if (index !== -1) {
            this.organizations[index] = response.data;
          }
          this.editingOrg = null;
          this.showStatus('Organization updated successfully');
        }
      },
      error: (error) => this.showError(`Failed to update organization: ${error.error?.error || error.message}`)
    });
  }

  deleteOrganization(id: string) {
    if (!confirm('Are you sure you want to delete this organization?')) return;

    this.http.delete<any>(`${this.API_URL}/organizations/${id}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.organizations = this.organizations.filter(o => o.id !== id);
          this.showStatus('Organization deleted successfully');
        }
      },
      error: (error) => this.showError(`Failed to delete organization: ${error.error?.error || error.message}`)
    });
  }

  // ========== USERS ==========
  loadUsers() {
    this.http.get<any>(`${this.API_URL}/users`).subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data;
          this.showStatus(`Loaded ${this.users.length} users`);
        }
      },
      error: (error) => this.showError(`Failed to load users: ${error.message}`)
    });
  }

  createUser() {
    if (!this.newUser.userName || !this.newUser.email || !this.newUser.firstName || !this.newUser.lastName || !this.newUser.organizationId) {
      this.showError('All user fields are required');
      return;
    }

    this.http.post<any>(`${this.API_URL}/users`, this.newUser).subscribe({
      next: (response) => {
        if (response.success) {
          this.users.push(response.data);
          this.newUser = { userName: '', email: '', firstName: '', lastName: '', organizationId: '', password: 'TempPassword123!', roleIds: ['sales-executive'], teamId: '' };
          this.showStatus('User created successfully');
        }
      },
      error: (error) => this.showError(`Failed to create user: ${error.error?.error || error.message}`)
    });
  }

  editUser(user: User) {
    this.editingUser = { ...user };
  }

  updateUser() {
    if (!this.editingUser) return;

    this.http.put<any>(`${this.API_URL}/users/${this.editingUser.id}`, this.editingUser).subscribe({
      next: (response) => {
        if (response.success) {
          const index = this.users.findIndex(u => u.id === this.editingUser!.id);
          if (index !== -1) {
            this.users[index] = response.data;
          }
          this.editingUser = null;
          this.showStatus('User updated successfully');
        }
      },
      error: (error) => this.showError(`Failed to update user: ${error.error?.error || error.message}`)
    });
  }

  deleteUser(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.http.delete<any>(`${this.API_URL}/users/${id}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.users = this.users.filter(u => u.id !== id);
          this.showStatus('User deleted successfully');
        }
      },
      error: (error) => this.showError(`Failed to delete user: ${error.error?.error || error.message}`)
    });
  }

  // ========== ROLES ==========
  loadRoles() {
    this.http.get<any>(`${this.API_URL}/roles?isSystemRole=true`).subscribe({
      next: (response) => {
        if (response.success) {
          this.roles = response.data;
          this.showStatus(`Loaded ${this.roles.length} roles`);
        }
      },
      error: (error) => this.showError(`Failed to load roles: ${error.message}`)
    });
  }

  // ========== PROJECTS ==========
  loadProjects() {
    this.http.get<any>(`${this.API_URL}/projects`).subscribe({
      next: (response) => {
        if (response.success) {
          this.projects = response.data;
          this.showStatus(`Loaded ${this.projects.length} projects`);
        }
      },
      error: (error) => this.showError(`Failed to load projects: ${error.message}`)
    });
  }

  createProject() {
    if (!this.newProject.name || !this.newProject.organizationId) {
      this.showError('Project name and organization are required');
      return;
    }

    this.http.post<any>(`${this.API_URL}/projects`, this.newProject).subscribe({
      next: (response) => {
        if (response.success) {
          this.projects.push(response.data);
          this.newProject = { name: '', organizationId: '', roleIds: [] };
          this.showStatus('Project created successfully');
        }
      },
      error: (error) => this.showError(`Failed to create project: ${error.error?.error || error.message}`)
    });
  }

  editProject(project: Project) {
    this.editingProject = { ...project };
  }

  updateProject() {
    if (!this.editingProject) return;

    this.http.put<any>(`${this.API_URL}/projects/${this.editingProject.id}`, this.editingProject).subscribe({
      next: (response) => {
        if (response.success) {
          const index = this.projects.findIndex(p => p.id === this.editingProject!.id);
          if (index !== -1) {
            this.projects[index] = response.data;
          }
          this.editingProject = null;
          this.showStatus('Project updated successfully');
        }
      },
      error: (error) => this.showError(`Failed to update project: ${error.error?.error || error.message}`)
    });
  }

  deleteProject(id: string) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    this.http.delete<any>(`${this.API_URL}/projects/${id}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.projects = this.projects.filter(p => p.id !== id);
          this.showStatus('Project deleted successfully');
        }
      },
      error: (error) => this.showError(`Failed to delete project: ${error.error?.error || error.message}`)
    });
  }

  // ========== TEAMS ==========
  loadTeams() {
    this.http.get<any>(`${this.API_URL}/teams`).subscribe({
      next: (response) => {
        if (response.success) {
          this.teams = response.data;
          this.showStatus(`Loaded ${this.teams.length} teams`);
        }
      },
      error: (error) => this.showError(`Failed to load teams: ${error.message}`)
    });
  }

  createTeam() {
    if (!this.newTeam.name || !this.newTeam.organizationId) {
      this.showError('Team name and organization are required');
      return;
    }

    this.http.post<any>(`${this.API_URL}/teams`, this.newTeam).subscribe({
      next: (response) => {
        if (response.success) {
          this.teams.push(response.data);
          this.newTeam = { name: '', description: '', organizationId: '', leaderId: '' };
          this.showStatus('Team created successfully');
        }
      },
      error: (error) => this.showError(`Failed to create team: ${error.error?.error || error.message}`)
    });
  }

  editTeam(team: Team) {
    this.editingTeam = { ...team };
  }

  updateTeam() {
    if (!this.editingTeam) return;

    this.http.put<any>(`${this.API_URL}/teams/${this.editingTeam.id}`, this.editingTeam).subscribe({
      next: (response) => {
        if (response.success) {
          const index = this.teams.findIndex(t => t.id === this.editingTeam!.id);
          if (index !== -1) {
            this.teams[index] = response.data;
          }
          this.editingTeam = null;
          this.showStatus('Team updated successfully');
        }
      },
      error: (error) => this.showError(`Failed to update team: ${error.error?.error || error.message}`)
    });
  }

  deleteTeam(id: string) {
    if (!confirm('Are you sure you want to delete this team?')) return;

    this.http.delete<any>(`${this.API_URL}/teams/${id}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.teams = this.teams.filter(t => t.id !== id);
          this.showStatus('Team deleted successfully');
        }
      },
      error: (error) => this.showError(`Failed to delete team: ${error.error?.error || error.message}`)
    });
  }

  addTeamMember(teamId: string, userId: string) {
    if (!userId) {
      this.showError('Please select a user');
      return;
    }

    this.http.post<any>(`${this.API_URL}/teams/${teamId}/members`, { userId }).subscribe({
      next: (response) => {
        if (response.success) {
          const index = this.teams.findIndex(t => t.id === teamId);
          if (index !== -1) {
            this.teams[index] = response.data;
          }
          this.showStatus('Member added to team');
        }
      },
      error: (error) => this.showError(`Failed to add member: ${error.error?.error || error.message}`)
    });
  }

  removeTeamMember(teamId: string, userId: string) {
    this.http.delete<any>(`${this.API_URL}/teams/${teamId}/members/${userId}`).subscribe({
      next: (response) => {
        if (response.success) {
          const index = this.teams.findIndex(t => t.id === teamId);
          if (index !== -1) {
            this.teams[index] = response.data;
          }
          this.showStatus('Member removed from team');
        }
      },
      error: (error) => this.showError(`Failed to remove member: ${error.error?.error || error.message}`)
    });
  }

  getUserName(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : userId;
  }

  getOrganizationName(orgId: string): string {
    const org = this.organizations.find(o => o.id === orgId);
    return org ? org.displayName || org.name : orgId;
  }
}
