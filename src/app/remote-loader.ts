// src/app/remote-loader.ts
import { loadRemoteModule } from '@angular-architects/module-federation';

export const loadPokemonModule = () =>
  loadRemoteModule({
    remoteName: 'pokemon',
    exposedModule: './PokemonModule'
  });
