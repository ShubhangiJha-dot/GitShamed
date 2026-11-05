const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  getUserRepos,
  getRepoStats,
  getRepoReadme,
  getSelectedRepos,
} = require("../services/githubService");

// GET GitHub user profile
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const userData = await getUserProfile(username);

    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error(error.message);

    res.status(error.status || 500).json({
      success: false,
      message: "Could not fetch GitHub user profile",
    });
  }
});

// GET GitHub user repositories
router.get("/:username/repos", async (req, res) => {
  try {
    const { username } = req.params;
    const repos = await getUserRepos(username);

    res.status(200).json({
      success: true,
      count: repos.length,
      data: repos,
    });
  } catch (error) {
    console.error(error.message);

    res.status(error.status || 500).json({
      success: false,
      message: "Could not fetch repositories",
    });
  }
});

// GET GitHub repository statistics
router.get("/:username/stats", async (req, res) => {
  try {
    const { username } = req.params;
    const repos = await getUserRepos(username);
    const stats = getRepoStats(repos);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error(error.message);

    res.status(error.status || 500).json({
      success: false,
      message: "Could not fetch repository statistics",
    });
  }
});

// GET a repository's README
router.get("/:username/repos/:repo/readme", async (req, res) => {
  try {
    const { username, repo } = req.params;
    const readme = await getRepoReadme(username, repo);

    if (!readme) {
      return res.status(404).json({
        success: false,
        message: "README not found",
      });
    }

    res.status(200).json({
      success: true,
      repo,
      readme,
    });
  } catch (error) {
    console.error(error.message);

    res.status(error.status || 500).json({
      success: false,
      message: "Could not fetch README",
    });
  }
});

// GET 5 best and 5 weakest repositories with READMEs
router.get("/:username/selected-repos", async (req, res) => {
  try {
    const { username } = req.params;

    const repos = await getUserRepos(username);
    const selectedRepos = await getSelectedRepos(username, repos);

    res.status(200).json({
      success: true,
      data: selectedRepos,
    });
  } catch (error) {
    console.error(error.message);

    res.status(error.status || 500).json({
      success: false,
      message: "Could not fetch selected repositories",
    });
  }
});

module.exports = router;