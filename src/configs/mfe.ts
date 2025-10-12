import { LoadRemoteModuleScriptOptions } from "@angular-architects/module-federation";
import { MfeConfig } from "../app/models/mfe.model";
import { UserRole } from "../app/models/roles.model";

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
        allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_LEAD],
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
        allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_LEAD, UserRole.SALES_EXECUTIVE],
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
        allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_LEAD, UserRole.SALES_EXECUTIVE],
        priority: 6,
        icon: 'chart'
    }
];

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