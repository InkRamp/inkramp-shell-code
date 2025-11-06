/**
 * API Response Models
 * Data contracts matching the backend API
 */

/**
 * API Incentive Rule
 * Matches backend incentive-rules endpoint
 */
export interface ApiIncentiveRule {
  id: string;
  brandId: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'tiered';
  value: number;
  minSalesAmount?: number;
  maxSalesAmount?: number;
  productCategory?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string; // ISO date string from API
  updatedAt?: string;
}

/**
 * API Incentive
 * Matches backend incentives endpoint
 */
export interface ApiIncentive {
  id: string;
  brandId: string;
  userId: string;
  ruleId: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  earnedDate: string; // ISO date string
  approvedDate?: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * API Target
 * Matches backend targets endpoint
 */
export interface ApiTarget {
  id: string;
  brandId: string;
  userId: string;
  name: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string; // e.g., 'sales', 'revenue', 'customers'
  status: 'active' | 'completed' | 'cancelled' | 'overdue';
  startDate: string; // ISO date string
  endDate: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * API Task
 * Matches backend tasks endpoint
 */
export interface ApiTask {
  id: string;
  brandId: string;
  userId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string; // ISO date string
  completedDate?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * API User (for reference - Zitadel is primary source)
 * Matches backend users endpoint
 */
export interface ApiUser {
  id: string;
  brandId: string;
  email: string;
  name: string;
  role: string;
  teamId?: string;
  managerId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * API Error Response
 * Standard error format from API
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

/**
 * API List Response
 * Generic list response wrapper
 */
export interface ApiListResponse<T> {
  data: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

/**
 * API Single Item Response
 * Generic single item response wrapper
 */
export interface ApiResponse<T> {
  data: T;
}

/**
 * API Health Response
 */
export interface ApiHealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  brandId: string;
  version?: string;
}

/**
 * Create/Update Request Types
 */

export interface CreateIncentiveRuleRequest {
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'tiered';
  value: number;
  minSalesAmount?: number;
  maxSalesAmount?: number;
  productCategory?: string;
  isActive: boolean;
}

export interface UpdateIncentiveRuleRequest extends Partial<CreateIncentiveRuleRequest> {}

export interface CreateIncentiveRequest {
  userId: string;
  ruleId: string;
  amount: number;
  earnedDate: string;
  notes?: string;
}

export interface UpdateIncentiveRequest extends Partial<CreateIncentiveRequest> {
  status?: 'pending' | 'approved' | 'paid' | 'rejected';
}

export interface CreateTargetRequest {
  userId: string;
  name: string;
  description?: string;
  targetValue: number;
  unit: string;
  startDate: string;
  endDate: string;
}

export interface UpdateTargetRequest extends Partial<CreateTargetRequest> {
  currentValue?: number;
  status?: 'active' | 'completed' | 'cancelled' | 'overdue';
}

export interface CreateTaskRequest {
  userId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completedDate?: string;
}
