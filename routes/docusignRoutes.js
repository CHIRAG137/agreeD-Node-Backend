const express = require('express');
const router = express.Router();
const envelopeController = require('../controllers/docusignController');

// Route to create and send the envelope
router.post('/create-envelope', envelopeController.createAndSendEnvelope);

// Route to generate recipient view (URL for the signer to sign)
router.post('/create-recipient-view/:envelopeId', envelopeController.createRecipientView);

router.post('/create-template', envelopeController.createTemplate);

module.exports = router;
