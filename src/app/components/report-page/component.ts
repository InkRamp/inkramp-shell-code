import { Component } from '@angular/core';
import { MfeWrapperComponent } from '../mfe-wrapper/mfe-wrapper.component';

@Component({
  selector: 'report-component',
  standalone: true,
  imports: [MfeWrapperComponent],
  templateUrl: './component.html',
  styleUrl: './style.scss'
})
export class ReportComponent {
  // Example: Load multiple MFEs
  // mfeList = ['pokemon', 'my-sales', 'my-report'];
  mfe1:string = "myReport";
}
