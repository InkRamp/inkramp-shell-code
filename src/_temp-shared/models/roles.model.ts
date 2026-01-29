/**
 * User roles in descending order of privilege
 */
export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  ORG_ADMIN = 'org-admin',
  TEAM_LEAD = 'team-lead',
  SALES_EXECUTIVE = 'sales-executive'
}

/**
 * User information including role
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId?: string;
  managerId?: string;
}

/**
 * Helper function to check if a role has required privilege
 * @param userRole Current user's role
 * @param requiredRole Minimum required role
 * @returns true if user has sufficient privilege
 */
export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    [UserRole.SUPER_ADMIN]: 4,
    [UserRole.ORG_ADMIN]: 3,
    [UserRole.TEAM_LEAD]: 2,
    [UserRole.SALES_EXECUTIVE]: 1
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
