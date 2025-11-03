/**
 * API Configuration
 * Centralized configuration for API endpoints
 * Makes it easy to switch between environments and prepare for GraphQL migration
 */

export interface ApiConfig {
  baseUrl: string;
  version?: string;
  timeout?: number;
}

/**
 * Default API configuration
 * Update baseUrl when deploying to different environments
 */
export const API_CONFIG: ApiConfig = {
  baseUrl: 'https://7f1m8qlvpd.execute-api.us-east-1.amazonaws.com/db',
  timeout: 30000 // 30 seconds
};

/**
 * API endpoints configuration
 * Centralized endpoint paths for easy maintenance
 */
export const API_ENDPOINTS = {
  health: (brandId: string) => `/health?brandId=${brandId}`,
  info: '/',
  
  // Data Management
  seed: (brandId: string) => `/seed/${brandId}`,
  clearData: (brandId: string) => `/data/${brandId}`,
  
  // Users (kept for reference, but Zitadel is primary source)
  users: {
    list: (brandId: string) => `/users/${brandId}`,
    getById: (brandId: string, userId: string) => `/users/${brandId}/${userId}`,
    create: (brandId: string) => `/users/${brandId}`
  },
  
  // Incentive Rules
  incentiveRules: {
    list: (brandId: string) => `/incentive-rules/${brandId}`,
    getById: (brandId: string, ruleId: string) => `/incentive-rules/${brandId}/${ruleId}`,
    create: (brandId: string) => `/incentive-rules/${brandId}`,
    update: (brandId: string, ruleId: string) => `/incentive-rules/${brandId}/${ruleId}`,
    delete: (brandId: string, ruleId: string) => `/incentive-rules/${brandId}/${ruleId}`
  },
  
  // Incentives
  incentives: {
    list: (brandId: string, params?: { userId?: string; status?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.status) queryParams.append('status', params.status);
      const query = queryParams.toString();
      return `/incentives/${brandId}${query ? '?' + query : ''}`;
    },
    getById: (brandId: string, incentiveId: string) => `/incentives/${brandId}/${incentiveId}`,
    create: (brandId: string) => `/incentives/${brandId}`,
    update: (brandId: string, incentiveId: string) => `/incentives/${brandId}/${incentiveId}`
  },
  
  // Targets
  targets: {
    list: (brandId: string, params?: { userId?: string; status?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.status) queryParams.append('status', params.status);
      const query = queryParams.toString();
      return `/targets/${brandId}${query ? '?' + query : ''}`;
    },
    getById: (brandId: string, targetId: string) => `/targets/${brandId}/${targetId}`,
    create: (brandId: string) => `/targets/${brandId}`,
    update: (brandId: string, targetId: string) => `/targets/${brandId}/${targetId}`,
    delete: (brandId: string, targetId: string) => `/targets/${brandId}/${targetId}`
  },
  
  // Tasks
  tasks: {
    list: (brandId: string, params?: { userId?: string; status?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.status) queryParams.append('status', params.status);
      const query = queryParams.toString();
      return `/tasks/${brandId}${query ? '?' + query : ''}`;
    },
    getById: (brandId: string, taskId: string) => `/tasks/${brandId}/${taskId}`,
    create: (brandId: string) => `/tasks/${brandId}`,
    update: (brandId: string, taskId: string) => `/tasks/${brandId}/${taskId}`,
    delete: (brandId: string, taskId: string) => `/tasks/${brandId}/${taskId}`
  }
} as const;

/**
 * Get full API URL
 * @param endpoint - API endpoint path
 * @param config - Optional API configuration override
 * @returns Full API URL
 */
export const getApiUrl = (endpoint: string, config: ApiConfig = API_CONFIG): string => {
  return `${config.baseUrl}${endpoint}`;
};

/**
 * Update API configuration
 * Useful for switching environments or updating endpoint
 * @param newConfig - Partial configuration to update
 */
export const updateApiConfig = (newConfig: Partial<ApiConfig>): void => {
  Object.assign(API_CONFIG, newConfig);
};
