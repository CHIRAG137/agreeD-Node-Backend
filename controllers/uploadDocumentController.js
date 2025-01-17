const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

// Extract content from PDF or DOCX file
const extractContent = async (file) => {
  const fileExtension = file.originalname.split(".").pop().toLowerCase();
  let text = "";

  try {
    if (fileExtension === "pdf") {
      // Extract content from PDF
      const pdfData = await pdfParse(file.buffer);
      text = pdfData.text;
    } else if (fileExtension === "docx") {
      // Extract content from DOCX
      const docxData = await mammoth.extractRawText({ buffer: file.buffer });
      text = docxData.value;
    } else {
      throw new Error("Unsupported file type");
    }
    return text;
  } catch (error) {
    throw new Error("Error extracting content: " + error.message);
  }
};

// Function to generate personalized email using the extracted content
const generateEmail = async (extractedText) => {
  const emailPrompt = `You are an expert email assistant. Write a short, professional, and persuasive email to a client about finalizing an agreement. The email should be clear, concise, and no longer than 300 words. It should include the below 4 points as paragraphs:

1. A warm greeting to the client.
2. A brief explanation of the email's purpose (to finalize the agreement).
3. The key agreement details:
   - Client details if available (name or relevant information).
   - Important dates (effective date, completion date).
   - Any costs or payment terms.
   - Contact person for any questions or clarifications.
4. A call to action, encouraging the client to confirm their acceptance of the agreement by a specified date.
   
Ensure the email is professional, engaging, and easy to read, with the most important details highlighted for the client to review and take action.

The following text provides all the necessary details for the email: ${extractedText}`;

  try {
    const requestPayload = {
      contents: [
        {
          parts: [{ text: emailPrompt }],
        },
      ],
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const emailBody = response.data.candidates[0].content.parts[0].text;
    return emailBody;
  } catch (error) {
    throw new Error("Error generating email: " + error.message);
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Ensure the uploads directory exists
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate a unique filename and save the file
    const uniqueFileName = `${uuidv4()}_${req.file.originalname}`;
    const filePath = path.join(uploadDir, uniqueFileName);
    console.log(`File saved at: ${filePath}`);
    fs.writeFileSync(filePath, req.file.buffer);

    // Step 1: Extract content from the uploaded file
    const extractedContent = await extractContent(req.file);

    // Step 2: Generate personalized email using the extracted content
    const emailContent = await generateEmail(extractedContent);

    // Step 3: Respond with the generated email content
    return res.json({
      message: 'File uploaded and email generated successfully.',
      emailContent: emailContent,
      filePath: filePath
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadFile };
