import { TestBed } from '@angular/core/testing';
import { GlobalErrorHandler } from './global-error-handler.service';

describe('GlobalErrorHandler', () => {
  let service: GlobalErrorHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlobalErrorHandler]
    });
    service = TestBed.inject(GlobalErrorHandler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle chunk loading errors', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    const error = new Error('Loading chunk 123 failed');
    
    service.handleError(error);
    
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.calls.argsFor(0)[0]).toContain('Chunk loading failed');
  });

  it('should handle JIT compiler errors', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    const error = new Error('JIT compiler unavailable');
    
    service.handleError(error);
    
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.calls.argsFor(0)[0]).toContain('JIT compiler error detected');
  });

  it('should handle MFE loading errors', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    const error = new Error('Error loading MFE users-crud');
    
    service.handleError(error);
    
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should handle generic errors', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    const error = new Error('Some random error');
    
    service.handleError(error);
    
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should not crash on null/undefined errors', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    
    expect(() => service.handleError(null)).not.toThrow();
    expect(() => service.handleError(undefined)).not.toThrow();
    
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
