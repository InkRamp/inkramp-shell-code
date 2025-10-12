import { Component } from '@angular/core';
import { MfeWrapperComponent } from '../../components/mfe-wrapper/mfe-wrapper.component';

/**
 * Page component for My Sales MFE
 * Displays sales history for the current user or selected executive
 */
@Component({
  selector: 'app-sales-page',
  standalone: true,
  imports: [MfeWrapperComponent],
  templateUrl: './sales-page.component.html',
  styleUrl: './sales-page.component.scss'
})
export class SalesPageComponent {
  mfeName: string = "mySales";
}
