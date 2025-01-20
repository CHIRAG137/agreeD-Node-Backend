const express = require('express');
const mongoose = require('mongoose');
const passport = require('./config/passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const cors = require("cors");
const docusignRoutes = require('./routes/docusignRoutes');
const uploadRoutes = require("./routes/uploadDocumentRoutes");
const heygenRoutes = require("./routes/heygenRoutes");
const twilioRoutes = require("./routes/twilioRoutes");
const clientRoutes = require("./routes/clientRoutes");
const axios = require('axios');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf'); // Use the legacy build
const { checkAndSaveCompletedVideos } = require('./controllers/heygenController');
const cron = require("node-cron");

require('dotenv').config();
require('./routes/auth'); 

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(
  session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());


app.get('/pdf', async (req, res) => {
  const pdfUrl = 'https://drive.google.com/uc?id=18IdCKn7tPjICk8I2KDwNKjYNIUETQZs4&export=download';
  
  try {
    // Fetch the PDF file as an arraybuffer
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });

    // Load the PDF document using pdfjs
    const pdfDoc = await pdfjsLib.getDocument({ data: response.data }).promise;

    // Log the total number of pages
    console.log('Total number of pages:', pdfDoc.numPages);

    // Send the PDF file to the client
    res.set('Content-Type', 'application/pdf');
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching the PDF file');
  }
});

app.use('/auth', authRoutes);
app.use('/api/docusign', docusignRoutes);
app.use('/api', uploadRoutes);
app.use('/api/heygen', heygenRoutes);
app.use('/api/twilio', twilioRoutes);
app.use('/api/client', clientRoutes);

// Schedule the cron job to run every day at 7:00 AM
cron.schedule("0 7 * * *", async () => {
  console.log("Starting daily video status check...");
  await checkAndSaveCompletedVideos();
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
