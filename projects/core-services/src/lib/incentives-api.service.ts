import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { API_CONFIG, API_ENDPOINTS, getApiUrl } from './config/api.config';
import { BrandContextService } from './brand-context.service';
import {
  ApiIncentive,
  ApiListResponse,
  ApiResponse,
  CreateIncentiveRequest,
  UpdateIncentiveRequest,
  ApiError
} from './models/api.model';

/**
 * Incentives API Service
 * Handles all API operations for incentives
 */
@Injectable({
  providedIn: 'root'
})
export class IncentivesApiService {
  constructor(
    private http: HttpClient,
    private brandContext: BrandContextService
  ) {}

  /**
   * Get all incentives with optional filters
   */
  getIncentives(params?: { userId?: string; status?: string }): Observable<ApiIncentive[]> {
    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.incentives.list(brandId, params);
    const url = getApiUrl(endpoint);

    return this.http.get<ApiListResponse<ApiIncentive>>(url).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(response => response.data),
      catchError(this.handleError<ApiIncentive[]>('getIncentives', []))
    );
  }

  /**
   * Get a specific incentive by ID
   */
  getIncentiveById(incentiveId: string): Observable<ApiIncentive | null> {
    if (!this.isValidId(incentiveId)) {
      return of(null);
    }

    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.incentives.getById(brandId, incentiveId);
    const url = getApiUrl(endpoint);

    return this.http.get<ApiResponse<ApiIncentive>>(url).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(response => response.data),
      catchError(this.handleError('getIncentiveById', null))
    );
  }

  /**
   * Create a new incentive
   */
  createIncentive(request: CreateIncentiveRequest): Observable<ApiIncentive | null> {
    if (!this.isValidIncentiveRequest(request)) {
      console.error('[IncentivesApiService] Invalid incentive request');
      return of(null);
    }

    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.incentives.create(brandId);
    const url = getApiUrl(endpoint);

    return this.http.post<ApiResponse<ApiIncentive>>(url, request).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(response => response.data),
      catchError(this.handleError('createIncentive', null))
    );
  }

  /**
   * Update an existing incentive
   */
  updateIncentive(incentiveId: string, request: UpdateIncentiveRequest): Observable<ApiIncentive | null> {
    if (!this.isValidId(incentiveId)) {
      return of(null);
    }

    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.incentives.update(brandId, incentiveId);
    const url = getApiUrl(endpoint);

    return this.http.put<ApiResponse<ApiIncentive>>(url, request).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(response => response.data),
      catchError(this.handleError('updateIncentive', null))
    );
  }

  private isValidId(id: string): boolean {
    return !!id && id.trim().length > 0;
  }

  private isValidIncentiveRequest(request: CreateIncentiveRequest): boolean {
    return !!(
      request.userId?.trim() &&
      request.ruleId?.trim() &&
      typeof request.amount === 'number' &&
      request.earnedDate
    );
  }

  private handleError<T>(operation: string, defaultValue?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`[IncentivesApiService] ${operation} failed:`, error);
      
      const apiError = this.extractApiError(error);
      console.error(`[IncentivesApiService] API Error:`, apiError);
      
      return defaultValue !== undefined ? of(defaultValue) : throwError(() => error);
    };
  }

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
