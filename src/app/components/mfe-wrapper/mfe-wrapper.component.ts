import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, Output, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import MFE, {InterfaceMfeUrl} from '../../../configs/mfe';
import { MFE_CONFIGS } from '../../../configs/mfe';
import { loadRemoteModule, LoadRemoteModuleScriptOptions } from '@angular-architects/module-federation';
import { CommonModule } from '@angular/common';

/** Shape of a lazily-loaded MFE remote module. */
interface RemoteModule {
  AppComponent: Type<unknown>;
}

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
      const remote = await this.loadRemote(options);
      
      if (!remote?.AppComponent) {
        console.error(`[MfeWrapperComponent] MFE module or AppComponent not found for: ${this.name}`);
        return;
      }
      
      console.log(`[MfeWrapperComponent] Creating component for MFE: ${this.name}`);
      const componentRef = this.remoteContainer.createComponent(remote.AppComponent);
      // Force an initial CD cycle on the dynamically created component.
      // MfeWrapperComponent uses OnPush and ngAfterViewInit is async, so Angular's
      // CD pass has already completed by the time the remote module resolves.
      // Without detectChanges(), the embedded view is never attached to the active
      // CD tree and the MFE's own async operations (e.g. data fetches) never
      // trigger UI updates in the shell.
      componentRef.changeDetectorRef.detectChanges();
      console.log(`[MfeWrapperComponent] MFE loaded successfully: ${this.name}`);
    } catch (error) {
      console.error(`[MfeWrapperComponent] Error loading MFE ${this.name}:`, error);
    }
  }

  /** Protected so tests can spy on it without touching the non-configurable ES module export. */
  protected loadRemote(options: LoadRemoteModuleScriptOptions): Promise<RemoteModule> {
    return loadRemoteModule(options) as Promise<RemoteModule>;
  }
}