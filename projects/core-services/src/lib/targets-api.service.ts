import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { API_CONFIG, API_ENDPOINTS, getApiUrl } from './config/api.config';
import { BrandContextService } from './brand-context.service';
import {
  ApiTarget,
  ApiListResponse,
  ApiResponse,
  CreateTargetRequest,
  UpdateTargetRequest,
  ApiError
} from './models/api.model';

/**
 * Targets API Service
 * Handles all API operations for targets
 */
@Injectable({
  providedIn: 'root'
})
export class TargetsApiService {
  constructor(
    private http: HttpClient,
    private brandContext: BrandContextService
  ) {}

  /**
   * Get all targets with optional filters
   */
  getTargets(params?: { userId?: string; status?: string }): Observable<ApiTarget[]> {
    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.targets.list(brandId, params);
    const url = getApiUrl(endpoint);

    return this.http.get<ApiListResponse<ApiTarget>>(url).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(response => response.data),
      catchError(this.handleError<ApiTarget[]>('getTargets', []))
    );
  }

  /**
   * Get a specific target by ID
   */
  getTargetById(targetId: string): Observable<ApiTarget | null> {
    if (!this.isValidId(targetId)) {
      return of(null);
    }

    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.targets.getById(brandId, targetId);
    const url = getApiUrl(endpoint);

    return this.http.get<ApiResponse<ApiTarget>>(url).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(response => response.data),
      catchError(this.handleError('getTargetById', null))
    );
  }

  /**
   * Create a new target
   */
  createTarget(request: CreateTargetRequest): Observable<ApiTarget | null> {
    if (!this.isValidTargetRequest(request)) {
      console.error('[TargetsApiService] Invalid target request');
      return of(null);
    }

    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.targets.create(brandId);
    const url = getApiUrl(endpoint);

    return this.http.post<ApiResponse<ApiTarget>>(url, request).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(response => response.data),
      catchError(this.handleError('createTarget', null))
    );
  }

  /**
   * Update an existing target
   */
  updateTarget(targetId: string, request: UpdateTargetRequest): Observable<ApiTarget | null> {
    if (!this.isValidId(targetId)) {
      return of(null);
    }

    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.targets.update(brandId, targetId);
    const url = getApiUrl(endpoint);

    return this.http.put<ApiResponse<ApiTarget>>(url, request).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(response => response.data),
      catchError(this.handleError('updateTarget', null))
    );
  }

  /**
   * Delete a target
   */
  deleteTarget(targetId: string): Observable<boolean> {
    if (!this.isValidId(targetId)) {
      return of(false);
    }

    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.targets.delete(brandId, targetId);
    const url = getApiUrl(endpoint);

    return this.http.delete(url).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(() => true),
      catchError(this.handleError('deleteTarget', false))
    );
  }

  private isValidId(id: string): boolean {
    return !!id && id.trim().length > 0;
  }

  private isValidTargetRequest(request: CreateTargetRequest): boolean {
    return !!(
      request.userId?.trim() &&
      request.name?.trim() &&
      typeof request.targetValue === 'number' &&
      request.unit?.trim() &&
      request.startDate &&
      request.endDate
    );
  }

  private handleError<T>(operation: string, defaultValue?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`[TargetsApiService] ${operation} failed:`, error);
      
      const apiError = this.extractApiError(error);
      console.error(`[TargetsApiService] API Error:`, apiError);
      
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
