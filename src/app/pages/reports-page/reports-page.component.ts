import { Component } from '@angular/core';
import { MfeWrapperComponent } from '../../components/mfe-wrapper/mfe-wrapper.component';

/**
 * Page component for My Reports MFE
 * Displays incentive reports and analytics for the current user or selected executive
 */
@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [MfeWrapperComponent],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss'
})
export class ReportsPageComponent {
  mfeName: string = "my-report";
}
