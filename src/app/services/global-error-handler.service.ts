import { ErrorHandler, Injectable, inject } from '@angular/core';

/**
 * Global Error Handler Service
 * Catches unhandled errors throughout the application
 * Provides graceful error handling for MFE failures
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  
  handleError(error: Error | any): void {
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;
    const jitCompilerMessage = /JIT compiler unavailable/;
    const mfeLoadingMessage = /Error loading MFE/;
    
    // Check if this is a known recoverable error
    const isChunkError = chunkFailedMessage.test(error?.message || '');
    const isJitError = jitCompilerMessage.test(error?.message || '');
    const isMfeError = mfeLoadingMessage.test(error?.message || '');
    
    if (isChunkError) {
      console.error('[GlobalErrorHandler] Chunk loading failed. This is likely a network issue or the chunk was not found.', error);
      // You could show a user-friendly notification here
      this.notifyUser('Failed to load a component. Please refresh the page or check your internet connection.');
    } else if (isJitError) {
      console.error('[GlobalErrorHandler] JIT compiler error detected. This usually means a component is trying to compile at runtime.', error);
      console.error('[GlobalErrorHandler] Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      this.notifyUser('A component failed to load properly. The page may not work as expected.');
    } else if (isMfeError) {
      console.error('[GlobalErrorHandler] MFE loading error:', error);
      // MFE errors are already handled by the error boundary, just log them
    } else {
      // Log all other errors with full details
      console.error('[GlobalErrorHandler] Unhandled error:', error);
      console.error('[GlobalErrorHandler] Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
    }
  }
  
  /**
   * Notify user of error (placeholder for toast/notification system)
   */
  private notifyUser(message: string): void {
    // TODO: Integrate with a notification/toast service when available
    console.warn('[GlobalErrorHandler] User notification:', message);
    
    // For now, use a simple alert (can be replaced with better UI)
    if (typeof window !== 'undefined') {
      // Don't block the UI with alerts, just log
      console.warn('[User Notification]', message);
    }
  }
}
