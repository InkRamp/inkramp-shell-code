import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';

const router = Router();
const controller = new RoleController();

/**
 * @route GET /api/roles
 * @desc Get all roles (optionally filtered by projectId or isSystemRole query params)
 * @access Public
 */
router.get('/', (req, res) => controller.getAll(req, res));

/**
 * @route GET /api/roles/:id
 * @desc Get role by ID (requires projectId query param for non-system roles)
 * @access Public
 */
router.get('/:id', (req, res) => controller.getById(req, res));

/**
 * @route POST /api/roles
 * @desc Create new role (requires projectId query param)
 * @access Public
 */
router.post('/', (req, res) => controller.create(req, res));

/**
 * @route PUT /api/roles/:id
 * @desc Update role (requires projectId query param)
 * @access Public
 */
router.put('/:id', (req, res) => controller.update(req, res));

/**
 * @route DELETE /api/roles/:id
 * @desc Delete role (requires projectId query param)
 * @access Public
 */
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
