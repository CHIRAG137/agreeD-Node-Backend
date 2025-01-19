const axios = require("axios");

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

// Controller to handle video generation
exports.generateVideoController = async (req, res) => {
  const videoInputs = req.body;
  console.log(videoInputs)
  const payload = {
    video_inputs: videoInputs.video_inputs,
    dimension: videoInputs.dimension,
  };

  try {
    const response = await axios.post(
      "https://api.heygen.com/v2/video/generate",
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
      data: response.data,
    });
  } catch (error) {
    console.error("Error generating video:", error);
    res.status(500).json({
      message: "Failed to generate video.",
      error: error.response?.data || error.message,
    });
  }
};
