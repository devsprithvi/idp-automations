import { Octokit } from "@octokit/rest";

/**
 * This script creates a new repository on the authenticated user's account.
 */
async function createRepository() {
  console.log("Starting repository creation...");

  // 1. Get Token and Repo Name from environment variables
  const token = process.env.GITHUB_PAT;
  const repoName = process.env.NEW_REPO_NAME;

  if (!token) {
    console.error("GITHUB_PAT secret is not set. Aborting.");
    process.exit(1);
  }
  if (!repoName) {
    console.error("NEW_REPO_NAME input is not set. Aborting.");
    process.exit(1);
  }

  console.log(`Creating repository: ${repoName}`);

  // 2. Initialize Octokit
  const octokit = new Octokit({ auth: token });

  // 3. Create the repository for the user
  try {
    const response = await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      description: 'Repository scaffolded by IDP automation',
      private: true, // Defaulting to private
    });

    console.log(`SUCCESS: Created repository!`);
    console.log(`URL: ${response.data.html_url}`);

  } catch (error: any) {
    console.error(`ERROR: Failed to create repository:`, error.message);
    process.exit(1);
  }

  console.log("...Repository creation finished.");
}

// Run the main function
createRepository();