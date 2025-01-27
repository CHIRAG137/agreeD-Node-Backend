const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const { google } = require("googleapis");

// Parse Google credentials from environment variable
const GOOGLE_CREDENTIALS_JSON = process.env.GOOGLE_CREDENTIALS;
if (!GOOGLE_CREDENTIALS_JSON) {
  throw new Error("GOOGLE_CREDENTIALS environment variable is not set.");
}

const GOOGLE_CREDENTIALS = JSON.parse(GOOGLE_CREDENTIALS_JSON);
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const auth = new google.auth.GoogleAuth({
  credentials: GOOGLE_CREDENTIALS,
  scopes: SCOPES,
});

const drive = google.drive({ version: "v3", auth });

// Helper function to upload a file to Google Drive
async function uploadFileToDrive(filePath, fileName) {
  try {
    const fileMetadata = {
      name: fileName,
    };

    const mimeType =
      path.extname(fileName) === ".pdf" ? "application/pdf" : "application/octet-stream";
    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    const fileId = response.data.id;

    // Make the file public
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Get the public URL
    const driveLink = `https://drive.google.com/file/d/${fileId}/preview`;
    return driveLink;
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
    throw new Error("Failed to upload file to Google Drive");
  }
}

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

const extractStructuredDetails = async (text) => {
  const detailsPrompt = `Extract and return the following structured details from the given text in JSON format with proper keys:

{
  "clientName": "Name of the client if mentioned, otherwise null",
  "contactPerson": "Name of the contact person if mentioned, otherwise null",
  "dates": [
    {
      "dateFormat": "Any Date found in format dd-mm-yyyy(If date is not in dd-mm-yyyt format, convert it to proper format),
      "dateType": "The associated date type can be any of Effective or Renewal or Expiration or Termination or Review or Payment due or Notification or Grace Period End or Penalty Start or Compliance or Amendment or Signatory or Audit or Event Trigger"
    }
  ],
  "address": "Address if found, otherwise null",
  "paymentTerms": "Cost or payment terms if mentioned, otherwise null",
  "emailAddresses": [
    {
      "email": "Email address found",
      "entity": "The associated entity or person (if available)"
    }
  ],
  "phoneNumbers": [
    {
      "phoneNumber": "Phone number found",
      "entity": "The associated entity or person (if available)"
    }
  ]
}

Text: ${text}`;

  try {
    const requestPayload = {
      contents: [
        {
          parts: [{ text: detailsPrompt }],
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

    const rawText = response.data.candidates[0].content.parts[0].text;

    // Extract JSON between the ```json markers
    const jsonMatch = rawText.match(/```json\s([\s\S]*?)\s```/);

    if (jsonMatch && jsonMatch[1]) {
      const structuredDetails = JSON.parse(jsonMatch[1]);
      return structuredDetails;
    } else {
      throw new Error("Failed to parse JSON from API response");
    }
  } catch (error) {
    throw new Error("Error extracting structured details: " + error.message);
  }
};

// Function to generate personalized email using the extracted content
const generateEmail = async (extractedText) => {
  const emailPrompt = `You are an expert email assistant. Write a short, professional, and persuasive email to a client about finalizing an agreement. The email should be clear, concise, and no longer than 300 words. It should include the below 4 points as paragraphs:

1. A warm greeting to the client.
2. A brief explanation of the email's purpose (to finalize the agreement).
3. The key agreement details:
   - Client details if available (name or relevant information).
   - Important dates (Can be any of Effective or Renewal or Expiration or Termination or Review or Payment due or Notification or Grace Period End or Penalty Start or Compliance or Amendment or Signatory or Audit or Event Trigger).
   - Any costs or payment terms.
   - Contact person for any questions or clarifications.
4. A call to action, encouraging the client to confirm their acceptance of the agreement by a specified date.
5. Add two fields named $xyz and $abc before email closing.
   
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
      return res.status(400).json({ error: "No file uploaded" });
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

    // Step 2: Extract structured details from the content
    const structuredDetails = await extractStructuredDetails(extractedContent);

    // Step 3: Generate personalized email using the extracted content
    const emailContent = await generateEmail(extractedContent);

    // Upload the file to Google Drive
    const driveLink = await uploadFileToDrive(filePath, "Document");
    console.log(driveLink);
    // Step 4: Respond with the generated email content
    return res.json({
      message: "File uploaded and email generated successfully.",
      emailContent: emailContent,
      structuredDetails: structuredDetails,
      filePath: filePath,
      extractedContent: extractedContent,
      driveLink: driveLink,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadFile };
