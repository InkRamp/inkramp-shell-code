import { Injectable } from '@angular/core';

/**
 * DUMMY PLACEHOLDER SERVICE
 * This is a minimal placeholder - all real implementations moved to @opensourcekd/ng-common-libs
 */
@Injectable({
  providedIn: 'root'
})
export class CoreServicesService {
  constructor() {
    console.log('[CoreServicesService] Dummy placeholder service initialized');
  }

  getDummyData(): string {
    return 'This is a dummy placeholder service';
  }
}
