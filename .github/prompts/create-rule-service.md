# Create Rule Service

Use this prompt when creating services related to incentive rules management.

## Prompt Template

```
Create a typed RuleService in the MFE or core-services library with the following specifications:

1. **Location**: [path, e.g., mfe-rule-editor/src/services/ or projects/core-services/src/lib/api/]

2. **Methods Required**:
   - listRules(params: RuleListParams): Observable<PaginatedResponse<Rule>>
   - getRule(id: string): Observable<Rule>
   - createRule(data: CreateRuleDto): Observable<Rule>
   - updateRule(id: string, data: UpdateRuleDto): Observable<Rule>
   - deleteRule(id: string): Observable<void>
   - evaluateRule(id: string, context: EvaluationContext): Observable<EvaluationResult>

3. **Error Handling**:
   - Use catchError with typed ServiceError
   - Log errors appropriately (no sensitive data)
   - Return user-friendly error messages

4. **Caching** (if applicable):
   - Cache list requests for [duration]
   - Invalidate cache on mutations

5. **RBAC**:
   - Check permissions before API calls (optional, can be done at component level)

Requirements:
- Use HttpClient from Angular
- Use API_CONFIG.baseUrl for endpoint URLs
- Include JSDoc for all public methods
- Add comprehensive unit tests
- Follow existing service patterns in the codebase
```

## Example Usage

```
Create a typed RuleService in projects/core-services/src/lib/api/ with the following specifications:

1. **Location**: projects/core-services/src/lib/api/rules.service.ts

2. **Methods Required**:
   - listRules(params: RuleListParams): Observable<PaginatedResponse<Rule>>
   - getRule(id: string): Observable<Rule>
   - createRule(data: CreateRuleDto): Observable<Rule>
   - updateRule(id: string, data: UpdateRuleDto): Observable<Rule>
   - deleteRule(id: string): Observable<void>
   - evaluateRule(id: string, context: EvaluationContext): Observable<EvaluationResult>
   - activateRule(id: string): Observable<Rule>
   - pauseRule(id: string): Observable<Rule>

3. **Error Handling**:
   - Use catchError with typed ServiceError
   - Log errors appropriately (no sensitive data)
   - Return user-friendly error messages

4. **Caching**:
   - Cache getRule for 60 seconds
   - Invalidate on update/delete

5. **RBAC**:
   - Not required at service level (handled by guards)

Requirements:
- Use HttpClient from Angular
- Use API_CONFIG.baseUrl for endpoint URLs
- Include JSDoc for all public methods
- Add comprehensive unit tests
- Follow existing service patterns in the codebase
```

