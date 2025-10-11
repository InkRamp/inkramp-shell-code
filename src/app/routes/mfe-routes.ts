import { Routes } from '@angular/router';
import { MfeWrapperComponent } from '../components/mfe-wrapper/mfe-wrapper.component';

/**
 * Routes for CRUD Rules MFE (Admin and Team Lead only)
 */
export const CRUD_RULES_ROUTES: Routes = [
    {
        path: '',
        component: MfeWrapperComponent,
        data: { mfeName: 'crud-rules' }
    }
];

/**
 * Routes for My Sales MFE (All roles)
 */
export const MY_SALES_ROUTES: Routes = [
    {
        path: '',
        component: MfeWrapperComponent,
        data: { mfeName: 'my-sales' }
    }
];

/**
 * Routes for My Report MFE (All roles)
 */
export const MY_REPORT_ROUTES: Routes = [
    {
        path: '',
        component: MfeWrapperComponent,
        data: { mfeName: 'my-report' }
    }
];
