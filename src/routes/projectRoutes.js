const express = require('express');
const { check, validationResult } = require('express-validator');
const projectController = require('../controllers/projectController');
const { protect } = require('../middlewares/authMiddleware');

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

module.exports = router;