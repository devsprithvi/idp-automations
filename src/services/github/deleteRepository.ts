import { Octokit } from "@octokit/rest";

/**
 * This script deletes a repository from the authenticated user's account.
 */
export async function deleteRepository() {
  console.log("Starting repository deletion...");

  const token = process.env.GITHUB_PAT;
  const repoName = process.env.REPO_NAME_TO_DELETE;
  const owner = process.env.GITHUB_OWNER;

  if (!token) {
    console.error("GITHUB_PAT secret is not set. Aborting.");
    process.exit(1);
  }
  if (!repoName) {
    console.error("REPO_NAME_TO_DELETE input is not set. Aborting.");
    process.exit(1);
  }

  console.log(`Deleting repository: ${repoName}`);

  const octokit = new Octokit({ auth: token });

  let repoOwner = owner;
  if (!repoOwner) {
    try {
      const userResponse = await octokit.rest.users.getAuthenticated();
      repoOwner = userResponse.data.login;
    } catch (error: any) {
      console.error(`ERROR: Failed to get authenticated user:`, error.message);
      process.exit(1);
    }
  }

  try {
    await octokit.rest.repos.delete({
      owner: repoOwner,
      repo: repoName,
    });

    console.log(`SUCCESS: Repository '${repoName}' has been deleted!`);

  } catch (error: any) {
    if (error.status === 404) {
      console.error(`ERROR: Repository '${repoName}' not found or you don't have permission to delete it.`);
    } else {
      console.error(`ERROR: Failed to delete repository:`, error.message);
    }
    process.exit(1);
  }

  console.log("...Repository deletion finished.");
}
