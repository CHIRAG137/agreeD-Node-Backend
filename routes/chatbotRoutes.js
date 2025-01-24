const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Route to create and send the envelope
router.post('/ask', chatbotController.askQuestions);

module.exports = router;
