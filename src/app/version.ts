/**
 * Application version and build information
 * 
 * This file provides version info loaded from build-info.json which is updated
 * during CI/CD deployment. Falls back to defaults if the file is unavailable.
 */

interface BuildInfo {
  version: string;
  buildNumber: string;
  buildDate: string;
  environment: string;
}

// Default values when build-info.json is unavailable
const DEFAULT_BUILD_INFO: BuildInfo = {
  version: '0.0.0',
  buildNumber: '0',
  buildDate: '',
  environment: 'development'
};

// Cached build info
let cachedBuildInfo: BuildInfo | null = null;

/**
 * Load build info from assets/build-info.json
 * This is called asynchronously and caches the result
 * Uses document.baseURI to handle different base paths across environments
 */
export async function loadBuildInfo(): Promise<BuildInfo> {
  if (cachedBuildInfo) {
    return cachedBuildInfo;
  }

  try {
    // Use relative path from base URI to handle different deployment paths
    const baseUri = typeof document !== 'undefined' ? document.baseURI : '/';
    const buildInfoUrl = new URL('assets/build-info.json', baseUri).href;
    
    const response = await fetch(buildInfoUrl);
    if (!response.ok) {
      console.warn('[Version] build-info.json not found, using defaults');
      cachedBuildInfo = DEFAULT_BUILD_INFO;
      return cachedBuildInfo;
    }
    const data = await response.json();
    cachedBuildInfo = {
      version: data?.version ?? DEFAULT_BUILD_INFO.version,
      buildNumber: data?.buildNumber ?? DEFAULT_BUILD_INFO.buildNumber,
      buildDate: data?.buildDate ?? DEFAULT_BUILD_INFO.buildDate,
      environment: data?.environment ?? DEFAULT_BUILD_INFO.environment
    };
    return cachedBuildInfo;
  } catch (error) {
    console.warn('[Version] Failed to load build-info.json, using defaults:', error);
    cachedBuildInfo = DEFAULT_BUILD_INFO;
    return cachedBuildInfo;
  }
}

/**
 * Get cached build info synchronously
 * Returns defaults if not yet loaded
 */
export function getBuildInfo(): BuildInfo {
  return cachedBuildInfo ?? DEFAULT_BUILD_INFO;
}

// Export for backward compatibility
export const APP_VERSION = DEFAULT_BUILD_INFO;
