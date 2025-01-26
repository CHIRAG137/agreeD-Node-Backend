const ClientDetails = require("../models/clientDetailsModel");

exports.saveClientDetails = async (req, res) => {
  try {
    const {
      structuredDetails,
      emailContent,
      subject,
      recipientEmail,
      envelopeId,
      heygenVideoId,
      driveLink,
      extractedContent,
      randomString,
    } = req.body;

    // Ensure dates are formatted properly in the structure
    const formattedDetails = {
      ...structuredDetails,
      emailAddresses: structuredDetails.emailAddresses || [],
      phoneNumbers: structuredDetails.phoneNumbers || [],
      dates: structuredDetails.dates || [],
    };

    // Create a new document in the database
    const newDetails = new ClientDetails({
      ...formattedDetails,
      emailContent,
      subject,
      recipientEmail,
      envelopeId,
      heygenVideoId,
      driveLink,
      extractedContent,
      randomString,
    });

    const savedDetails = await newDetails.save();

    res.status(201).json({ success: true, data: savedDetails });
  } catch (error) {
    console.error("Error saving details:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Endpoint to get client details
exports.GetClientData = async (req, res) => {
  try {
    const clients = await ClientDetails.find();
    res.json(clients);
  } catch (error) {
    res.status(500).send("Error fetching client details: " + error.message);
  }
};

// Endpoint to get single client details
exports.GetSingleClientData = async (req, res) => {
  try {
    const client = await ClientDetails.findById(req.params.id);
    res.json(client);
  } catch (error) {
    res.status(500).send("Error fetching client details: " + error.message);
  }
};

// Endpoint to get single client details by randomString
exports.GetClientDataByRandomString = async (req, res) => {
  try {
    if (!req.body.randomString) {
      throw new Error("randomString is required");
    }
    const client = await ClientDetails.findOne({ randomString: req.body.randomString });
    res.json(client);
  } catch (error) {
    res.status(500).send("Error fetching client details: " + error.message);
  }
};
