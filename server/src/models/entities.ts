/**
 * Organization entity
 * Represents a Zitadel organization
 */
export interface Organization {
  id: string;
  name: string;
  displayName: string;
  primaryDomain: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Role entity
 * Represents a common role shared across all organizations
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean; // true for roles common to all orgs
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User entity
 * Represents a user within an organization
 * Relationship: Organization (1) -> Users (n)
 */
export interface User {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  organizationId: string; // Foreign key to Organization
  roleIds: string[]; // Array of role IDs assigned to the user
  teamId?: string; // Optional foreign key to Team
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Team entity
 * Represents a team within an organization
 * Relationship: Organization (1) -> Teams (n)
 */
export interface Team {
  id: string;
  name: string;
  description: string;
  organizationId: string; // Foreign key to Organization
  leaderId?: string; // Optional foreign key to User
  memberIds: string[]; // Array of user IDs in the team
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project entity
 * Represents a Zitadel project
 */
export interface Project {
  id: string;
  name: string;
  organizationId: string; // Foreign key to Organization
  roleIds: string[]; // Array of role IDs available in this project
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create/Update DTOs
 */
export interface CreateOrganizationDto {
  name: string;
  displayName?: string;
  primaryDomain?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  displayName?: string;
  primaryDomain?: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions?: string[];
  isSystemRole?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface CreateUserDto {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  roleIds?: string[];
  teamId?: string;
  password?: string;
}

export interface UpdateUserDto {
  userName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roleIds?: string[];
  teamId?: string;
  isActive?: boolean;
}

export interface CreateTeamDto {
  name: string;
  description?: string;
  organizationId: string;
  leaderId?: string;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
  leaderId?: string;
  memberIds?: string[];
}

export interface CreateProjectDto {
  name: string;
  organizationId: string;
  roleIds?: string[];
}

export interface UpdateProjectDto {
  name?: string;
  roleIds?: string[];
}
