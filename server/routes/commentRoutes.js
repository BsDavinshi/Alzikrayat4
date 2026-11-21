const express = require('express');
const router = express.Router({ mergeParams: true });
const commentController = require('../controllers/commentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateComment } = require('../middleware/validation');

router.get('/', commentController.getByPhoto);
router.post('/', authMiddleware, validateComment, commentController.create);

module.exports = router;
