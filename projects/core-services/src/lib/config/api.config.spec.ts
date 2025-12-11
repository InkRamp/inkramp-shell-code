import { API_CONFIG, getApiConfig, updateApiConfig } from './api.config';

describe('API Configuration', () => {
  const originalBaseUrl = API_CONFIG.baseUrl;

  afterEach(() => {
    // Reset to original URL after each test
    updateApiConfig({ baseUrl: originalBaseUrl });
  });

  it('should have a default base URL', () => {
    expect(API_CONFIG.baseUrl).toBeTruthy();
    expect(typeof API_CONFIG.baseUrl).toBe('string');
  });

  it('should return the same config object from getApiConfig()', () => {
    const config = getApiConfig();
    expect(config).toBe(API_CONFIG);
  });

  it('should update the base URL when updateApiConfig is called', () => {
    const testUrl = 'https://test-api.example.com';
    
    updateApiConfig({ baseUrl: testUrl });
    
    expect(API_CONFIG.baseUrl).toBe(testUrl);
    expect(getApiConfig().baseUrl).toBe(testUrl);
  });

  it('should maintain object reference after update', () => {
    const configBefore = API_CONFIG;
    const testUrl = 'https://another-test-api.example.com';
    
    updateApiConfig({ baseUrl: testUrl });
    
    // The object reference should be the same
    expect(API_CONFIG).toBe(configBefore);
    // But the value should be updated
    expect(API_CONFIG.baseUrl).toBe(testUrl);
  });

  it('should allow partial updates', () => {
    const initialUrl = API_CONFIG.baseUrl;
    const testUrl = 'https://partial-update-test.com';
    
    updateApiConfig({ baseUrl: testUrl });
    
    expect(API_CONFIG.baseUrl).toBe(testUrl);
    
    // Verify we can update back
    updateApiConfig({ baseUrl: initialUrl });
    expect(API_CONFIG.baseUrl).toBe(initialUrl);
  });
});
