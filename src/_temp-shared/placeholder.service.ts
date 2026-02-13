import { Injectable } from '@angular/core';

/**
 * Placeholder service to maintain @org/core-services path
 * This service exists only to keep the public-api.ts exports valid
 * and maintain the @org path structure during the migration to opensourcekd library
 */
@Injectable({
  providedIn: 'root'
})
export class PlaceholderService {
  constructor() {
    // Intentionally empty - placeholder service
  }
}