## Service Implementation Template

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface Rule {
  id: string;
  name: string;
  description: string;
  orgId: string;
  createdBy: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  status: 'active' | 'paused' | 'archived';
  effectiveFrom: string;
  effectiveTo?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface RuleCondition {
  field: string;
  operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: string | number | string[];
}

export interface RuleAction {
  type: 'bonus' | 'multiplier' | 'tier' | 'notification';
  params: Record<string, unknown>;
}

export interface RuleListParams {
  page?: number;
  limit?: number;
  status?: string;
  teamId?: string;
  search?: string;
}

export interface CreateRuleDto {
  name: string;
  description?: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface UpdateRuleDto extends Partial<CreateRuleDto> {
  status?: 'active' | 'paused' | 'archived';
}

export interface EvaluationContext {
  userId: string;
  data: Record<string, unknown>;
}

export interface EvaluationResult {
  matched: boolean;
  actions?: Array<{
    type: string;
    result: Record<string, unknown>;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

/**
 * Service for managing incentive rules
 * Provides CRUD operations and rule evaluation
 */
@Injectable({ providedIn: 'root' })
export class RulesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/rules`;

  /**
   * List rules with optional filtering and pagination
   * @param params - Query parameters for filtering
   * @returns Observable of paginated rules
   */
  listRules(params: RuleListParams = {}): Observable<PaginatedResponse<Rule>> {
    let httpParams = new HttpParams();
    
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.teamId) httpParams = httpParams.set('teamId', params.teamId);
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<PaginatedResponse<Rule>>(this.baseUrl, { params: httpParams }).pipe(
      catchError(this.handleError('Failed to load rules'))
    );
  }

  /**
   * Get a single rule by ID
   * @param id - Rule identifier
   * @returns Observable of the rule
   */
  getRule(id: string): Observable<Rule> {
    return this.http.get<Rule>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError('Failed to load rule'))
    );
  }

  /**
   * Create a new rule
   * @param data - Rule creation data
   * @returns Observable of the created rule
   */
  createRule(data: CreateRuleDto): Observable<Rule> {
    return this.http.post<Rule>(this.baseUrl, data).pipe(
      catchError(this.handleError('Failed to create rule'))
    );
  }

  /**
   * Update an existing rule
   * @param id - Rule identifier
   * @param data - Rule update data
   * @returns Observable of the updated rule
   */
  updateRule(id: string, data: UpdateRuleDto): Observable<Rule> {
    return this.http.put<Rule>(`${this.baseUrl}/${id}`, data).pipe(
      catchError(this.handleError('Failed to update rule'))
    );
  }

  /**
   * Delete a rule
   * @param id - Rule identifier
   * @returns Observable that completes when deleted
   */
  deleteRule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError('Failed to delete rule'))
    );
  }

  /**
   * Evaluate a rule against provided context
   * @param id - Rule identifier
   * @param context - Evaluation context with user and data
   * @returns Observable of evaluation result
   */
  evaluateRule(id: string, context: EvaluationContext): Observable<EvaluationResult> {
    return this.http.post<EvaluationResult>(`${this.baseUrl}/${id}/evaluate`, context).pipe(
      catchError(this.handleError('Failed to evaluate rule'))
    );
  }

  /**
   * Activate a paused rule
   * @param id - Rule identifier
   * @returns Observable of the updated rule
   */
  activateRule(id: string): Observable<Rule> {
    return this.updateRule(id, { status: 'active' });
  }

  /**
   * Pause an active rule
   * @param id - Rule identifier
   * @returns Observable of the updated rule
   */
  pauseRule(id: string): Observable<Rule> {
    return this.updateRule(id, { status: 'paused' });
  }

  /**
   * Handle HTTP errors and convert to ServiceError
   * Note: Consider extracting this to a shared utility (e.g., http-error.util.ts)
   * if this pattern is reused across multiple services.
   */
  private handleError(defaultMessage: string) {
    return (error: unknown): Observable<never> => {
      console.error(`[RulesService] ${defaultMessage}:`, error);
      
      let message = defaultMessage;
      let code = 'UNKNOWN_ERROR';
      let status: number | undefined;

      if (error && typeof error === 'object' && 'status' in error) {
        const httpError = error as { status: number; error?: { message?: string; code?: string } };
        status = httpError.status;
        message = httpError.error?.message || defaultMessage;
        code = httpError.error?.code || `HTTP_${status}`;
      }

      return throwError(() => new ServiceError(message, code, status));
    };
  }
}
```

## Unit Test Template

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RulesService, Rule, ServiceError } from './rules.service';
import { API_CONFIG } from '../config/api.config';

describe('RulesService', () => {
  let service: RulesService;
  let httpMock: HttpTestingController;

  const mockRule: Rule = {
    id: 'rule-1',
    name: 'Test Rule',
    description: 'Test description',
    orgId: 'org-1',
    createdBy: 'user-1',
    conditions: [{ field: 'amount', operator: 'gte', value: 1000 }],
    actions: [{ type: 'bonus', params: { amount: 100 } }],
    status: 'active',
    effectiveFrom: '2024-01-01T00:00:00Z',
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RulesService]
    });
    service = TestBed.inject(RulesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list rules', () => {
    const mockResponse = { data: [mockRule], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } };

    service.listRules({ page: 1 }).subscribe(response => {
      expect(response.data.length).toBe(1);
      expect(response.data[0].name).toBe('Test Rule');
    });

    const req = httpMock.expectOne(req => req.url.includes('/rules'));
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get rule by id', () => {
    service.getRule('rule-1').subscribe(rule => {
      expect(rule.id).toBe('rule-1');
      expect(rule.name).toBe('Test Rule');
    });

    const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/rules/rule-1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRule);
  });

  it('should create rule', () => {
    const createData = {
      name: 'New Rule',
      conditions: [],
      actions: [],
      effectiveFrom: '2024-01-01T00:00:00Z'
    };

    service.createRule(createData).subscribe(rule => {
      expect(rule.name).toBe('Test Rule');
    });

    const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/rules`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(createData);
    req.flush(mockRule);
  });

  it('should handle errors', () => {
    service.getRule('invalid').subscribe({
      error: (error: ServiceError) => {
        expect(error).toBeInstanceOf(ServiceError);
        expect(error.code).toBe('HTTP_404');
      }
    });

    const req = httpMock.expectOne(`${API_CONFIG.baseUrl}/rules/invalid`);
    req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
  });
});
```

## Checklist

- [ ] Service created with proper typing
- [ ] All CRUD methods implemented
- [ ] Error handling with ServiceError
- [ ] JSDoc comments on all public methods
- [ ] Unit tests for all methods
- [ ] Unit tests for error cases
- [ ] Service exported from public-api.ts (if in core-services)
