import { LoadRemoteModuleScriptOptions } from "@angular-architects/module-federation";

/**
 * User roles in descending order of privilege
 * Duplicated here to avoid circular dependency and eager module consumption
 */
export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  ORG_ADMIN = 'org-admin',
  ORG_LEAD = 'org-lead',
  SALES_EXECUTIVE = 'sales-executive'
}

/**
 * MFE configuration with metadata
 * Duplicated here to avoid circular dependency and eager module consumption
 */
export interface MfeConfig {
  id: string;
  name: string;
  displayName: string;
  remoteName: string;
  exposedModule: string;
  url: string;
  route: string;
  allowedRoles: UserRole[];
  priority: number; // Higher number = higher priority (load first)
  icon?: string;
  showAiAssistant?: boolean; // When false, hides the AI assistant widget on this route (default: true)
}

/**
 * Interface for MFE URL configuration
 * Extends LoadRemoteModuleScriptOptions to support Module Federation
 */
export interface InterfaceMfeUrl extends LoadRemoteModuleScriptOptions{
    remoteName: string;
    exposedModule: string;
    url: string;
}

/**
 * MFE configurations with role-based access and priority loading
 * Priority: Higher number = higher priority (loaded first)
 * - 10: Critical (load immediately)
 * - 5-9: High (preload on login)
 * - 1-4: Normal (load on demand)
 */
export const MFE_CONFIGS: MfeConfig[] = [
    {
        id: 'mfe-crud-rules',
        name: 'crud-rules',
        displayName: 'Manage Incentive Rules',
        remoteName: 'crudRules',
        exposedModule: './Component',
        url: 'https://opensourcekd.github.io/all-mfe-builds/mfe-CRUD_RULES/remoteEntry.js',
        route: 'rules',
        allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_LEAD],
        priority: 8,
        icon: 'settings'
    },
    {
        id: 'mfe-my-sales',
        name: 'my-sales',
        displayName: 'My Sales History',
        remoteName: 'mySales',
        exposedModule: './Component',
        url: 'https://opensourcekd.github.io/all-mfe-builds/mfe-MY_SALES/remoteEntry.js',
        route: 'sales',
        allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_LEAD, UserRole.SALES_EXECUTIVE],
        priority: 7,
        icon: 'list'
    },
    {
        id: 'mfe-my-report',
        name: 'my-report',
        displayName: 'My Incentive Reports',
        remoteName: 'myReport',
        exposedModule: './Component',
        url: 'https://opensourcekd.github.io/all-mfe-builds/mfe-MY_REPORT/remoteEntry.js',
        route: 'reports',
        allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_LEAD, UserRole.SALES_EXECUTIVE],
        priority: 6,
        icon: 'chart'
    },
    {
        id: 'mfe-users-crud',
        name: 'users-crud',
        displayName: 'User Management',
        remoteName: 'usersCrud',
        exposedModule: './Component',
        url: 'https://opensourcekd.github.io/all-mfe-builds/mfe-USERS_CRUD/remoteEntry.js',
        route: 'users',
        allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN],
        priority: 7,
        icon: 'users'
    },
    {
        id: 'mfe-ai-analytics',
        name: 'ai-analytics',
        displayName: 'AI Analytics',
        remoteName: 'aiAnalytics',
        exposedModule: './Component',
        url: '',
        route: 'ai-analytics',
        allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_LEAD, UserRole.SALES_EXECUTIVE],
        priority: 1,
        icon: 'analytics'
    }
];

/**
 * Extended token payload including the org_and_roles custom claim.
 * Structure: { "hdfc": ["super-admin", "org-admin"], ... }
 * Single shared definition — import this instead of declaring locally (DRY).
 * The index signature matches TokenPayload for structural compatibility.
 */
export interface OrgRolesTokenPayload {
  org_and_roles?: Record<string, string[]>;
  [key: string]: unknown;
}

/**
 * Pure function: extracts a flat list of all roles a user holds across all orgs.
 * Takes the decoded token as input; returns an empty array when no roles are present.
 */
export function extractUserRoles(token: OrgRolesTokenPayload | null): string[] {
  return token?.org_and_roles ? Object.values(token.org_and_roles).flat() : [];
}

/**
 * Pure function: returns MFE configs accessible to a user given their flat role list,
 * sorted by priority descending (highest first).
 */
export function filterMfesByRoles(userRoles: string[]): MfeConfig[] {
  return MFE_CONFIGS
    .filter(mfe => mfe.allowedRoles.some(role => userRoles.includes(role)))
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Pure function: returns the highest-priority route the user can access (prefixed with '/'),
 * or null when no accessible routes exist.
 */
export function getHighestPriorityRoute(userRoles: string[]): string | null {
  const [top] = filterMfesByRoles(userRoles);
  return top ? `/${top.route}` : null;
}

/**
 * Roles that grant access to the AI assistant (org-lead and above).
 * Sales executives do not have access to the AI assistant panel.
 */
export const AI_ASSISTANT_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ORG_ADMIN,
  UserRole.ORG_LEAD,
];

/**
 * Pure function: returns true when the user holds at least one role that
 * grants access to the AI assistant (org-lead and above).
 */
export function hasAiAssistantAccess(userRoles: string[]): boolean {
  const roleSet = new Set(userRoles);
  return AI_ASSISTANT_ROLES.some(role => roleSet.has(role));
}

/**
 * MFE array for Module Federation configuration
 * Contains all MFE configurations as InterfaceMfeUrl type
 */
const MFE: Array<InterfaceMfeUrl> = MFE_CONFIGS.map(config => ({
    remoteName: config.remoteName,
    exposedModule: config.exposedModule,
    url: config.url
}));

export default MFE