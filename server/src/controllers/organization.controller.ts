import { Request, Response } from 'express';
import zitadelConfig from '../config/zitadel.config';
import { CreateOrganizationDto, UpdateOrganizationDto, Organization } from '../models/entities';

/**
 * Controller for Organization CRUD operations
 * Integrates with Zitadel for organization management
 */
export class OrganizationController {
  /**
   * Get all organizations
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const client = await zitadelConfig.getApiClient();
      const response = await client.post('/management/v1/orgs/_search', {
        queries: [],
      });

      const organizations: Organization[] = response.data.result.map((org: any) => ({
        id: org.id,
        name: org.name,
        displayName: org.name,
        primaryDomain: org.primaryDomain || '',
        createdAt: new Date(org.details.creationDate),
        updatedAt: new Date(org.details.changeDate),
      }));

      res.json({
        success: true,
        data: organizations,
        total: organizations.length,
      });
    } catch (error: any) {
      console.error('Error fetching organizations:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch organizations',
      });
    }
  }

  /**
   * Get organization by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const client = await zitadelConfig.getApiClient();
      const response = await client.get(`/management/v1/orgs/${id}`);

      const org = response.data.org;
      const organization: Organization = {
        id: org.id,
        name: org.name,
        displayName: org.name,
        primaryDomain: org.primaryDomain || '',
        createdAt: new Date(org.details.creationDate),
        updatedAt: new Date(org.details.changeDate),
      };

      res.json({
        success: true,
        data: organization,
      });
    } catch (error: any) {
      console.error('Error fetching organization:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to fetch organization',
      });
    }
  }

  /**
   * Create new organization
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreateOrganizationDto = req.body;
      const client = await zitadelConfig.getApiClient();
      
      const response = await client.post('/admin/v1/orgs', {
        name: dto.name,
      });

      const org = response.data.org;
      const organization: Organization = {
        id: org.id,
        name: org.name,
        displayName: dto.displayName || org.name,
        primaryDomain: dto.primaryDomain || '',
        createdAt: new Date(org.details.creationDate),
        updatedAt: new Date(org.details.changeDate),
      };

      res.status(201).json({
        success: true,
        data: organization,
        message: 'Organization created successfully',
      });
    } catch (error: any) {
      console.error('Error creating organization:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to create organization',
      });
    }
  }

  /**
   * Update organization
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto: UpdateOrganizationDto = req.body;
      const client = await zitadelConfig.getApiClient();

      const response = await client.put(`/management/v1/orgs/${id}`, {
        name: dto.name,
      });

      const org = response.data.org;
      const organization: Organization = {
        id: org.id,
        name: org.name,
        displayName: dto.displayName || org.name,
        primaryDomain: dto.primaryDomain || org.primaryDomain || '',
        createdAt: new Date(org.details.creationDate),
        updatedAt: new Date(org.details.changeDate),
      };

      res.json({
        success: true,
        data: organization,
        message: 'Organization updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating organization:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to update organization',
      });
    }
  }

  /**
   * Delete organization
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const client = await zitadelConfig.getApiClient();

      await client.delete(`/admin/v1/orgs/${id}`);

      res.json({
        success: true,
        message: 'Organization deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting organization:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to delete organization',
      });
    }
  }
}
