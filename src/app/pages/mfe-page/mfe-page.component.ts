import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MfeWrapperComponent } from '../../components/mfe-wrapper/mfe-wrapper.component';

/**
 * Shared page shell for all MFE routes.
 * The MFE remote name is supplied via route data: `data: { mfeName: '...' }`.
 */
@Component({
  selector: 'app-mfe-page',
  standalone: true,
  imports: [MfeWrapperComponent],
  template: `
    <div class="page-container">
      <app-mfe-wrapper [name]="mfeName"></app-mfe-wrapper>
    </div>
  `
})
export class MfePageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  mfeName = '';

  ngOnInit(): void {
    this.mfeName = this.route.snapshot.data['mfeName'];
  }
}
