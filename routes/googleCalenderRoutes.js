const express = require('express');
const router = express.Router();
const calenderController = require('../controllers/googleCalenderController');

// Route to create and send the envelope
router.post('/schedule', calenderController.scheduleInCalender);

module.exports = router;
