import { Octokit } from "@octokit/rest";

async function createRepository() {
  const token = process.env.GITHUB_PAT;
  const repoName = process.env.NEW_REPO_NAME;

  if (!token || !repoName) {
    console.error("ERROR: Missing GITHUB_PAT or NEW_REPO_NAME");
    process.exit(1);
  }

  console.log(`Creating repository: ${repoName}`);

  const octokit = new Octokit({ auth: token });

  try {
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`Authenticated as: ${user.login}`);

    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      private: true,
      auto_init: true,
    });

    console.log(`SUCCESS: Repository created!`);
    console.log(`URL: ${repo.html_url}`);
  } catch (error: any) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
  }
}

createRepository();
