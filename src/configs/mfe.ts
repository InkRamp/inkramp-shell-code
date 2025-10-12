import { LoadRemoteModuleScriptOptions } from "@angular-architects/module-federation";
import { MfeConfig } from "../app/models/mfe.model";
import { UserRole } from "../app/models/roles.model";

export interface InterfaceMfeUrl extends LoadRemoteModuleScriptOptions{
    // remoteName:string;
    // exposedModule:string;
    url:string;
}

/**
 * For Development
 */
// const MFE:Array<InterfaceMfeUrl> = [
//     {remoteName:'pokemon',exposedModule:'./Component', url:'http://localhost:3000/angular/remoteEntry.js'}
// ];

/**
 * For Production - Legacy
 */
const MFE:Array<InterfaceMfeUrl> = [
    {remoteName:'pokemon',exposedModule:'./Component', url:'https://opensourcekd.github.io/all-mfe-builds/pokemon/remoteEntry.js'},
    {
        remoteName: 'myReport',
        exposedModule: './Component',
        // Placeholder URL - will be updated when MFE is deployed
        url: 'https://opensourcekd.github.io/all-mfe-builds/mfe-MY_REPORT/remoteEntry.js'
    }
];

/**
 * MFE configurations with role-based access and priority loading
 * Priority: Higher number = higher priority (loaded first)
 * - 10: Critical (load immediately)
 * - 5-9: High (preload on login)
 * - 1-4: Normal (load on demand)
 */
export const MFE_CONFIGS: MfeConfig[] = [
    {
        id: 'mfe-pokemon',
        name: 'pokemon',
        displayName: 'Pokemon Demo',
        remoteName: 'pokemon',
        exposedModule: './Component',
        url: 'https://opensourcekd.github.io/all-mfe-builds/pokemon/remoteEntry.js',
        route: 'pokemon',
        allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_LEAD, UserRole.SALES_EXECUTIVE],
        priority: 1,
        icon: 'game'
    },
    {
        id: 'mfe-crud-rules',
        name: 'crud-rules',
        displayName: 'Manage Incentive Rules',
        remoteName: 'crudRules',
        exposedModule: './Component',
        // Placeholder URL - will be updated when MFE is deployed
        url: 'https://opensourcekd.github.io/all-mfe-builds/mfe-CRUD_RULES/remoteEntry.js',
        route: 'rules',
        allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_LEAD],
        priority: 8, // High priority for admins
        icon: 'settings'
    },
    {
        id: 'mfe-my-sales',
        name: 'my-sales',
        displayName: 'My Sales History',
        remoteName: 'mySales',
        exposedModule: './Component',
        // Placeholder URL - will be updated when MFE is deployed
        url: 'https://opensourcekd.github.io/all-mfe-builds/mfe-MY_SALES/remoteEntry.js',
        route: 'sales',
        allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_LEAD, UserRole.SALES_EXECUTIVE],
        priority: 7, // High priority for all users
        icon: 'list'
    },
    {
        id: 'mfe-my-report',
        name: 'my-report',
        displayName: 'My Incentive Reports',
        remoteName: 'myReport',
        exposedModule: './Component',
        // Placeholder URL - will be updated when MFE is deployed
        url: 'https://opensourcekd.github.io/all-mfe-builds/mfe-MY_REPORT/remoteEntry.js',
        route: 'reports',
        allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_LEAD, UserRole.SALES_EXECUTIVE],
        priority: 6, // High priority for visualization
        icon: 'chart'
    }
];

export default MFE