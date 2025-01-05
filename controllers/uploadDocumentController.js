const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');

// Extract content from PDF or DOCX file
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

// Function to generate personalized email using the extracted content
const generateEmail = async (extractedText) => {
  const emailPrompt = `You are an email assistant. Write a formal email summarizing the agreement based on the following text: ${extractedText}. Please highlight all important details and make sure the email avoids any "agreement traps" or misunderstandings.`;

  try {
    const requestPayload = {
      contents: [{
        parts: [{ text: emailPrompt }]
      }]
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    const emailBody = response.data.candidates[0].content.parts[0].text;
    return emailBody;
  } catch (error) {
    throw new Error('Error generating email: ' + error.message);
  }
};

// Controller function for handling file upload and email generation
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Step 1: Extract content from the uploaded file
    const extractedContent = await extractContent(req.file);

    // Step 2: Generate personalized email using the extracted content
    const emailContent = await generateEmail(extractedContent);

    // Step 3: Respond with the generated email content
    return res.json({
      message: 'File uploaded and email generated successfully.',
      emailContent: emailContent,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadFile };
