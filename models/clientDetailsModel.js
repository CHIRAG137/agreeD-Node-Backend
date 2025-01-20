const mongoose = require('mongoose');

const ClientDetailsSchema = new mongoose.Schema({
  clientName: String,
  contactPerson: String,
  dates: String,
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
  subject: String,
  recipientEmail: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ClientDetails', ClientDetailsSchema);
