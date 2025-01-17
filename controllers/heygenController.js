const axios = require("axios");

const HEYGEN_API_KEY =process.env.HEYGEN_API_KEY

// Controller to handle video generation
exports.generateVideoController = async (req, res) => {
  const videoInputs = req.body.video_inputs || [
    {
      character: {
        type: "avatar",
        avatar_id: "Angela-inTshirt-20220820",
        avatar_style: "normal",
      },
      voice: {
        type: "text",
        input_text: "Welcome to the HeyGen API!",
        voice_id: "1bd001e7e50f421d891986aad5158bc8",
        speed: 1.1,
      },
    },
  ];

  const dimension = req.body.dimension || {
    width: 1280,
    height: 720,
  };

  const payload = {
    video_inputs: videoInputs,
    dimension: dimension,
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
