import { loadRemoteModule } from '@angular-architects/module-federation';
import { Routes } from '@angular/router';
import { LazyloadComponent } from './components/lazyload/lazyload.component';
import { AppComponent } from './app.component';
import { FunnyComponent } from './components/funny/funny.component';
import { roleGuard, adminGuard, allRolesGuard } from './guards/role.guard';
import { UserRole } from './models/roles.model';
import { MultiMfeDemoComponent } from './components/multi-mfe-demo/multi-mfe-demo.component';
import { ReportComponent } from './components/report-page/component';


export const routes: Routes = [
    // {
    //     path: 'lazy',
    //     component: LazyloadComponent
    // },
    // {
    //     path: 'funny',
    //     component: FunnyComponent
    // },
    // {
    //     path: 'multi-mfe-demo',
    //     component: MultiMfeDemoComponent
    // },
    // {
    //     path: 'auth-callback',
    //     loadComponent: () => import('./auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent)
    // },
    {
        path: 'report',
        component: ReportComponent
        // loadChildren: () => import('./routes/mfe-routes').then(m => m.CRUD_RULES_ROUTES),
        // canActivate: [adminGuard]
    },
    {
        path: 'sales',
        loadChildren: () => import('./routes/mfe-routes').then(m => m.MY_SALES_ROUTES),
        canActivate: [allRolesGuard]
    },
    {
        path: 'reports',
        loadChildren: () => import('./routes/mfe-routes').then(m => m.MY_REPORT_ROUTES),
        canActivate: [allRolesGuard]
    },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];
