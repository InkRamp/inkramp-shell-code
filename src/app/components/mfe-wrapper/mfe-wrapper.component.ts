import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import MFE, {InterfaceMfeUrl} from '../../../configs/mfe';
import { MFE_CONFIGS } from '../../../configs/mfe';
import { loadRemoteModule, LoadRemoteModuleScriptOptions } from '@angular-architects/module-federation';
import { MfeLoaderService } from '../../services/mfe-loader.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mfe-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mfe-wrapper.component.html',
  styleUrl: './mfe-wrapper.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class MfeWrapperComponent implements AfterViewInit{
  @Input() name:string | null = '';
  @ViewChild('container', {read:ViewContainerRef, static:true})
  remoteContainer!:ViewContainerRef

  constructor(
    private route: ActivatedRoute,
    private mfeLoader: MfeLoaderService
  ) {
    // Initialize MFE configs
    this.mfeLoader.setConfigs(MFE_CONFIGS);
  }
  
  async ngAfterViewInit(){
    // Get MFE name from route data or input
    const mfeName = this.route.snapshot.data['mfeName'] || this.name;
    
    if (!mfeName) {
      console.error('[MfeWrapperComponent] No MFE name provided');
      return;
    }

    // Try new config first
    const config = this.mfeLoader.getConfigByName(mfeName);
    if (config) {
      try {
        const module = await this.mfeLoader.loadMfe(config);
        if (module && module.AppComponent) {
          this.remoteContainer.createComponent(module.AppComponent);
        }
      } catch (error) {
        console.error(`[MfeWrapperComponent] Error loading MFE ${mfeName}:`, error);
      }
      return;
    }

    // Fallback to legacy MFE loading for backward compatibility
    const options:LoadRemoteModuleScriptOptions | undefined = MFE.map(({remoteName, exposedModule})=>({remoteName, exposedModule})).find(({remoteName})=>remoteName===mfeName)
    if(!options) {
      console.error(`[MfeWrapperComponent] MFE ${mfeName} not found in configurations`);
      return;
    }
    const remote = await loadRemoteModule(options)
    this.remoteContainer.createComponent(remote.AppComponent)
  }
  
}
