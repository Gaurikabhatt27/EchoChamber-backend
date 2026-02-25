import express from 'express';
import { check } from 'express-validator';
import * as projectController from '../controllers/projectController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

const validateProject = [
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  validateRequest
];

router.post('/', protect, validateProject, projectController.create);
router.get('/', protect, projectController.getAll);

export default router;