import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Brand Context Service
 * Manages current brand context for API calls
 * In a multi-tenant system, this would track which brand/organization the user is working with
 */
@Injectable({
  providedIn: 'root'
})
export class BrandContextService {
  private readonly DEFAULT_BRAND_ID = 'default';
  private readonly STORAGE_KEY = 'current_brand_id';
  
  private brandIdSubject: BehaviorSubject<string>;
  public brandId$: Observable<string>;

  constructor() {
    const storedBrandId = this.getStoredBrandId();
    this.brandIdSubject = new BehaviorSubject<string>(storedBrandId);
    this.brandId$ = this.brandIdSubject.asObservable();
  }

  /**
   * Get stored brand ID from session storage
   */
  private getStoredBrandId(): string {
    return sessionStorage.getItem(this.STORAGE_KEY) ?? this.DEFAULT_BRAND_ID;
  }

  /**
   * Get current brand ID synchronously
   */
  getBrandId(): string {
    return this.brandIdSubject.value;
  }

  /**
   * Set current brand ID
   * @param brandId - Brand ID to set
   */
  setBrandId(brandId: string): void {
    if (!brandId?.trim()) {
      console.warn('[BrandContextService] Invalid brand ID, using default');
      brandId = this.DEFAULT_BRAND_ID;
    }
    
    sessionStorage.setItem(this.STORAGE_KEY, brandId);
    this.brandIdSubject.next(brandId);
    console.log('[BrandContextService] Brand ID updated to:', brandId);
  }

  /**
   * Reset to default brand ID
   */
  resetToDefault(): void {
    this.setBrandId(this.DEFAULT_BRAND_ID);
  }

  /**
   * Clear brand context
   */
  clear(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    this.brandIdSubject.next(this.DEFAULT_BRAND_ID);
  }
}
