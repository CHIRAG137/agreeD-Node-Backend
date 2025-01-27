require("dotenv").config();
const twilio = require("twilio");
const axios = require("axios");
const ClientDetails = require("../models/clientDetailsModel");

// Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client
const client = twilio(accountSid, authToken);

/**
 * Parse date from "dd-mm-yyyy" format.
 * @param {string} dateStr - Date string in "dd-mm-yyyy" format.
 * @returns {Date} - JavaScript Date object.
 */
const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Make a phone call using Twilio.
 */
exports.makeCall = async (req, res) => {
  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    return res
      .status(400)
      .json({ error: "phoneNumber and message are required." });
  }

  try {
    const twimlResponse = `<Response><Say>${message}</Say></Response>`;
    const call = await client.calls.create({
      twiml: twimlResponse,
      to: phoneNumber,
      from: twilioPhoneNumber,
    });

    res.status(200).json({ success: true, callSid: call.sid });
  } catch (error) {
    console.error("Error making call:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Generate and store personalized call content for all clients based on their dates.
 */
exports.generateCallContent = async (req, res) => {
  try {
    const clients = await ClientDetails.find();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let generatedContents = [];

    for (const client of clients) {
      for (const dateObj of client.dates) {
        const targetDate = parseDate(dateObj.dateFormat);
        targetDate.setDate(targetDate.getDate() - 1); // A day before the specified date

        if (targetDate.getTime() === today.getTime()) {
          const detailsPrompt = `Create a personalized phone call content for client ${client.clientName} regarding ${dateObj.dateType} based on previous email content ${client.emailContent} convincing client to do necessary things accordingly`;

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
              { headers: { "Content-Type": "application/json" } }
            );

            const generatedContent =
            response.data.candidates[0].content.parts[0].text ||
              "Default call content.";

            client.callContent.push({
              dateType: dateObj.dateType,
              date: dateObj.dateFormat,
              content: generatedContent,
            });

            await client.save();

            generatedContents.push({
              clientName: client.clientName,
              dateType: dateObj.dateType,
              content: generatedContent,
            });
          } catch (error) {
            console.error(
              `Error generating call content for client ${client.clientName}:`,
              error.message
            );
          }
        }
      }
    }

    res.status(200).json({
      message: "Call content generation completed.",
      generatedContents,
    });
  } catch (error) {
    console.error("Error in generateCallContent:", error.message);
    res.status(500).json({
      message: "An error occurred during call content generation.",
      error: error.message,
    });
  }
};

/**
 * Retrieve all generated call contents for a specific client.
 */
exports.getCallContentByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const client = await ClientDetails.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    res.status(200).json({
      clientName: client.clientName,
      callContent: client.callContent,
    });
  } catch (error) {
    console.error("Error in getCallContentByClient:", error.message);
    res.status(500).json({
      message: "An error occurred while retrieving call content.",
      error: error.message,
    });
  }
};

/**
 * Manually trigger call content generation for a specific client.
 */
exports.generateCallContentForClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const client = await ClientDetails.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let generatedContents = [];

    for (const dateObj of client.dates) {
      const targetDate = parseDate(dateObj.dateFormat);
      targetDate.setDate(targetDate.getDate() - 1); // A day before the specified date

      const detailsPrompt = `Create a personalized phone call content for client ${client.clientName} regarding ${dateObj.dateType} based on previous email content ${client.emailContent} convincing client to do necessary things accordingly`;

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
          { headers: { "Content-Type": "application/json" } }
        );

        const generatedContent =
          response.data.candidates[0].content.parts[0].text ||
          "Default call content.";

        client.callContent.push({
          dateType: dateObj.dateType,
          date: dateObj.dateFormat,
          content: generatedContent,
        });

        await client.save();

        generatedContents.push({
          dateType: dateObj.dateType,
          content: generatedContent,
        });
      } catch (error) {
        console.error(
          `Error generating call content for client ${client.clientName}:`,
          error.message
        );
      }
    }

    res.status(200).json({
      message: "Call content generation for client completed.",
      generatedContents,
    });
  } catch (error) {
    console.error("Error in generateCallContentForClient:", error.message);
    res.status(500).json({
      message:
        "An error occurred during call content generation for the client.",
      error: error.message,
    });
  }
};
