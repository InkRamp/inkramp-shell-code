import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { MfeConfig } from './models/mfe.model';
import { UserRole } from './models/roles.model';

/**
 * Service to manage MFE loading with priority support
 */
@Injectable({
  providedIn: 'root'
})
export class MfeLoaderService {
  private mfeConfigs: MfeConfig[] = [];
  private loadedMfesSubject = new BehaviorSubject<Set<string>>(new Set());
  public loadedMfes$: Observable<Set<string>> = this.loadedMfesSubject.asObservable();

  private loadingMfesSubject = new BehaviorSubject<Set<string>>(new Set());
  public loadingMfes$: Observable<Set<string>> = this.loadingMfesSubject.asObservable();

  constructor() {
    // DEBUG_LOG: MfeLoaderService initialized
    console.log('[MfeLoaderService] Service initialized');
  }

  /**
   * Set MFE configurations
   * @param configs Array of MFE configurations
   */
  setConfigs(configs: MfeConfig[]): void {
    // DEBUG_LOG: Setting MFE configurations
    console.log('[MfeLoaderService] setConfigs() called with', configs.length, 'configurations');
    this.mfeConfigs = configs.sort((a, b) => b.priority - a.priority);
    // DEBUG_LOG: Configurations sorted by priority
    console.log('[MfeLoaderService] Configurations sorted by priority:', 
      this.mfeConfigs.map(c => ({ name: c.name, priority: c.priority })));
  }

  /**
   * Get all MFE configurations
   * @returns Array of MFE configurations
   */
  getConfigs(): MfeConfig[] {
    // DEBUG_LOG: Getting all MFE configurations
    console.log('[MfeLoaderService] getConfigs() called, returning', this.mfeConfigs.length, 'configurations');
    return this.mfeConfigs;
  }

  /**
   * Get MFE configurations filtered by allowed roles
   * @param userRole Current user's role
   * @returns Filtered MFE configurations
   */
  getConfigsForRole(userRole: UserRole): MfeConfig[] {
    // DEBUG_LOG: Getting MFE configs for role
    console.log('[MfeLoaderService] getConfigsForRole() called for role:', userRole);
    const configs = this.mfeConfigs.filter(config => 
      config.allowedRoles.includes(userRole)
    );
    // DEBUG_LOG: Configs filtered by role
    console.log('[MfeLoaderService] Found', configs.length, 'configurations for role:', userRole,
      configs.map(c => c.name));
    return configs;
  }

  /**
   * Get MFE configuration by name
   * @param name MFE name
   * @returns MFE configuration or undefined
   */
  getConfigByName(name: string): MfeConfig | undefined {
    // DEBUG_LOG: Getting MFE config by name
    console.log('[MfeLoaderService] getConfigByName() called for:', name);
    const config = this.mfeConfigs.find(config => config.name === name);
    // DEBUG_LOG: Config found or not
    if (config) {
      console.log('[MfeLoaderService] Found configuration for:', name);
    } else {
      console.warn('[MfeLoaderService] Configuration not found for:', name);
    }
    return config;
  }

  /**
   * Preload high-priority MFEs
   * @param userRole Current user's role
   * @returns Promise that resolves when preloading is complete
   */
  async preloadPriorityMfes(userRole: UserRole): Promise<void> {
    // DEBUG_LOG: Preloading priority MFEs
    console.log('[MfeLoaderService] preloadPriorityMfes() called for role:', userRole);
    const allowedConfigs = this.getConfigsForRole(userRole);
    const priorityConfigs = allowedConfigs.filter(config => config.priority >= 5);
    
    // DEBUG_LOG: Priority MFEs to preload
    console.log('[MfeLoaderService] Preloading', priorityConfigs.length, 'priority MFEs:',
      priorityConfigs.map(c => ({ name: c.name, priority: c.priority })));

    // Use Promise.allSettled to continue even if some MFEs fail
    const loadPromises = priorityConfigs.map(config => this.loadMfe(config));
    const results = await Promise.allSettled(loadPromises);
    
    // Log results
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    // DEBUG_LOG: Preloading complete
    console.log('[MfeLoaderService] Preloading complete:', {
      total: priorityConfigs.length,
      successful,
      failed
    });
    
    if (failed > 0) {
      console.warn(`[MfeLoaderService] ${failed} MFE(s) failed to preload, but application continues`);
    }
  }

