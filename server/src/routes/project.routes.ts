import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';

const router = Router();
const controller = new ProjectController();

/**
 * @route GET /api/projects
 * @desc Get all projects (optionally filtered by organizationId query param)
 * @access Public
 */
router.get('/', (req, res) => controller.getAll(req, res));

/**
 * @route GET /api/projects/:id
 * @desc Get project by ID
 * @access Public
 */
router.get('/:id', (req, res) => controller.getById(req, res));

/**
 * @route POST /api/projects
 * @desc Create new project
 * @access Public
 */
router.post('/', (req, res) => controller.create(req, res));

/**
 * @route PUT /api/projects/:id
 * @desc Update project
 * @access Public
 */
router.put('/:id', (req, res) => controller.update(req, res));

/**
 * @route DELETE /api/projects/:id
 * @desc Delete project
 * @access Public
 */
router.delete('/:id', (req, res) => controller.delete(req, res));

/**
 * @route POST /api/projects/:id/roles
 * @desc Add role to project
 * @access Public
 */
router.post('/:id/roles', (req, res) => controller.addRole(req, res));

/**
 * @route DELETE /api/projects/:id/roles/:roleId
 * @desc Remove role from project
 * @access Public
 */
router.delete('/:id/roles/:roleId', (req, res) => controller.removeRole(req, res));

export default router;
