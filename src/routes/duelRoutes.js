import express from 'express';
import * as duelController from '../controllers/duelController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Allow guests to view active duels
router.get('/', duelController.getDuels);
router.get('/history', protect, duelController.getUserDuelHistory);
router.get('/:id', duelController.getDuelById);

// Protected Actions
router.post('/', protect, duelController.createDuel);
router.post('/:id/join', protect, duelController.joinDuel);
router.post('/:id/points', protect, duelController.submitPoint);
router.post('/:id/vote', protect, duelController.castDuelVote);

export default router;
