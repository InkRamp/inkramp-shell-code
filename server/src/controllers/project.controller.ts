import { Request, Response } from 'express';
import zitadelConfig from '../config/zitadel.config';
import { CreateProjectDto, UpdateProjectDto, Project } from '../models/entities';

/**
 * Controller for Project CRUD operations
 * Integrates with Zitadel for project management
 */
export class ProjectController {
  /**
   * Get all projects (optionally filtered by organization)
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { organizationId } = req.query;
      const client = await zitadelConfig.getApiClient();
      
      const response = await client.post('/management/v1/projects/_search', {
        queries: organizationId ? [
          {
            nameQuery: {
              name: '',
              method: 'TEXT_QUERY_METHOD_CONTAINS',
            }
          }
        ] : [],
      });

      const projects: Project[] = response.data.result?.map((project: any) => ({
        id: project.id,
        name: project.name,
        organizationId: project.resourceOwner || organizationId || '',
        roleIds: [], // Will be populated separately
        createdAt: new Date(project.details?.creationDate || Date.now()),
        updatedAt: new Date(project.details?.changeDate || Date.now()),
      })) || [];

      res.json({
        success: true,
        data: projects,
        total: projects.length,
      });
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch projects',
      });
    }
  }

  /**
   * Get project by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const client = await zitadelConfig.getApiClient();
      const response = await client.get(`/management/v1/projects/${id}`);

      const project = response.data.project;
      
      // Fetch roles for this project
      let roleIds: string[] = [];
      try {
        const rolesResponse = await client.get(`/management/v1/projects/${id}/roles/_search`);
        roleIds = rolesResponse.data.result?.map((role: any) => role.key) || [];
      } catch (e) {
        console.warn('Could not fetch project roles:', e);
      }

      const projectData: Project = {
        id: project.id,
        name: project.name,
        organizationId: project.resourceOwner || '',
        roleIds: roleIds,
        createdAt: new Date(project.details?.creationDate || Date.now()),
        updatedAt: new Date(project.details?.changeDate || Date.now()),
      };

      res.json({
        success: true,
        data: projectData,
      });
    } catch (error: any) {
      console.error('Error fetching project:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to fetch project',
      });
    }
  }

  /**
   * Create new project
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreateProjectDto = req.body;
      const client = await zitadelConfig.getApiClient();
      
      const response = await client.post('/management/v1/projects', {
        name: dto.name,
        projectRoleAssertion: true,
        projectRoleCheck: true,
      });

      const project = response.data;
      const projectData: Project = {
        id: project.id,
        name: dto.name,
        organizationId: dto.organizationId,
        roleIds: dto.roleIds || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add roles to the project if provided
      if (dto.roleIds && dto.roleIds.length > 0) {
        for (const roleId of dto.roleIds) {
          try {
            await client.post(`/management/v1/projects/${project.id}/roles`, {
              roleKey: roleId,
              displayName: roleId,
            });
          } catch (e) {
            console.warn(`Could not add role ${roleId} to project:`, e);
          }
        }
      }

      res.status(201).json({
        success: true,
        data: projectData,
        message: 'Project created successfully',
      });
    } catch (error: any) {
      console.error('Error creating project:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to create project',
      });
    }
  }

  /**
   * Update project
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto: UpdateProjectDto = req.body;
      const client = await zitadelConfig.getApiClient();

      if (dto.name) {
        await client.put(`/management/v1/projects/${id}`, {
          name: dto.name,
        });
      }

      // Fetch updated project
      const response = await client.get(`/management/v1/projects/${id}`);
      const project = response.data.project;

      const projectData: Project = {
        id: project.id,
        name: project.name,
        organizationId: project.resourceOwner || '',
        roleIds: dto.roleIds || [],
        createdAt: new Date(project.details?.creationDate || Date.now()),
        updatedAt: new Date(),
      };

      res.json({
        success: true,
        data: projectData,
        message: 'Project updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating project:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to update project',
      });
    }
  }

  /**
   * Delete project
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const client = await zitadelConfig.getApiClient();

      await client.delete(`/management/v1/projects/${id}`);

      res.json({
        success: true,
        message: 'Project deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting project:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to delete project',
      });
    }
  }

  /**
   * Add role to project
   */
  async addRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { roleKey, displayName } = req.body;
      const client = await zitadelConfig.getApiClient();

      await client.post(`/management/v1/projects/${id}/roles`, {
        roleKey,
        displayName: displayName || roleKey,
      });

      res.json({
        success: true,
        message: 'Role added to project successfully',
      });
    } catch (error: any) {
      console.error('Error adding role to project:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to add role to project',
      });
    }
  }

  /**
   * Remove role from project
   */
  async removeRole(req: Request, res: Response): Promise<void> {
    try {
      const { id, roleId } = req.params;
      const client = await zitadelConfig.getApiClient();

      await client.delete(`/management/v1/projects/${id}/roles/${roleId}`);

      res.json({
        success: true,
        message: 'Role removed from project successfully',
      });
    } catch (error: any) {
      console.error('Error removing role from project:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to remove role from project',
      });
    }
  }
}
