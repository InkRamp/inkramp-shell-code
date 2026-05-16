import { LoadRemoteModuleScriptOptions } from "@angular-architects/module-federation";

export enum UserRole {
  ADMIN = 'admin',
  BUYER = 'buyer',
  SUPPLIER = 'supplier'
}

export interface MfeConfig {
  displayName: string;
  remoteName: string;
  exposedModule: string;
  url: string;
  route: string;
  role: UserRole;
  showAiAssistant?: boolean; // When false, hides the AI assistant widget on this route (default: true)
}

export type MfeRemoteConfig = LoadRemoteModuleScriptOptions & {
  remoteName: string;
  exposedModule: string;
  url: string;
};

export const MFE_CONFIGS: MfeConfig[] = [
    {
        displayName: 'Buy Products',
        remoteName: 'buyer',
        exposedModule: './Component',
        url: 'https://inkramp.github.io/all-mfe-builds/inkramp-mfe-buyer/remoteEntry.js',
        route: 'buyer',
        role: UserRole.BUYER
    },
    {
        displayName: 'Suppliers',
        remoteName: 'supplier',
        exposedModule: './Component',
        url: 'https://inkramp.github.io/all-mfe-builds/inkramp-mfe-supplier/remoteEntry.js',
        route: 'supplier',
        role: UserRole.SUPPLIER
    },
    {
        displayName: 'Admin',
        remoteName: 'admin',
        exposedModule: './Component',
        url: 'https://inkramp.github.io/all-mfe-builds/inkramp-mfe-admin/remoteEntry.js',
        route: 'admin',
        role: UserRole.ADMIN
    },
];

export interface OrgRolesTokenPayload {
  org_and_roles?: Record<string, string[]>;
  [key: string]: unknown;
}

export function extractUserRoles(token: OrgRolesTokenPayload | null): string[] {
  if (!token?.org_and_roles) {
    return [];
  }
  return Array.from(
    new Set(
      Object.values(token.org_and_roles)
        .flat()
        .map(role => role.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

/**
 * Reads the active user role from sessionStorage.
 * Returns the normalized lowercase role string, or null when absent.
 */
export function getSessionRole(): string | null {
  const role = sessionStorage.getItem('role');
  return role ? role.trim().toLowerCase() : null;
}

/**
 * Pure function that returns only MFEs mapped to the provided role.
 * Returns an empty array when no role is available.
 */
export function filterMfesByRole(role: string | null): MfeConfig[] {
  return filterMfesByRoles(role ? [role] : []);
}

/**
 * Pure function that returns MFEs mapped to any provided role.
 * Returns an empty array when no roles are available.
 */
export function filterMfesByRoles(roles: string[]): MfeConfig[] {
  if (!roles.length) {
    return [];
  }
  const roleSet = new Set(roles.map(role => role.trim().toLowerCase()));
  return MFE_CONFIGS.filter(mfe => roleSet.has(mfe.role));
}

/**
 * Returns the first route path available for the provided role.
 * Route is prefixed with '/', or null when no MFE matches.
 */
export function getFirstAvailableRoute(role: string | null): string | null {
  const firstMfe = filterMfesByRole(role)[0];
  return firstMfe ? `/${firstMfe.route}` : null;
}

export const AI_ASSISTANT_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.BUYER,
  UserRole.SUPPLIER,
];

export function hasAiAssistantAccess(userRoles: string[]): boolean {
  const roleSet = new Set(userRoles);
  return AI_ASSISTANT_ROLES.some(role => roleSet.has(role));
}

/**
 * Finds an MFE by remote name and returns its remote-loading config.
 * Returns undefined when no matching MFE exists.
 */
export function getMfeRemoteConfig(name: string | null): MfeRemoteConfig | undefined {
  const mfe = MFE_CONFIGS.find(item => item.remoteName === name);
  return mfe
    ? { remoteName: mfe.remoteName, exposedModule: mfe.exposedModule, url: mfe.url }
    : undefined;
}
