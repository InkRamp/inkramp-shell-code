import { Component, OnInit } from '@angular/core';
import { loadBuildInfo, getBuildInfo } from '../../version';

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
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  version = '0.0.0';
  buildNumber = '0';

  async ngOnInit(): Promise<void> {
    try {
      const buildInfo = await loadBuildInfo();
      this.version = buildInfo?.version ?? '0.0.0';
      this.buildNumber = buildInfo?.buildNumber ?? '0';
    } catch (error) {
      console.warn('[FooterComponent] Failed to load build info:', error);
      // Keep default values
    }
  }
}
