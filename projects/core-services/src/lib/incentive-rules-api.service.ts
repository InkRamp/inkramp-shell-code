import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { API_CONFIG, API_ENDPOINTS, getApiUrl } from './config/api.config';
import { BrandContextService } from './brand-context.service';
import {
  ApiIncentiveRule,
  ApiListResponse,
  ApiResponse,
  CreateIncentiveRuleRequest,
  UpdateIncentiveRuleRequest,
  ApiError
} from './models/api.model';

/**
 * Incentive Rules API Service
 * Handles all API operations for incentive rules
 * Uses pure functions and functional composition for clarity
 */
@Injectable({
  providedIn: 'root'
})
export class IncentiveRulesApiService {
  constructor(
    private http: HttpClient,
    private brandContext: BrandContextService
  ) {}

  /**
   * Get all incentive rules for current brand
   */
  getRules(): Observable<ApiIncentiveRule[]> {
    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.incentiveRules.list(brandId);
    const url = getApiUrl(endpoint);

    return this.http.get<ApiListResponse<ApiIncentiveRule>>(url).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(response => response.data),
      catchError(this.handleError<ApiIncentiveRule[]>('getRules', []))
    );
  }

  /**
   * Get a specific incentive rule by ID
   */
  getRuleById(ruleId: string): Observable<ApiIncentiveRule | null> {
    if (!this.isValidId(ruleId)) {
      return of(null);
    }

    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.incentiveRules.getById(brandId, ruleId);
    const url = getApiUrl(endpoint);

    return this.http.get<ApiResponse<ApiIncentiveRule>>(url).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(response => response.data),
      catchError(this.handleError('getRuleById', null))
    );
  }

  /**
   * Create a new incentive rule
   */
  createRule(request: CreateIncentiveRuleRequest): Observable<ApiIncentiveRule | null> {
    if (!this.isValidRuleRequest(request)) {
      console.error('[IncentiveRulesApiService] Invalid rule request');
      return of(null);
    }

    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.incentiveRules.create(brandId);
    const url = getApiUrl(endpoint);

    return this.http.post<ApiResponse<ApiIncentiveRule>>(url, request).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(response => response.data),
      catchError(this.handleError('createRule', null))
    );
  }

  /**
   * Update an existing incentive rule
   */
  updateRule(ruleId: string, request: UpdateIncentiveRuleRequest): Observable<ApiIncentiveRule | null> {
    if (!this.isValidId(ruleId)) {
      return of(null);
    }

    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.incentiveRules.update(brandId, ruleId);
    const url = getApiUrl(endpoint);

    return this.http.put<ApiResponse<ApiIncentiveRule>>(url, request).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(response => response.data),
      catchError(this.handleError('updateRule', null))
    );
  }

  /**
   * Delete an incentive rule
   */
  deleteRule(ruleId: string): Observable<boolean> {
    if (!this.isValidId(ruleId)) {
      return of(false);
    }

    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.incentiveRules.delete(brandId, ruleId);
    const url = getApiUrl(endpoint);

    return this.http.delete(url).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(() => true),
      catchError(this.handleError('deleteRule', false))
    );
  }

  /**
   * Pure function to validate ID
   */
  private isValidId(id: string): boolean {
    return !!id && id.trim().length > 0;
  }

  /**
   * Pure function to validate rule request
   */
  private isValidRuleRequest(request: CreateIncentiveRuleRequest): boolean {
    return !!(
      request.name?.trim() &&
      request.description?.trim() &&
      request.type &&
      typeof request.value === 'number'
    );
  }

  /**
   * Pure error handler factory
   * Returns a function that handles errors consistently
   */
  private handleError<T>(operation: string, defaultValue?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`[IncentiveRulesApiService] ${operation} failed:`, error);
      
      const apiError = this.extractApiError(error);
      console.error(`[IncentiveRulesApiService] API Error:`, apiError);
      
      // Return default value instead of throwing
      // This prevents breaking the UI on errors
      return defaultValue !== undefined ? of(defaultValue) : throwError(() => error);
    };
  }

  /**
   * Pure function to extract API error from HTTP error
   */
  private extractApiError(error: HttpErrorResponse): ApiError {
    if (error.error && typeof error.error === 'object') {
      return error.error as ApiError;
    }
    
    return {
      error: error.statusText || 'Unknown Error',
      message: error.message || 'An unexpected error occurred',
      statusCode: error.status,
      timestamp: new Date().toISOString()
    };
  }
}
