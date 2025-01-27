const transporter = require("../config/nodemailerConfig");
const clientDetailsModel = require("../models/clientDetailsModel");
const moment = require("moment");

// Helper function to check if a given date is greater than the specified range
const isGreaterDateMMDDYYYY = (date, rangeType = "days", rangeNumber = 1) => {
  const thresholdDate = moment().add(rangeNumber, rangeType).toDate();
  const parsedDate = moment(date, "MMM DD, YYYY").toDate(); // Parse the date string
  return parsedDate > thresholdDate;
};

// Email reminder function
exports.emailReminder = async () => {
  try {
    // Fetch all clients
    const allClients = await clientDetailsModel.find();

    if (!allClients || allClients.length === 0) {
      console.log("No clients found.");
      return;
    }

    // Filter clients with relevant dates
    const filteredClients = allClients.filter((client) =>
      client.dates.some((dateEntry) => isGreaterDateMMDDYYYY(dateEntry.dateFormat, "days", 1))
    );

    if (!filteredClients || filteredClients.length === 0) {
      console.log("No clients with upcoming events.");
      return;
    }

    // Iterate through each client
    for (const client of filteredClients) {
      for (const date of client.dates) {
        const isGreaterDate = isGreaterDateMMDDYYYY(date.dateFormat, "days", 1);
        if (!isGreaterDate) continue; // Skip past dates or irrelevant ones

        // Generate email content
        const emailContent = await generateEmail(
          client.extractedContent,
          date.dateType,
          date.dateFormat
        );

        // Extract subject from email content
        const subjectMatch = emailContent.match(/Subject:\s*(.*)/);
        const subject = subjectMatch ? subjectMatch[1] : "Reminder: Contract Event";

        // Set up email options
        const mailOptions = {
          from: `"AgreeD" <${process.env.GMAIL_USER}>`,
          to: client.recipientEmail,
          cc: client.emailAddresses.map((item) => item.email).join(", "),
          subject,
          text: emailContent,
        };

        // Send the email
        try {
          await transporter.sendMail(mailOptions);
          await clientDetailsModel.findOneAndUpdate(
            { _id: client._id }, // Filter: Find the client by their unique `_id`.
            {
              $push: {
                remainderEmails: {
                  emailContent: emailContent, // Store the generated email content.
                  date: date.dateFormat, // The date of the event (e.g., "Jan 27, 2025").
                  dateType: date.dateType, // The type of event (e.g., "Acceptance").
                  subject: subject, // Subject of the email.
                },
              },
            }
          );
          console.log(
            `Reminder email sent to ${client.recipientEmail} for event: ${date.dateType}`
          );
        } catch (error) {
          console.error(`Error sending email to ${client.recipientEmail}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error("Error while sending reminder email:", error.response?.data || error.message);
  }
};

// Helper function to generate the email content
const generateEmail = async (extractedText, event, date, retries = 3) => {
  const emailPrompt = `You are an expert email assistant. Write a short, professional, and polite reminder email to a client about a specific contract-related event. The email should be clear, concise, and no longer than 300 words. It must include the following:

  1. A warm greeting to the client.
  2. A brief reminder of the ${event} and its significance.
  3. Key event details:
    - Event type and purpose.
    - Date: ${date}, time, and location (if applicable).
    - Any additional relevant instructions or information.
    - Contact person for questions or clarifications.
  4. A polite call to action encouraging the client to confirm or take any necessary steps (e.g., attending the meeting, signing the agreement, or reviewing the contract).

  Ensure the email tone is professional yet approachable, with a clear structure and easy-to-read format.

  Use the following text to extract details for the email: ${extractedText}`;

  const requestPayload = {
    contents: [
      {
        parts: [{ text: emailPrompt }],
      },
    ],
  };

  while (retries > 0) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        requestPayload,
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      retries -= 1;
      if (retries === 0) throw new Error("Error generating email: " + error.message);
    }
  }
};
