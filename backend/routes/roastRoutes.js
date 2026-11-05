const express = require("express");
const router = express.Router();

const { generateText, generateRoast } = require("../services/aiService");
const { getGitHubAnalysis } = require("../services/githubService");

// Existing Groq connection test
router.get("/test", async (req, res) => {
  try {
    const roast = await generateText(
      "Roast a developer who has 16 GitHub repositories, zero stars, and mostly writes JavaScript."
    );

    res.status(200).json({
      success: true,
      roast,
    });
  } catch (error) {
    console.error("Groq error:", error.message);

    res.status(500).json({
      success: false,
      message: "AI generation failed",
    });
  }
});

// Generate a personalized GitHub roast
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // Step 1: Collect GitHub profile and repository evidence
    const githubData = await getGitHubAnalysis(username);

    // Step 2: Send that evidence to Groq
    const roast = await generateRoast(githubData);

    // Step 3: Return the roast
    res.status(200).json({
      success: true,
      username,
      roast,
    });

  } catch (error) {
    console.error("Roast generation error:", error.message);

    res.status(error.status || 500).json({
      success: false,
      message: "Could not generate GitHub roast",
    });
  }
});

module.exports = router;