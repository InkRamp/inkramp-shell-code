import { Routes } from '@angular/router';
import { roleGuard } from './guards/role.guard';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { MfePageComponent } from './pages/mfe-page/mfe-page.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { MFE_CONFIGS } from '../configs/mfe';

/**
 * Routes are generated directly from MFE_CONFIGS — one route per MFE (1:1 mapping).
 * Each route is guarded by roleGuard with the single role defined in the MFE config.
 */
const mfeRoutes: Routes = MFE_CONFIGS.map(mfe => ({
  path: mfe.route,
  component: MfePageComponent,
  data: { mfeName: mfe.remoteName },
  canActivate: [roleGuard(mfe.allowedRoles as unknown as string[])]
}));

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'auth-callback', component: AuthCallbackComponent },
  ...mfeRoutes,
  { path: '**', redirectTo: '' }
];
