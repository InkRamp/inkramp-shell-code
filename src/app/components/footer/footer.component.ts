import { Component } from '@angular/core';
import { APP_VERSION } from '../../version';

/**
 * Footer component for the application
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  version = APP_VERSION.version;
  buildNumber = APP_VERSION.buildNumber;
}
