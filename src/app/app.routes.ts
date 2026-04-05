import { Routes } from '@angular/router';
import { roleGuard, adminGuard, allRolesGuard } from './guards/role.guard';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { RulesPageComponent } from './pages/rules-page/rules-page.component';
import { SalesPageComponent } from './pages/sales-page/sales-page.component';
import { ReportsPageComponent } from './pages/reports-page/reports-page.component';
import { UsersPageComponent } from './pages/users-page/users-page.component';
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
        component: RulesPageComponent,
        canActivate: [roleGuard(['super-admin', 'org-admin', 'org-lead'])]
    },
    {
        path: 'sales',
        component: SalesPageComponent,
        canActivate: [allRolesGuard]
    },
    {
        path: 'reports',
        component: ReportsPageComponent,
        canActivate: [allRolesGuard]
    },
    {
        path: 'users',
        component: UsersPageComponent,
        canActivate: [adminGuard]
    },
    { path: '**', redirectTo: '' }
];
