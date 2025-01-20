const axios = require("axios");

// API key from environment variables
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

// Base API URL for Heygen
const HEYGEN_API_BASE_URL = "https://api.heygen.com";

/**
 * Controller to handle video generation and status retrieval.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.generateVideoController = async (req, res) => {
  const videoInputs = req.body;

  const payload = {
    video_inputs: videoInputs.video_inputs,
    dimension: videoInputs.dimension,
  };

  try {
    // Make API call to generate video
    const videoGenerationResponse = await axios.post(
      `${HEYGEN_API_BASE_URL}/v2/video/generate`,
      payload,
      {
        headers: {
          "X-Api-Key": HEYGEN_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const video_id = videoGenerationResponse.data.data.video_id;

    res.status(200).json({
      message: "Video generated and status retrieved successfully!",
      data: {
        video_id
      },
    });
  } catch (error) {
    console.error("Error generating video or fetching status:", error);
    res.status(500).json({
      message: "Failed to generate video or retrieve status.",
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
