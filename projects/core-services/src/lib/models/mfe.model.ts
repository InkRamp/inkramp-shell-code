import { UserRole } from './roles.model';

/**
 * MFE configuration with metadata
 */
export interface MfeConfig {
  id: string;
  name: string;
  displayName: string;
  remoteName: string;
  exposedModule: string;
  url: string;
  route: string;
  allowedRoles: UserRole[];
  priority: number; // Higher number = higher priority (load first)
  icon?: string;
}
