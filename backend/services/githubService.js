const GITHUB_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2026-03-10",
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
};

// Reusable function to make GitHub API requests
// async function githubRequest(url) {
//   const response = await fetch(url, {
//     method: "GET",
//     headers: GITHUB_HEADERS,
//   });

//   if (!response.ok) {
//     const error = new Error("GitHub API request failed");
//     error.status = response.status;
//     throw error;
//   }

//   return response.json();
// }
async function githubRequest(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: GITHUB_HEADERS,
  });

  if (!response.ok) {
    const errorData = await response.text();

    console.error("GitHub API Error:", {
      status: response.status,
      url,
      message: errorData,
      rateLimitRemaining: response.headers.get("x-ratelimit-remaining"),
    });
    const resetAt = response.headers.get("x-ratelimit-reset");

console.error("Rate limit resets at:", 
  new Date(Number(resetAt) * 1000).toLocaleString()
);

    const error = new Error(
      `GitHub API failed with status ${response.status}`
    );

    error.status = response.status;
    throw error;
  }

  return response.json();
}

// Fetch GitHub user profile
async function getUserProfile(username) {
  return githubRequest(`https://api.github.com/users/${username}`);
}

// Fetch public repositories
async function getUserRepos(username) {
  return githubRequest(
    `https://api.github.com/users/${username}/repos?per_page=100`
  );
}

// Calculate repository statistics
function getRepoStats(repos) {
  const totalStars = repos.reduce(
    (total, repo) => total + repo.stargazers_count,
    0
  );

  const totalForks = repos.reduce(
    (total, repo) => total + repo.forks_count,
    0
  );

  const originalRepos = repos.filter(repo => !repo.fork).length;
  const forkedRepos = repos.filter(repo => repo.fork).length;

  const languages = {};

  repos.forEach(repo => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });

  const mostUsedLanguage =
    Object.entries(languages)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    totalRepos: repos.length,
    totalStars,
    totalForks,
    originalRepos,
    forkedRepos,
    mostUsedLanguage,
  };
}

// Fetch and decode a repository README
// async function getRepoReadme(username, repoName) {
//   try {
//     const readmeData = await githubRequest(
//       `https://api.github.com/repos/${username}/${repoName}/readme`
//     );

//     return Buffer.from(readmeData.content, "base64").toString("utf-8");
//   } catch (error) {
//     // A missing README should not stop the entire analysis.
//     if (error.status === 404) {
//       return null;
//     }

//     throw error;
//   }
// }
async function getRepoReadme(username, repoName) {
  try {
    const readmeData = await githubRequest(
      `https://api.github.com/repos/${username}/${repoName}/readme`
    );

    return Buffer.from(
      readmeData.content,
      "base64"
    ).toString("utf-8");

  } catch (error) {
    // README missing or repository inaccessible
    if (error.status === 404 || error.status === 403) {
      return null;
    }

    // Unexpected errors should still be reported
    throw error;
  }
}

// Select repositories and attach their READMEs
async function getSelectedRepos(username, repos) {
  const bestRepos = [...repos]
    .sort(
      (a, b) =>
        b.stargazers_count - a.stargazers_count ||
        b.forks_count - a.forks_count ||
        Number(Boolean(b.description)) - Number(Boolean(a.description)) ||
        new Date(b.updated_at) - new Date(a.updated_at)
    )
    .slice(0, 5);

  const bestIds = new Set(bestRepos.map(repo => repo.id));

  const worstRepos = repos
    .filter(repo => !bestIds.has(repo.id))
    .sort(
      (a, b) =>
        a.stargazers_count - b.stargazers_count ||
        a.forks_count - b.forks_count ||
        Number(Boolean(a.description)) - Number(Boolean(b.description)) ||
        new Date(a.updated_at) - new Date(b.updated_at)
    )
    .slice(0, 5);

  const addReadmes = async repositories => {
    return Promise.all(
      repositories.map(async repo => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updatedAt: repo.updated_at,
        url: repo.html_url,
        readme: await getRepoReadme(username, repo.name),
      }))
    );
  };

  const [best, worst] = await Promise.all([
    addReadmes(bestRepos),
    addReadmes(worstRepos),
  ]);

  return {
    bestRepos: best,
    worstRepos: worst,
  };
}

// Collect everything needed for a GitHub profile analysis
async function getGitHubAnalysis(username) {
  const [profile, repos] = await Promise.all([
    getUserProfile(username),
    getUserRepos(username),
  ]);

  const stats = getRepoStats(repos);
  const selectedRepos = await getSelectedRepos(username, repos);

  return {
    profile: {
      username: profile.login,
      name: profile.name,
      bio: profile.bio,
      followers: profile.followers,
      following: profile.following,
      publicRepos: profile.public_repos,
      createdAt: profile.created_at,
      profileUrl: profile.html_url,
    },
    repositoryStats: stats,
    ...selectedRepos,
  };
}

module.exports = {
  getUserProfile,
  getUserRepos,
  getRepoStats,
  getRepoReadme,
  getSelectedRepos,
  getGitHubAnalysis,
};