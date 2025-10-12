import { Component } from '@angular/core';
import { MfeWrapperComponent } from '../../components/mfe-wrapper/mfe-wrapper.component';

/**
 * Page component for CRUD Rules MFE
 * Allows admins and team leads to manage incentive rules
 */
@Component({
  selector: 'app-rules-page',
  standalone: true,
  imports: [MfeWrapperComponent],
  templateUrl: './rules-page.component.html',
  styleUrl: './rules-page.component.scss'
})
export class RulesPageComponent {
  mfeName: string = "crudRules";
}
