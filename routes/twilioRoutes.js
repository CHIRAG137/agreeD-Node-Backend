const express = require('express');
const router = express.Router();
const twilioController = require('../controllers/twilioController');

// Route to create and send the envelope
router.post('/make-call', twilioController.makeCall);

// Route to generate call content for all clients
router.post("/generate-call-content", twilioController.generateCallContent);

// Route to retrieve call content by client ID
router.get("/call-content/:clientId", twilioController.getCallContentByClient);

// Route to manually trigger call content generation for a specific client
router.post("/generate-call-content/:clientId", twilioController.generateCallContentForClient);

module.exports = router;
