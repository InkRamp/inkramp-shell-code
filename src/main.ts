import { initFederation } from "@angular-architects/module-federation";
import MFE from "./configs/mfe";

/**
 * Build the federation manifest using script-type entries so that each remote
 * entry is loaded via a <script> tag and registered under window[remoteName].
 * Using string values here would let parseConfig default to type:'module',
 * which stores the container under the remoteEntry URL rather than the
 * remoteName — causing a key mismatch in containerMap and silently preventing
 * the MFE AppComponent from being created (and its API calls from firing).
 */
const MFEs = MFE.reduce((prev, current) => ({
  ...prev,
  [current.remoteName]: { type: 'script' as const, remoteEntry: current.url }
}), {})

initFederation(MFEs).then(()=>{
	import('./bootstrap').then(m=>m.bootstrap())
})

// import('./bootstrap')
// 	.catch(err => console.error(err));
