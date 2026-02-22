const express = require('express');
const { check, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

const validateRegister = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
];

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.post('/register', validateRegister, checkValidation, authController.register);
router.post('/login', authController.login);

module.exports = router;