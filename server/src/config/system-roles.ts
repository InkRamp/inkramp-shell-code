import { Role } from '../models/entities';

/**
 * System-wide roles common to all organizations
 * These roles are predefined and cannot be modified via the API
 */
export const SYSTEM_ROLES: Role[] = [
  {
    id: 'super-admin',
    name: 'SUPER_ADMIN',
    description: 'Super administrator with full access',
    permissions: ['*'],
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'org-admin',
    name: 'ORG_ADMIN',
    description: 'Organization administrator',
    permissions: ['org:*', 'team:*', 'user:*'],
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'team-lead',
    name: 'TEAM_LEAD',
    description: 'Team leader with team management access',
    permissions: ['team:read', 'team:update', 'user:read'],
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sales-executive',
    name: 'SALES_EXECUTIVE',
    description: 'Sales executive with basic access',
    permissions: ['sales:read', 'sales:write'],
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Get system role by ID
 */
export function getSystemRoleById(roleId: string): Role | undefined {
  return SYSTEM_ROLES.find(role => role.id === roleId);
}

/**
 * Check if a role ID corresponds to a system role
 */
export function isSystemRoleId(roleId: string): boolean {
  return SYSTEM_ROLES.some(role => role.id === roleId);
}
