import { Request, Response } from 'express';
import zitadelConfig from '../config/zitadel.config';
import { CreateUserDto, UpdateUserDto, User } from '../models/entities';

/**
 * Controller for User CRUD operations
 * Integrates with Zitadel for user management
 * Relationship: Organization (1) -> Users (n)
 */
export class UserController {
  /**
   * Get all users (optionally filtered by organization)
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { organizationId } = req.query;
      const client = await zitadelConfig.getApiClient();
      
      const response = await client.post('/management/v1/users/_search', {
        queries: organizationId ? [
          {
            orgIdQuery: {
              orgId: organizationId
            }
          }
        ] : [],
      });

      const users: User[] = response.data.result.map((user: any) => ({
        id: user.id,
        userName: user.userName,
        email: user.email || user.preferredLoginName,
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        displayName: user.profile?.displayName || user.userName,
        organizationId: user.details?.resourceOwner || '',
        roleIds: [], // Will be populated separately if needed
        teamId: undefined,
        isActive: user.state === 'USER_STATE_ACTIVE',
        createdAt: new Date(user.details?.creationDate || Date.now()),
        updatedAt: new Date(user.details?.changeDate || Date.now()),
      }));

      res.json({
        success: true,
        data: users,
        total: users.length,
      });
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch users',
      });
    }
  }

  /**
   * Get user by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const client = await zitadelConfig.getApiClient();
      const response = await client.get(`/management/v1/users/${id}`);

      const user = response.data.user;
      const userData: User = {
        id: user.id,
        userName: user.userName,
        email: user.email || user.preferredLoginName,
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        displayName: user.profile?.displayName || user.userName,
        organizationId: user.details?.resourceOwner || '',
        roleIds: [],
        teamId: undefined,
        isActive: user.state === 'USER_STATE_ACTIVE',
        createdAt: new Date(user.details?.creationDate || Date.now()),
        updatedAt: new Date(user.details?.changeDate || Date.now()),
      };

      res.json({
        success: true,
        data: userData,
      });
    } catch (error: any) {
      console.error('Error fetching user:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to fetch user',
      });
    }
  }

  /**
   * Create new user
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreateUserDto = req.body;
      const client = await zitadelConfig.getApiClient();
      
      const response = await client.post('/management/v1/users/human', {
        userName: dto.userName,
        profile: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          displayName: `${dto.firstName} ${dto.lastName}`,
        },
        email: {
          email: dto.email,
          isEmailVerified: false,
        },
        password: dto.password ? {
          password: dto.password,
          changeRequired: true,
        } : undefined,
      });

      const user = response.data;
      const userData: User = {
        id: user.userId,
        userName: dto.userName,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        displayName: `${dto.firstName} ${dto.lastName}`,
        organizationId: dto.organizationId,
        roleIds: dto.roleIds || [],
        teamId: dto.teamId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      res.status(201).json({
        success: true,
        data: userData,
        message: 'User created successfully',
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to create user',
      });
    }
  }

  /**
   * Update user
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto: UpdateUserDto = req.body;
      const client = await zitadelConfig.getApiClient();

      // Update user profile
      if (dto.firstName || dto.lastName) {
        await client.put(`/management/v1/users/${id}/profile`, {
          firstName: dto.firstName,
          lastName: dto.lastName,
          displayName: dto.firstName && dto.lastName ? `${dto.firstName} ${dto.lastName}` : undefined,
        });
      }

      // Update username if provided
      if (dto.userName) {
        await client.put(`/management/v1/users/${id}/username`, {
          userName: dto.userName,
        });
      }

      // Update email if provided
      if (dto.email) {
        await client.put(`/management/v1/users/${id}/email`, {
          email: dto.email,
        });
      }

      // Fetch updated user
      const response = await client.get(`/management/v1/users/${id}`);
      const user = response.data.user;

      const userData: User = {
        id: user.id,
        userName: user.userName,
        email: user.email || user.preferredLoginName,
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        displayName: user.profile?.displayName || user.userName,
        organizationId: user.details?.resourceOwner || '',
        roleIds: dto.roleIds || [],
        teamId: dto.teamId,
        isActive: dto.isActive !== undefined ? dto.isActive : user.state === 'USER_STATE_ACTIVE',
        createdAt: new Date(user.details?.creationDate || Date.now()),
        updatedAt: new Date(),
      };

      res.json({
        success: true,
        data: userData,
        message: 'User updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to update user',
      });
    }
  }

  /**
   * Delete user (deactivate in Zitadel)
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const client = await zitadelConfig.getApiClient();

      await client.delete(`/management/v1/users/${id}`);

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to delete user',
      });
    }
  }

  /**
   * Get users by team
   */
  async getByTeam(req: Request, res: Response): Promise<void> {
    try {
      const { teamId } = req.params;
      
      // Fetch all users and filter by teamId
      const allUsersResponse = await this.getAll(req, res);
      
      // Since we're calling getAll indirectly, we need to fetch users differently
      // In a real implementation, this would query the database
      // For now, we'll return users that have the matching teamId
      
      res.json({
        success: true,
        data: [],
        message: 'Users by team - requires database to store team assignments. Use GET /api/users?organizationId=xxx and filter client-side by teamId.',
      });
    } catch (error: any) {
      console.error('Error fetching users by team:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch users by team',
      });
    }
  }
}
