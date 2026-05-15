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
        route: 'sales',
        role: UserRole.SUPPLIER
    },
    {
        displayName: 'Admin',
        remoteName: 'admin',
        exposedModule: './Component',
        url: 'https://inkramp.github.io/all-mfe-builds/inkramp-mfe-admin/remoteEntry.js',
        route: 'reports',
        role: UserRole.ADMIN
    },
];

export interface OrgRolesTokenPayload {
  org_and_roles?: Record<string, string[]>;
  [key: string]: unknown;
}

export function extractUserRoles(token: OrgRolesTokenPayload | null): string[] {
  return token?.org_and_roles ? Object.values(token.org_and_roles).flat() : [];
}

export function getSessionRole(): string | null {
  const role = sessionStorage.getItem('role');
  return role ? role.trim().toLowerCase() : null;
}

export function filterMfesByRole(role: string | null): MfeConfig[] {
  return role ? MFE_CONFIGS.filter(mfe => mfe.role === role) : [];
}

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

export function getMfeRemoteConfig(name: string | null): LoadRemoteModuleScriptOptions | undefined {
  return MFE_CONFIGS
    .filter(mfe => mfe.remoteName === name)
    .map(({ remoteName, exposedModule, url }) => ({ remoteName, exposedModule, url }))[0];
}
