import { Component } from '@angular/core';
import { MfeWrapperComponent } from '../../components/mfe-wrapper/mfe-wrapper.component';

@Component({
  selector: 'app-multi-mfe-demo',
  standalone: true,
  imports: [MfeWrapperComponent],
  templateUrl: './multi-mfe-demo.component.html',
  styleUrl: './multi-mfe-demo.component.scss'
})
export class MultiMfeDemoComponent {
  // Example: Load multiple MFEs
  mfeList = ['pokemon', 'my-sales', 'my-report'];
}
