import { LoadRemoteModuleScriptOptions } from "@angular-architects/module-federation";

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
 * For Production
 */

const MFE:Array<InterfaceMfeUrl> = [
    {remoteName:'pokemon',exposedModule:'./Component', url:'https://opensourcekd.github.io/all-mfe-builds/pokemon/remoteEntry.js'}
];

export default MFE