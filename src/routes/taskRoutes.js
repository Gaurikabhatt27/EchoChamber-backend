import express from 'express';
import { check } from 'express-validator';
import * as taskController from '../controllers/taskController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

const validateTask = [
  check('content', 'Content is required').not().isEmpty(),
  check('stance', 'Stance must be pro or con').isIn(['pro', 'con']),
  check('project', 'Invalid Project ID').isMongoId(),
  validateRequest
];

router.post('/', protect, validateTask, taskController.postArgument);
router.get('/:projectId', protect, taskController.getRoomDebate);

export default router;