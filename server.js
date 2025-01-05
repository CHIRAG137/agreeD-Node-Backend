const express = require('express');
const mongoose = require('mongoose');
const passport = require('./config/passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const cors = require("cors");
const docusignRoutes = require('./routes/docusignRoutes');
const uploadRoutes = require("./routes/uploadDocumentRoutes");
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

app.use('/auth', authRoutes);
app.use('/api/docusign', docusignRoutes);
app.use('/api', uploadRoutes);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
