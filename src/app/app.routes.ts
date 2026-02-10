import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { RulesPageComponent } from './pages/rules-page/rules-page.component';
import { SalesPageComponent } from './pages/sales-page/sales-page.component';
import { ReportsPageComponent } from './pages/reports-page/reports-page.component';
import { UsersPageComponent } from './pages/users-page/users-page.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';

/**
 * Application routes - simplified without guards for thin shell
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
        component: RulesPageComponent
    },
    {
        path: 'sales',
        component: SalesPageComponent
    },
    {
        path: 'reports',
        component: ReportsPageComponent
    },
    {
        path: 'users',
        component: UsersPageComponent
    },
    { path: '**', redirectTo: '' }
];
