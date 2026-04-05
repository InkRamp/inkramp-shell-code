import { Component } from '@angular/core';
import { MfeWrapperComponent } from '../../components/mfe-wrapper/mfe-wrapper.component';

/**
 * Page component for AI Analytics MFE
 */
@Component({
  selector: 'app-ai-analytics-page',
  standalone: true,
  imports: [MfeWrapperComponent],
  templateUrl: './ai-analytics-page.component.html',
  styleUrl: './ai-analytics-page.component.scss'
})
export class AiAnalyticsPageComponent {
  mfeName: string = 'mfeAi';
}
