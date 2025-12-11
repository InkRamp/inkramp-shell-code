/**
 * Production Environment Configuration
 * This file will be replaced during build with values from GitHub secrets/variables
 * The API_BASE_URL placeholder will be replaced by the build process
 */
export const environment = {
  production: true,
  apiBaseUrl: '#{API_BASE_URL}#'
};
