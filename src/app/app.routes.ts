import { loadRemoteModule } from '@angular-architects/module-federation';
import { Routes } from '@angular/router';
import { roleGuard, adminGuard, allRolesGuard } from './guards/role.guard';
import { UserRole } from '@org/core-services';
import { RulesPageComponent } from './pages/rules-page/rules-page.component';
import { SalesPageComponent } from './pages/sales-page/sales-page.component';
import { ReportsPageComponent } from './pages/reports-page/reports-page.component';
import { ZitadelTestComponent } from './pages/zitadel-test/zitadel-test.component';

/**
 * Application routes with role-based access control
 * Each route is protected by guards that check user roles against MFE allowedRoles
 */
export const routes: Routes = [
    {
        path: 'zitadel-test',
        component: ZitadelTestComponent
        // No guard - accessible to all users for testing
    },
    {
        path: 'rules',
        component: RulesPageComponent,
        canActivate: [adminGuard]
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
    { path: '**', redirectTo: '', pathMatch: 'full' }
];
