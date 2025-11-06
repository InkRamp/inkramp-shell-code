import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller';

const router = Router();
const controller = new OrganizationController();

/**
 * @route GET /api/organizations
 * @desc Get all organizations
 * @access Public
 */
router.get('/', (req, res) => controller.getAll(req, res));

/**
 * @route GET /api/organizations/:id
 * @desc Get organization by ID
 * @access Public
 */
router.get('/:id', (req, res) => controller.getById(req, res));

/**
 * @route POST /api/organizations
 * @desc Create new organization
 * @access Public
 */
router.post('/', (req, res) => controller.create(req, res));

/**
 * @route PUT /api/organizations/:id
 * @desc Update organization
 * @access Public
 */
router.put('/:id', (req, res) => controller.update(req, res));

/**
 * @route DELETE /api/organizations/:id
 * @desc Delete organization
 * @access Public
 */
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
