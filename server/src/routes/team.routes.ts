import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';

const router = Router();
const controller = new TeamController();

/**
 * @route GET /api/teams
 * @desc Get all teams (optionally filtered by organizationId query param)
 * @access Public
 */
router.get('/', (req, res) => controller.getAll(req, res));

/**
 * @route GET /api/teams/:id
 * @desc Get team by ID
 * @access Public
 */
router.get('/:id', (req, res) => controller.getById(req, res));

/**
 * @route POST /api/teams
 * @desc Create new team
 * @access Public
 */
router.post('/', (req, res) => controller.create(req, res));

/**
 * @route PUT /api/teams/:id
 * @desc Update team
 * @access Public
 */
router.put('/:id', (req, res) => controller.update(req, res));

/**
 * @route DELETE /api/teams/:id
 * @desc Delete team
 * @access Public
 */
router.delete('/:id', (req, res) => controller.delete(req, res));

/**
 * @route POST /api/teams/:id/members
 * @desc Add member to team
 * @access Public
 */
router.post('/:id/members', (req, res) => controller.addMember(req, res));

/**
 * @route DELETE /api/teams/:id/members/:userId
 * @desc Remove member from team
 * @access Public
 */
router.delete('/:id/members/:userId', (req, res) => controller.removeMember(req, res));

export default router;
