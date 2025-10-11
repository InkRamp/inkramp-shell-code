import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { MfeConfig } from '../models/mfe.model';
import { UserRole } from '../models/roles.model';

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

  constructor() {}

  /**
   * Set MFE configurations
   * @param configs Array of MFE configurations
   */
  setConfigs(configs: MfeConfig[]): void {
    this.mfeConfigs = configs.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get all MFE configurations
   * @returns Array of MFE configurations
   */
  getConfigs(): MfeConfig[] {
    return this.mfeConfigs;
  }

  /**
   * Get MFE configurations filtered by allowed roles
   * @param userRole Current user's role
   * @returns Filtered MFE configurations
   */
  getConfigsForRole(userRole: UserRole): MfeConfig[] {
    return this.mfeConfigs.filter(config => 
      config.allowedRoles.includes(userRole)
    );
  }

  /**
   * Get MFE configuration by name
   * @param name MFE name
   * @returns MFE configuration or undefined
   */
  getConfigByName(name: string): MfeConfig | undefined {
    return this.mfeConfigs.find(config => config.name === name);
  }

  /**
   * Preload high-priority MFEs
   * @param userRole Current user's role
   * @returns Promise that resolves when preloading is complete
   */
  async preloadPriorityMfes(userRole: UserRole): Promise<void> {
    const allowedConfigs = this.getConfigsForRole(userRole);
    const priorityConfigs = allowedConfigs.filter(config => config.priority >= 5);

    const loadPromises = priorityConfigs.map(config => this.loadMfe(config));
    await Promise.all(loadPromises);
  }

  /**
   * Load a specific MFE
   * @param config MFE configuration
   * @returns Promise that resolves to the loaded module
   */
  async loadMfe(config: MfeConfig): Promise<any> {
    const loadingMfes = this.loadingMfesSubject.value;
    const loadedMfes = this.loadedMfesSubject.value;

    // Check if already loaded
    if (loadedMfes.has(config.name)) {
      console.log(`[MfeLoaderService] MFE ${config.name} already loaded`);
      return;
    }

    // Check if already loading
    if (loadingMfes.has(config.name)) {
      console.log(`[MfeLoaderService] MFE ${config.name} is already loading`);
      return;
    }

    try {
      // Mark as loading
      const newLoadingMfes = new Set(loadingMfes);
      newLoadingMfes.add(config.name);
      this.loadingMfesSubject.next(newLoadingMfes);

      console.log(`[MfeLoaderService] Loading MFE ${config.name} (priority: ${config.priority})`);

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
      const updatedLoadingMfes = new Set(loadingMfes);
      updatedLoadingMfes.delete(config.name);
      this.loadingMfesSubject.next(updatedLoadingMfes);

      console.log(`[MfeLoaderService] Successfully loaded MFE ${config.name}`);
      return module;
    } catch (error) {
      console.error(`[MfeLoaderService] Error loading MFE ${config.name}:`, error);

      // Remove from loading on error
      const updatedLoadingMfes = new Set(loadingMfes);
      updatedLoadingMfes.delete(config.name);
      this.loadingMfesSubject.next(updatedLoadingMfes);

      throw error;
    }
  }

  /**
   * Check if MFE is loaded
   * @param name MFE name
   * @returns true if loaded
   */
  isMfeLoaded(name: string): boolean {
    return this.loadedMfesSubject.value.has(name);
  }

  /**
   * Check if MFE is loading
   * @param name MFE name
   * @returns true if loading
   */
  isMfeLoading(name: string): boolean {
    return this.loadingMfesSubject.value.has(name);
  }
}
