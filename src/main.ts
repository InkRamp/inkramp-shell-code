import { initFederation } from '@angular-architects/module-federation';

initFederation({
  pokemon: 'https://opensourcekd.github.io/ng-mfe-pokemon/remoteEntry.js',
}).then(() => {
  // only bootstrap Angular after federation initialized
  import('./bootstrap').then(m => m.bootstrap());
});

// import('./bootstrap')
// 	.catch(err => console.error(err));
// import { enableProdMode } from '@angular/core';
// import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
// import { AppModule } from './app/app.module';
// //import {setRemoteDefinitions} from '@angular-architects/module-federation';

// enableProdMode(); // Shell also in production mode

// platformBrowserDynamic()
//   .bootstrapModule(AppModule)
//   .catch(err => console.error(err));

