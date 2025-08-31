import { initFederation } from "@angular-architects/module-federation";

initFederation({
	pokemon:'https://opensourcekd.github.io/ng-mfe-pokemon/remoteEntry.js'
}).then(()=>{
	import('./bootstrap').then(m=>m.bootstrap())
})

// import('./bootstrap')
// 	.catch(err => console.error(err));
