const express = require('express');
const router = express.Router();
const heygenController = require('../controllers/heygenController');

// Route to create and send the envelope
router.post('/create-avatar-video', heygenController.generateVideoController);
router.get('/video-status', heygenController.getVideoStatusController);

module.exports = router;
