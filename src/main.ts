import { initFederation } from "@angular-architects/module-federation";
import MFE from "./configs/mfe";

/**
 * You get something like this from MFE // {pokemon:'https://opensourcekd.github.io/pokemon/remoteEntry.js'}
 */
const MFEs = MFE.reduce((prev,current)=>({...prev, [current.remoteName]:current.remoteEntry}),{})

initFederation(MFEs).then(()=>{
	import('./bootstrap').then(m=>m.bootstrap())
})

// import('./bootstrap')
// 	.catch(err => console.error(err));
