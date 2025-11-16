import { loadRemoteModule } from '@angular-architects/module-federation';
import { Routes } from '@angular/router';
// import { roleGuard, adminGuard, allRolesGuard } from './guards/role.guard';
import { UserRole } from '@org/core-services';
import { RulesPageComponent } from './pages/rules-page/rules-page.component';
import { SalesPageComponent } from './pages/sales-page/sales-page.component';
import { ReportsPageComponent } from './pages/reports-page/reports-page.component';
import { UsersPageComponent } from './pages/users-page/users-page.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';

/**
 * Application routes with role-based access control
 * Guards temporarily disabled for testing
 */
export const routes: Routes = [
    {
        path: 'auth-callback',
        component: AuthCallbackComponent
    },
    {
        path: 'rules',
        component: RulesPageComponent,
        // canActivate: [adminGuard]  // Temporarily disabled
    },
    {
        path: 'sales',
        component: SalesPageComponent,
        // canActivate: [allRolesGuard]  // Temporarily disabled
    },
    {
        path: 'reports',
        component: ReportsPageComponent,
        // canActivate: [allRolesGuard]  // Temporarily disabled
    },
    {
        path: 'users',
        component: UsersPageComponent,
        // canActivate: [adminGuard]  // Temporarily disabled
    },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];
