import express from 'express';
import { check, validationResult } from 'express-validator';
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
router.get('/', projectController.getAll);
router.post('/:id/vote', protect, [
  check('voteType', 'Vote type must be upvote, downvote, or remove').isIn(['upvote', 'downvote', 'remove']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
], projectController.voteProject);

// Comment routes
router.post('/:id/comments', protect, [
  check('text', 'Comment text is required').not().isEmpty()
], validateRequest, projectController.addComment);

router.get('/:id/comments', projectController.getComments);

router.get('/:id/analyze', projectController.analyzeDebate);

export default router;