const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { validatePhoto } = require('../middleware/validation');

router.get('/', optionalAuth, photoController.getAll);
router.get('/:id', optionalAuth, photoController.getOne);
router.post('/', authMiddleware, upload.single('image'), validatePhoto, photoController.create);
router.delete('/:id', authMiddleware, photoController.remove);
router.post('/:id/like', authMiddleware, photoController.toggleLike);
router.delete('/:id/tags/:targetUserId', authMiddleware, photoController.untagUser);

module.exports = router;
