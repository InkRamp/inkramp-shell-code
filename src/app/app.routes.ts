import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { MfePageComponent } from './pages/mfe-page/mfe-page.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { MFE_CONFIGS } from '../configs/mfe';

const mfeRoutes: Routes = MFE_CONFIGS.map(mfe => ({
  path: mfe.route,
  component: MfePageComponent,
  data: { mfeName: mfe.remoteName }
}));

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'auth-callback', component: AuthCallbackComponent },
  ...mfeRoutes,
  { path: '**', redirectTo: '' }
];
