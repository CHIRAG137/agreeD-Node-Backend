const axios = require("axios");

exports.askQuestions = async (req, res) => {
  const { pdfText, question } = req.body;

  // Validate the input
  if (!pdfText || !question) {
    return res
      .status(400)
      .json({ error: "Both pdfText and question are required." });
  }

  const questionPrompt = `Based on the following text: \n\n"${pdfText}"\n\nAnswer the question: "${question}"`;

  try {
    // Call the Gemini API
    const requestPayload = {
      contents: [
        {
          parts: [{ text: questionPrompt }],
        },
      ],
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Extract and send the answer
    const answer =
      response.data.candidates[0].content.parts[0]?.text ||
      "No answer available.";
    res.json({ answer });
  } catch (error) {
    console.error(
      "Error calling Gemini API:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
};
