const mongoose = require("mongoose");

const ClientDetailsSchema = new mongoose.Schema({
  clientName: String,
  contactPerson: String,
  dates: [
    {
      dateFormat: String, // Date in string format
      dateType: String, // Type of the date (e.g., "Acceptance")
    },
  ],
  address: String,
  cost: String,
  emailAddresses: [
    {
      entity: String,
      email: String,
    },
  ],
  phoneNumbers: [
    {
      entity: String,
      phoneNumber: String,
    },
  ],
  emailContent: String,
  randomString: String,
  extractedContent: String,
  subject: String,
  recipientEmail: String,
  heygenVideoId: String,
  heygenVideoLink: String,
  driveLink: String,
  remainderEmails: [{ emailContent: String, date: String, subject: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ClientDetails", ClientDetailsSchema);
