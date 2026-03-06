import { AfterViewInit, ChangeDetectionStrategy, Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import MFE from '../../../configs/mfe';
import { loadRemoteModule, LoadRemoteModuleScriptOptions } from '@angular-architects/module-federation';
import { CommonModule } from '@angular/common';

/**
 * MFE Wrapper Component
 * NOTE: MfeLoaderService removed - using direct MFE configuration
 */
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

  async ngAfterViewInit(){
    const options:LoadRemoteModuleScriptOptions | undefined = MFE.find(({remoteName})=>remoteName===this.name)
    if(!options) {
      console.error(`[MfeWrapperComponent] MFE configuration not found for: ${this.name}`);
      return;
    }
    
    try {
      console.log(`[MfeWrapperComponent] Loading MFE: ${this.name}`, options);
      const remote = await loadRemoteModule(options);
      
      if (!remote || !remote.AppComponent) {
        console.error(`[MfeWrapperComponent] MFE module or AppComponent not found for: ${this.name}`);
        return;
      }
      
      console.log(`[MfeWrapperComponent] Creating component for MFE: ${this.name}`);
      const componentRef = this.remoteContainer.createComponent(remote.AppComponent);
      // detectChanges() is required when the parent uses OnPush and createComponent() is
      // called asynchronously (after ngAfterViewInit resolves). Without it, the embedded
      // view is never attached to Angular's active CD tree, so ngOnInit lifecycle hooks
      // run in a detached context. Any HTTP subscription teardown (AbortController.abort)
      // fires immediately on the next CD cycle, aborting the request before it reaches
      // the network — resulting in status: 0 / "Unknown Error" with no network tab entry.
      componentRef.changeDetectorRef.detectChanges();
      console.log(`[MfeWrapperComponent] MFE loaded successfully: ${this.name}`);
    } catch (error) {
      console.error(`[MfeWrapperComponent] Error loading MFE ${this.name}:`, error);
    }
  }
}