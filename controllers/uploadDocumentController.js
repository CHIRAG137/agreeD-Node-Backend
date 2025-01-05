const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Controller to handle file content extraction
const extractContent = async (file) => {
  const fileExtension = file.originalname.split('.').pop().toLowerCase();
  let text = '';

  try {
    if (fileExtension === 'pdf') {
      // Extract content from PDF
      const pdfData = await pdfParse(file.buffer);
      text = pdfData.text;
    } else if (fileExtension === 'docx') {
      // Extract content from DOCX
      const docxData = await mammoth.extractRawText({ buffer: file.buffer });
      text = docxData.value;
    } else {
      throw new Error('Unsupported file type');
    }
    return text;
  } catch (error) {
    throw new Error('Error extracting content: ' + error.message);
  }
};

// Controller function for the upload route
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const text = await extractContent(req.file);
    return res.json({ content: text });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadFile };
