import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const controller = new UserController();

/**
 * @route GET /api/users
 * @desc Get all users (optionally filtered by organizationId query param)
 * @access Public
 */
router.get('/', (req, res) => controller.getAll(req, res));

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Public
 */
router.get('/:id', (req, res) => controller.getById(req, res));

/**
 * @route GET /api/users/team/:teamId
 * @desc Get users by team ID
 * @access Public
 */
router.get('/team/:teamId', (req, res) => controller.getByTeam(req, res));

/**
 * @route POST /api/users
 * @desc Create new user
 * @access Public
 */
router.post('/', (req, res) => controller.create(req, res));

/**
 * @route PUT /api/users/:id
 * @desc Update user
 * @access Public
 */
router.put('/:id', (req, res) => controller.update(req, res));

/**
 * @route DELETE /api/users/:id
 * @desc Delete user
 * @access Public
 */
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
