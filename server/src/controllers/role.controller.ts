import { Request, Response } from 'express';
import zitadelConfig from '../config/zitadel.config';
import { SYSTEM_ROLES, getSystemRoleById } from '../config/system-roles';
import { CreateRoleDto, UpdateRoleDto, Role } from '../models/entities';

/**
 * Controller for Role CRUD operations
 * Manages both system-wide roles (common to all orgs) and project-specific roles
 * Integrates with Zitadel for role management
 */
export class RoleController {
  /**
   * Get all roles (optionally filtered by project or system roles)
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, isSystemRole } = req.query;
      
      let roles: Role[] = [];

      if (projectId) {
        // Get project-specific roles
        if (zitadelConfig.isConfigured()) {
          const client = await zitadelConfig.getApiClient();
          const response = await client.get(`/management/v1/projects/${projectId}/roles/_search`);
          roles = response.data.result?.map((role: any) => ({
            id: role.key,
            name: role.key,
            description: role.displayName || '',
            permissions: [],
            isSystemRole: false,
            createdAt: new Date(role.details?.creationDate || Date.now()),
            updatedAt: new Date(role.details?.changeDate || Date.now()),
          })) || [];
        } else {
          // Return empty for project roles in mock mode
          roles = [];
        }
      } else {
        // Return system roles
        roles = SYSTEM_ROLES;

        if (isSystemRole === 'false') {
          roles = [];
        }
      }

      res.json({
        success: true,
        data: roles,
        total: roles.length,
      });
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch roles',
      });
    }
  }

  /**
   * Get role by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { projectId } = req.query;

      // Check if it's a system role first
      const systemRole = getSystemRoleById(id);
      if (systemRole) {
        res.json({
          success: true,
          data: systemRole,
        });
        return;
      }

      // Otherwise fetch from Zitadel project
      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'projectId is required for non-system roles',
        });
        return;
      }

      const client = await zitadelConfig.getApiClient();
      const response = await client.get(`/management/v1/projects/${projectId}/roles/${id}`);

      const role = response.data.role;
      const roleData: Role = {
        id: role.key,
        name: role.key,
        description: role.displayName || '',
        permissions: [],
        isSystemRole: false,
        createdAt: new Date(role.details?.creationDate || Date.now()),
        updatedAt: new Date(role.details?.changeDate || Date.now()),
      };

      res.json({
        success: true,
        data: roleData,
      });
    } catch (error: any) {
      console.error('Error fetching role:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to fetch role',
      });
    }
  }

  /**
   * Create new role in a project
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreateRoleDto = req.body;
      const { projectId } = req.query;

      if (dto.isSystemRole) {
        res.status(400).json({
          success: false,
          error: 'System roles cannot be created via API',
        });
        return;
      }

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'projectId is required to create a role',
        });
        return;
      }

      const client = await zitadelConfig.getApiClient();
      const response = await client.post(`/management/v1/projects/${projectId}/roles`, {
        roleKey: dto.name,
        displayName: dto.description || dto.name,
      });

      const role = response.data;
      const roleData: Role = {
        id: dto.name,
        name: dto.name,
        description: dto.description || '',
        permissions: dto.permissions || [],
        isSystemRole: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      res.status(201).json({
        success: true,
        data: roleData,
        message: 'Role created successfully',
      });
    } catch (error: any) {
      console.error('Error creating role:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to create role',
      });
    }
  }

  /**
   * Update role
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto: UpdateRoleDto = req.body;
      const { projectId } = req.query;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'projectId is required to update a role',
        });
        return;
      }

      const client = await zitadelConfig.getApiClient();
      await client.put(`/management/v1/projects/${projectId}/roles/${id}`, {
        displayName: dto.description || dto.name,
      });

      const roleData: Role = {
        id: id,
        name: dto.name || id,
        description: dto.description || '',
        permissions: dto.permissions || [],
        isSystemRole: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      res.json({
        success: true,
        data: roleData,
        message: 'Role updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating role:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to update role',
      });
    }
  }

  /**
   * Delete role from project
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { projectId } = req.query;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'projectId is required to delete a role',
        });
        return;
      }

      const client = await zitadelConfig.getApiClient();
      await client.delete(`/management/v1/projects/${projectId}/roles/${id}`);

      res.json({
        success: true,
        message: 'Role deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting role:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to delete role',
      });
    }
  }
}
