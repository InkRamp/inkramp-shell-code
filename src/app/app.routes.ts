import { loadRemoteModule } from '@angular-architects/module-federation';
import { Routes } from '@angular/router';
import { LazyloadComponent } from './components/lazyload/lazyload.component';
import { AppComponent } from './app.component';
import { FunnyComponent } from './components/funny/funny.component';


export const routes: Routes = [
    {
        path: 'lazy',
        //loadChildren: () => import('./components/lazyload/lazyload.component').then(m => m.LazyloadComponent),
        component: LazyloadComponent
    },
    {
        path: '',
        component: FunnyComponent
    },
    // {
    //     path: '**',
    //     redirectTo: '', // fallback
    // }
    // {
    // path: 'pokemon',
    // loadChildren: () =>
    //     loadRemoteModule({
    //     type: 'module',
    //     remoteEntry: 'http://localhost:3000/angular/remoteEntry.js', // remote’s port
    //     exposedModule: './PokemonModule'
    //     }).then(m => m.PokemonModule)
    // },
        
    // {
    // path: '',
    // redirectTo: 'pokemon',
    // pathMatch: 'full'
    // }
];
