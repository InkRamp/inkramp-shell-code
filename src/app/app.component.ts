import { Component, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation-runtime';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@org/core-services'; 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet],
  standalone:true,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'shell-module';

  constructor(private auth:AuthService){
    console.log("In constructor of shell",this.auth.id)
  }

  @ViewChild('remoteContainer', { read: ViewContainerRef, static: true })
  remoteContainer!: ViewContainerRef;

  async ngAfterViewInit() {
    const remote = await loadRemoteModule({
      remoteName: 'pokemon',
      exposedModule: './Component',   // component exposed directly
    });

    const componentType = remote.AppComponent;
    this.remoteContainer.createComponent(componentType);
  }
}
