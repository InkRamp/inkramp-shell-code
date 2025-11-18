import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MfeLoaderService, MfeConfig } from '@org/core-services';

/**
 * Home page component that displays all available routes
 * For testing purposes - shows all MFEs regardless of role
 */
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  allMfes: MfeConfig[] = [];

  constructor(private mfeLoader: MfeLoaderService) {}

  ngOnInit(): void {
    // Get all MFE configurations without role filtering
    this.allMfes = this.mfeLoader.getConfigs();
  }
}
