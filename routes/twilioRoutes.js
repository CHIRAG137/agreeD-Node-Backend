const express = require('express');
const router = express.Router();
const twilioController = require('../controllers/twilioController');

// Route to create and send the envelope
router.post('/make-call', twilioController.makeCall);

module.exports = router;
