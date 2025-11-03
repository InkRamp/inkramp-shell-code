import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { API_CONFIG, API_ENDPOINTS, getApiUrl } from './config/api.config';
import { BrandContextService } from './brand-context.service';
import {
  ApiTask,
  ApiListResponse,
  ApiResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  ApiError
} from './models/api.model';

/**
 * Tasks API Service
 * Handles all API operations for tasks
 */
@Injectable({
  providedIn: 'root'
})
export class TasksApiService {
  constructor(
    private http: HttpClient,
    private brandContext: BrandContextService
  ) {}

  /**
   * Get all tasks with optional filters
   */
  getTasks(params?: { userId?: string; status?: string }): Observable<ApiTask[]> {
    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.tasks.list(brandId, params);
    const url = getApiUrl(endpoint);

    return this.http.get<ApiListResponse<ApiTask>>(url).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(response => response.data),
      catchError(this.handleError<ApiTask[]>('getTasks', []))
    );
  }

  /**
   * Get a specific task by ID
   */
  getTaskById(taskId: string): Observable<ApiTask | null> {
    if (!this.isValidId(taskId)) {
      return of(null);
    }

    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.tasks.getById(brandId, taskId);
    const url = getApiUrl(endpoint);

    return this.http.get<ApiResponse<ApiTask>>(url).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(response => response.data),
      catchError(this.handleError('getTaskById', null))
    );
  }

  /**
   * Create a new task
   */
  createTask(request: CreateTaskRequest): Observable<ApiTask | null> {
    if (!this.isValidTaskRequest(request)) {
      console.error('[TasksApiService] Invalid task request');
      return of(null);
    }

    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.tasks.create(brandId);
    const url = getApiUrl(endpoint);

    return this.http.post<ApiResponse<ApiTask>>(url, request).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(response => response.data),
      catchError(this.handleError('createTask', null))
    );
  }

  /**
   * Update an existing task
   */
  updateTask(taskId: string, request: UpdateTaskRequest): Observable<ApiTask | null> {
    if (!this.isValidId(taskId)) {
      return of(null);
    }

    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.tasks.update(brandId, taskId);
    const url = getApiUrl(endpoint);

    return this.http.put<ApiResponse<ApiTask>>(url, request).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(response => response.data),
      catchError(this.handleError('updateTask', null))
    );
  }

  /**
   * Delete a task
   */
  deleteTask(taskId: string): Observable<boolean> {
    if (!this.isValidId(taskId)) {
      return of(false);
    }

    const brandId = this.brandContext.getBrandId();
    const endpoint = API_ENDPOINTS.tasks.delete(brandId, taskId);
    const url = getApiUrl(endpoint);

    return this.http.delete(url).pipe(
      timeout(API_CONFIG.timeout ?? 30000),
      map(() => true),
      catchError(this.handleError('deleteTask', false))
    );
  }

  private isValidId(id: string): boolean {
    return !!id && id.trim().length > 0;
  }

  private isValidTaskRequest(request: CreateTaskRequest): boolean {
    return !!(
      request.userId?.trim() &&
      request.title?.trim() &&
      request.priority
    );
  }

  private handleError<T>(operation: string, defaultValue?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`[TasksApiService] ${operation} failed:`, error);
      
      const apiError = this.extractApiError(error);
      console.error(`[TasksApiService] API Error:`, apiError);
      
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
