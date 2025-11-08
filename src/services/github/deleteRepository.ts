import { Octokit } from "@octokit/rest";

async function deleteRepository() {
  const token = process.env.GITHUB_PAT;
  const repoName = process.env.REPO_NAME_TO_DELETE;

  if (!token || !repoName) {
    console.error("ERROR: Missing GITHUB_PAT or REPO_NAME_TO_DELETE");
    process.exit(1);
  }

  console.log(`Deleting repository: ${repoName}`);

  const octokit = new Octokit({ auth: token });

  try {
    const { data: user } = await octokit.rest.users.getAuthenticated();
    
    await octokit.rest.repos.delete({
      owner: user.login,
      repo: repoName,
    });

    console.log(`SUCCESS: Repository '${repoName}' deleted!`);
  } catch (error: any) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
  }
}

deleteRepository();
