import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MfeWrapperComponent } from '../../components/mfe-wrapper/mfe-wrapper.component';

/**
 * Home page component - landing page for the application
 */
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, MfeWrapperComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
}
