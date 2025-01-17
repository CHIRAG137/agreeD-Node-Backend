require("dotenv").config();
const twilio = require("twilio");

// Twilio credentials from your Twilio account
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client
const client = twilio(accountSid, authToken);

exports.makeCall = async (req, res) => {
  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    return res
      .status(400)
      .json({ error: "phoneNumber and message are required." });
  }

  try {
    // Create a TwiML Bin for the call
    const twimlResponse = `<Response><Say>${message}</Say></Response>`;

    // Make the call using Twilio
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
