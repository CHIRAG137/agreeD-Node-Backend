const ClientDetails = require("../models/clientDetailsModel");

exports.saveClientDetails = async (req, res) => {
  try {
    const { structuredDetails, emailContent, subject, recipientEmail } = req.body;

    // Transform emailAddresses and phoneNumbers to ensure they are arrays of objects
    const formattedDetails = {
      ...structuredDetails,
      emailAddresses: structuredDetails.emailAddresses || [],
      phoneNumbers: structuredDetails.phoneNumbers || [],
    };

    // Create a new document in the database
    const newDetails = new ClientDetails({
      ...formattedDetails,
      emailContent,
      subject,
      recipientEmail,
    });

    const savedDetails = await newDetails.save();

    res.status(201).json({ success: true, data: savedDetails });
  } catch (error) {
    console.error("Error saving details:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
