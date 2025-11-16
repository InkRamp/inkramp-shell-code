import { Component } from '@angular/core';
import { MfeWrapperComponent } from '../../components/mfe-wrapper/mfe-wrapper.component';

/**
 * Page component for Users CRUD MFE
 * Allows admins to manage users
 */
@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [MfeWrapperComponent],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss'
})
export class UsersPageComponent {
  mfeName: string = "usersCrud";
}
