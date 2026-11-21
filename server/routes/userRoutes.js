const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const { validateProfileUpdate } = require('../middleware/validation');

router.get('/search', userController.search);
router.put('/me', authMiddleware, validateProfileUpdate, userController.updateProfile);
router.get('/:id', optionalAuth, userController.getProfile);

module.exports = router;
