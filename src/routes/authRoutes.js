import express from 'express';
import { check } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

const validateRegister = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  validateRequest
];

router.post('/register', validateRegister, authController.register);
router.post('/login', authController.login);
router.get('/leaderboard', authController.getLeaderboard);

export default router;