const express = require('express');
const router = express.Router();
const { getFile } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');

// File downloads and previews are protected
router.get('/:type/:filename', protect, getFile);

module.exports = router;
