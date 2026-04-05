import { Routes } from '@angular/router';
import { roleGuard, adminGuard, allRolesGuard } from './guards/role.guard';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { MfePageComponent } from './pages/mfe-page/mfe-page.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';

/**
 * Application routes with role-based access control
 * Guards enabled based on user role from API
 */
export const routes: Routes = [
    {
        path: '',
        component: HomePageComponent
    },
    {
        path: 'auth-callback',
        component: AuthCallbackComponent
    },
    {
        path: 'rules',
        component: MfePageComponent,
        data: { mfeName: 'crudRules' },
        canActivate: [roleGuard(['super-admin', 'org-admin', 'org-lead'])]
    },
    {
        path: 'sales',
        component: MfePageComponent,
        data: { mfeName: 'mySales' },
        canActivate: [allRolesGuard]
    },
    {
        path: 'reports',
        component: MfePageComponent,
        data: { mfeName: 'myReport' },
        canActivate: [allRolesGuard]
    },
    {
        path: 'users',
        component: MfePageComponent,
        data: { mfeName: 'usersCrud' },
        canActivate: [adminGuard]
    },
    {
        path: 'ai-analytics',
        component: MfePageComponent,
        data: { mfeName: 'mfeAi' },
        canActivate: [allRolesGuard]
    },
    { path: '**', redirectTo: '' }
];
