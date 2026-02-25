import express from 'express';
import { check, validationResult } from 'express-validator';
import * as projectController from '../controllers/projectController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

const validateProject = [
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

router.post('/', protect, validateProject, projectController.create);
router.get('/', protect, projectController.getAll);

export default router;