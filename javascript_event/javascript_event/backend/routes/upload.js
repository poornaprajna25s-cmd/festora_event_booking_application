const express = require('express');
const { upload, uploadFile } = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// @route   POST /api/uploads
// @desc    Upload file
// @access  Organiser only
router.post('/', auth, roleCheck('organiser'), (req, res, next) => {
  console.log('Upload route called by user:', req.user ? req.user.id : 'unknown');
  next();
}, upload, uploadFile);

module.exports = router;