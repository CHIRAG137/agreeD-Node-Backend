const axios = require("axios");
const { google } = require("googleapis");

// Google Calendar setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});
const calendar = google.calendar({ version: "v3", auth: oauth2Client });

// Endpoint to create calendar events for multiple emails
exports.scheduleInCalender = async (req, res) => {
  const { emails, events } = req.body;

  // Validate input
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res
      .status(400)
      .json({ error: "Emails array is required and should not be empty." });
  }
  if (!events || !Array.isArray(events) || events.length === 0) {
    return res
      .status(400)
      .json({ error: "Events array is required and should not be empty." });
  }

  try {
    const results = [];

    for (const email of emails) {
      for (const event of events) {
        const { date, type } = event;
        if (!date || !type) {
          return res
            .status(400)
            .json({ error: "Each event must have a date and type." });
        }

        // Create calendar event
        const calendarEvent = {
          summary: type,
          start: {
            date: date, // Use ISO 8601 format for dates
          },
          end: {
            date: date, // End date is the same for all-day events
          },
          attendees: [{ email }],
        };

        const response = await calendar.events.insert({
          calendarId: "primary",
          resource: calendarEvent,
        });

        results.push({ email, event: response.data });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error("Error creating calendar events:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while scheduling events." });
  }
};
