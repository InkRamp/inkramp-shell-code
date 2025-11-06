/**
 * Validation utilities for sanitizing user inputs
 */

/**
 * Validates and sanitizes an ID parameter
 * Ensures it contains only safe characters
 */
export function sanitizeId(id: string): string {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid ID format');
  }
  
  // Allow alphanumeric, hyphens, and underscores only
  const sanitized = id.replace(/[^a-zA-Z0-9\-_]/g, '');
  
  if (sanitized !== id) {
    throw new Error('ID contains invalid characters');
  }
  
  if (sanitized.length === 0 || sanitized.length > 100) {
    throw new Error('ID length must be between 1 and 100 characters');
  }
  
  return sanitized;
}

/**
 * Validates query parameter
 */
export function sanitizeQueryParam(param: any): string {
  if (!param) {
    return '';
  }
  
  const str = String(param);
  
  // Remove any potentially dangerous characters
  return str.replace(/[<>\"'&]/g, '');
}

/**
 * Validates a project or organization ID from query/path params
 */
export function validateEntityId(id: any, entityName: string = 'Entity'): string {
  if (!id) {
    throw new Error(`${entityName} ID is required`);
  }
  
  return sanitizeId(String(id));
}
