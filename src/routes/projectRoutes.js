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
router.post('/:id/vote', protect, [
  check('voteType', 'Vote type must be upvote, downvote, or remove').isIn(['upvote', 'downvote', 'remove']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
], projectController.voteProject);

export default router;