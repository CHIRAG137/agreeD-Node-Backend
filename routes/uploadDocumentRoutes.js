const express = require('express');
const multer = require('multer');
const { uploadFile } = require('../controllers/uploadDocumentController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);

module.exports = router;
