// Required dependencies
const axios = require("axios");

// API key from environment variables
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

// Base API URL for Heygen
const HEYGEN_API_BASE_URL = "https://api.heygen.com";

/**
 * Controller to handle video generation.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.generateVideoController = async (req, res) => {
  const { video_inputs, dimension } = req.body;

  // Payload for video generation
  const payload = { video_inputs, dimension };

  try {
    // Make API call to generate video
    const { data } = await axios.post(
      `${HEYGEN_API_BASE_URL}/v2/video/generate`,
      payload,
      {
        headers: {
          "X-Api-Key": HEYGEN_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      message: "Video generated successfully!",
      data,
    });
  } catch (error) {
    console.error("Error generating video:", error);
    res.status(500).json({
      message: "Failed to generate video.",
      error: error.response?.data || error.message,
    });
  }
};

/**
 * Controller to fetch video status and URL.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getVideoStatusController = async (req, res) => {
  const { video_id } = req.query;

  if (!video_id) {
    return res.status(400).json({
      message: "video_id is required.",
    });
  }

  try {
    // Make API call to fetch video status
    const { data } = await axios.get(
      `${HEYGEN_API_BASE_URL}/v1/video_status.get`,
      {
        params: { video_id },
        headers: {
          "X-Api-Key": HEYGEN_API_KEY,
        },
      }
    );

    res.status(200).json({
      message: "Video status retrieved successfully!",
      data,
    });
  } catch (error) {
    console.error("Error fetching video status:", error);
    res.status(500).json({
      message: "Failed to fetch video status.",
      error: error.response?.data || error.message,
    });
  }
};
