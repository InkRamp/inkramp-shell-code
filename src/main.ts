import { initFederation } from "@angular-architects/module-federation";
import { MFE_CONFIGS } from "./configs/mfe";

/**
 * You get something like this from MFE // {pokemon:'https://InkRamp.github.io/pokemon/remoteEntry.js'}
 */
const MFEs = MFE_CONFIGS
    .filter(({ url }) => !!url)
    .reduce((prev,current)=>({...prev, [current.remoteName]:current.url}),{})

initFederation(MFEs).then(()=>{
	import('./bootstrap').then(m=>m.bootstrap())
})

// import('./bootstrap')
// 	.catch(err => console.error(err));
