import { Request, Response } from 'express';
import { CreateTeamDto, UpdateTeamDto, Team } from '../models/entities';

/**
 * Controller for Team CRUD operations
 * Teams are stored locally (not in Zitadel)
 * Relationship: Organization (1) -> Teams (n), Team (1) -> Users (n)
 */
export class TeamController {
  // In-memory storage for teams (in production, use a database)
  private teams: Map<string, Team> = new Map();
  private idCounter = 1;

  /**
   * Get all teams (optionally filtered by organization)
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { organizationId } = req.query;
      
      let teams = Array.from(this.teams.values());
      
      if (organizationId) {
        teams = teams.filter(team => team.organizationId === organizationId);
      }

      res.json({
        success: true,
        data: teams,
        total: teams.length,
      });
    } catch (error: any) {
      console.error('Error fetching teams:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch teams',
      });
    }
  }

  /**
   * Get team by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const team = this.teams.get(id);

      if (!team) {
        res.status(404).json({
          success: false,
          error: 'Team not found',
        });
        return;
      }

      res.json({
        success: true,
        data: team,
      });
    } catch (error: any) {
      console.error('Error fetching team:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to fetch team',
      });
    }
  }

  /**
   * Create new team
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreateTeamDto = req.body;

      if (!dto.name || !dto.organizationId) {
        res.status(400).json({
          success: false,
          error: 'name and organizationId are required',
        });
        return;
      }

      const teamId = `team-${this.idCounter++}`;
      const team: Team = {
        id: teamId,
        name: dto.name,
        description: dto.description || '',
        organizationId: dto.organizationId,
        leaderId: dto.leaderId,
        memberIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.teams.set(teamId, team);

      res.status(201).json({
        success: true,
        data: team,
        message: 'Team created successfully',
      });
    } catch (error: any) {
      console.error('Error creating team:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to create team',
      });
    }
  }

  /**
   * Update team
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto: UpdateTeamDto = req.body;

      const team = this.teams.get(id);
      if (!team) {
        res.status(404).json({
          success: false,
          error: 'Team not found',
        });
        return;
      }

      const updatedTeam: Team = {
        ...team,
        name: dto.name ?? team.name,
        description: dto.description ?? team.description,
        leaderId: dto.leaderId ?? team.leaderId,
        memberIds: dto.memberIds ?? team.memberIds,
        updatedAt: new Date(),
      };

      this.teams.set(id, updatedTeam);

      res.json({
        success: true,
        data: updatedTeam,
        message: 'Team updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating team:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to update team',
      });
    }
  }

  /**
   * Delete team
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!this.teams.has(id)) {
        res.status(404).json({
          success: false,
          error: 'Team not found',
        });
        return;
      }

      this.teams.delete(id);

      res.json({
        success: true,
        message: 'Team deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting team:', error);
      res.status(error.response?.status || 500).json({
        success: false,
        error: error.message || 'Failed to delete team',
      });
    }
  }

  /**
   * Add member to team
   */
  async addMember(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'userId is required',
        });
        return;
      }

      const team = this.teams.get(id);
      if (!team) {
        res.status(404).json({
          success: false,
          error: 'Team not found',
        });
        return;
      }

      if (!team.memberIds.includes(userId)) {
        team.memberIds.push(userId);
        team.updatedAt = new Date();
        this.teams.set(id, team);
      }

      res.json({
        success: true,
        data: team,
        message: 'Member added to team successfully',
      });
    } catch (error: any) {
      console.error('Error adding member to team:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to add member to team',
      });
    }
  }

  /**
   * Remove member from team
   */
  async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const { id, userId } = req.params;

      const team = this.teams.get(id);
      if (!team) {
        res.status(404).json({
          success: false,
          error: 'Team not found',
        });
        return;
      }

      team.memberIds = team.memberIds.filter(memberId => memberId !== userId);
      team.updatedAt = new Date();
      this.teams.set(id, team);

      res.json({
        success: true,
        data: team,
        message: 'Member removed from team successfully',
      });
    } catch (error: any) {
      console.error('Error removing member from team:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to remove member from team',
      });
    }
  }
}
