import express from 'express';
import { check, validationResult } from 'express-validator';
import * as authController from '../controllers/authController.js';

const router = express.Router();

const validateRegister = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
];

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/register', validateRegister, checkValidation, authController.register);
router.post('/login', authController.login);

export default router;