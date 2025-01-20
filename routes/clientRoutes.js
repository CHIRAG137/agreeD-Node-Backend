const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientDetailsController');

// Route to create and send the envelope
router.post('/save', clientController.saveClientDetails);

module.exports = router;
