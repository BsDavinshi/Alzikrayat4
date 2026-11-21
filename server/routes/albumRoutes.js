const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const { validateAlbum } = require('../middleware/validation');

router.get('/', albumController.getAll);
router.get('/:id', optionalAuth, albumController.getOne);
router.post('/', authMiddleware, validateAlbum, albumController.create);
router.delete('/:id', authMiddleware, albumController.remove);

module.exports = router;