  /**
   * Load a specific MFE
   * @param config MFE configuration
   * @returns Promise that resolves to the loaded module, or null if loading fails
   * @description On error, returns null instead of throwing to allow other MFEs to continue loading
   */
  async loadMfe(config: MfeConfig): Promise<any> {
    const loadingMfes = this.loadingMfesSubject.value;
    const loadedMfes = this.loadedMfesSubject.value;

    // Check if already loaded
    if (loadedMfes.has(config.name)) {
      // DEBUG_LOG: MFE already loaded
      console.log(`[MfeLoaderService] MFE ${config.name} already loaded`);
      return;
    }

    // Check if already loading
    if (loadingMfes.has(config.name)) {
      // DEBUG_LOG: MFE already loading
      console.log(`[MfeLoaderService] MFE ${config.name} is already loading`);
      return;
    }

    try {
      // Mark as loading
      const newLoadingMfes = new Set(loadingMfes);
      newLoadingMfes.add(config.name);
      this.loadingMfesSubject.next(newLoadingMfes);

      // DEBUG_LOG: Starting MFE load
      console.log(`[MfeLoaderService] Loading MFE ${config.name} (priority: ${config.priority})`);
      console.log(`[MfeLoaderService] MFE config:`, {
        name: config.name,
        url: config.url,
        exposedModule: config.exposedModule,
        remoteName: config.remoteName
      });

      const module = await loadRemoteModule({
        type: 'module',
        remoteEntry: config.url,
        exposedModule: config.exposedModule
      });

      // Mark as loaded
      const newLoadedMfes = new Set(loadedMfes);
      newLoadedMfes.add(config.name);
      this.loadedMfesSubject.next(newLoadedMfes);

      // Remove from loading
      const updatedLoadingMfes = new Set(this.loadingMfesSubject.value);
      updatedLoadingMfes.delete(config.name);
      this.loadingMfesSubject.next(updatedLoadingMfes);

      // DEBUG_LOG: MFE loaded successfully
      console.log(`[MfeLoaderService] Successfully loaded MFE ${config.name}`);
      console.log(`[MfeLoaderService] Currently loaded MFEs:`, Array.from(this.loadedMfesSubject.value));
      return module;
    } catch (error) {
      // DEBUG_LOG: Error loading MFE
      console.error(`[MfeLoaderService] Error loading MFE ${config.name}:`, error);
      console.error(`[MfeLoaderService] Failed config:`, {
        name: config.name,
        url: config.url,
        exposedModule: config.exposedModule
      });

      // Remove from loading on error
      const updatedLoadingMfes = new Set(this.loadingMfesSubject.value);
      updatedLoadingMfes.delete(config.name);
      this.loadingMfesSubject.next(updatedLoadingMfes);

      // Don't re-throw the error - allow other MFEs to continue loading
      console.warn(`[MfeLoaderService] MFE ${config.name} failed to load, but continuing with other MFEs`);
      return null;
    }
  }

  /**
   * Check if MFE is loaded
   * @param name MFE name
   * @returns true if loaded
   */
  isMfeLoaded(name: string): boolean {
    const isLoaded = this.loadedMfesSubject.value.has(name);
    // DEBUG_LOG: Checking if MFE is loaded
    console.log(`[MfeLoaderService] isMfeLoaded(${name}):`, isLoaded);
    return isLoaded;
  }

  /**
   * Check if MFE is loading
   * @param name MFE name
   * @returns true if loading
   */
  isMfeLoading(name: string): boolean {
    const isLoading = this.loadingMfesSubject.value.has(name);
    // DEBUG_LOG: Checking if MFE is loading
    console.log(`[MfeLoaderService] isMfeLoading(${name}):`, isLoading);
    return isLoading;
  }
}
