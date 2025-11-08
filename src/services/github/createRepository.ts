import { Octokit } from "@octokit/rest";

/**
 * Validates repository name according to GitHub rules
 */
function validateRepositoryName(name: string): { valid: boolean; error?: string } {
  // GitHub repository name rules:
  // - Can contain alphanumeric characters, hyphens, underscores, and periods
  // - Cannot start with a period or hyphen
  // - Cannot end with .git
  // - Maximum 100 characters
  
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Repository name cannot be empty" };
  }

  if (name.length > 100) {
    return { valid: false, error: "Repository name cannot exceed 100 characters" };
  }

  if (name.startsWith('.') || name.startsWith('-')) {
    return { valid: false, error: "Repository name cannot start with '.' or '-'" };
  }

  if (name.endsWith('.git')) {
    return { valid: false, error: "Repository name cannot end with '.git'" };
  }

  const validPattern = /^[a-zA-Z0-9._-]+$/;
  if (!validPattern.test(name)) {
    return { valid: false, error: "Repository name can only contain alphanumeric characters, hyphens, underscores, and periods" };
  }

  return { valid: true };
}

/**
 * Creates a new repository on the authenticated user's account with comprehensive error handling
 */
export async function createRepository() {
  console.log("Starting repository creation...");

  const token = process.env.GITHUB_PAT;
  const repoName = process.env.NEW_REPO_NAME;

  // Validate environment variables
  if (!token) {
    console.error("ERROR: GITHUB_PAT secret is not set. Aborting.");
    process.exit(1);
  }
  
  if (!repoName) {
    console.error("ERROR: NEW_REPO_NAME input is not set. Aborting.");
    process.exit(1);
  }

  // Validate repository name
  const validation = validateRepositoryName(repoName);
  if (!validation.valid) {
    console.error(`ERROR: Invalid repository name: ${validation.error}`);
    process.exit(1);
  }

  console.log(`Creating repository: ${repoName}`);

  const octokit = new Octokit({ auth: token });

  try {
    // First, verify authentication
    let authenticatedUser;
    try {
      const userResponse = await octokit.rest.users.getAuthenticated();
      authenticatedUser = userResponse.data.login;
      console.log(`Authenticated as: ${authenticatedUser}`);
    } catch (authError: any) {
      console.error(`ERROR: Authentication failed. Please check your GITHUB_PAT token.`);
      console.error(`Details: ${authError.message}`);
      process.exit(1);
    }

    // Check if repository already exists
    try {
      await octokit.rest.repos.get({
        owner: authenticatedUser,
        repo: repoName,
      });
      console.error(`ERROR: Repository '${repoName}' already exists for user '${authenticatedUser}'.`);
      process.exit(1);
    } catch (error: any) {
      // 404 is expected - repository doesn't exist, which is what we want
      if (error.status !== 404) {
        console.error(`ERROR: Failed to check if repository exists: ${error.message}`);
        process.exit(1);
      }
    }

    // Build repository options
    const repoOptions: {
      name: string;
      description: string;
      private: boolean;
      auto_init: boolean;
      delete_branch_on_merge: boolean;
      allow_squash_merge: boolean;
      allow_merge_commit: boolean;
      allow_rebase_merge: boolean;
      gitignore_template?: string;
      license_template?: string;
    } = {
      name: repoName,
      description: process.env.REPO_DESCRIPTION || 'Repository scaffolded by IDP automation',
      private: process.env.REPO_PRIVATE !== 'false', // Default to private
      auto_init: process.env.REPO_AUTO_INIT === 'true', // Default to false
      delete_branch_on_merge: true, // Best practice
      allow_squash_merge: true,
      allow_merge_commit: true,
      allow_rebase_merge: true,
    };

    // Optional: Add gitignore template
    if (process.env.REPO_GITIGNORE_TEMPLATE) {
      repoOptions.gitignore_template = process.env.REPO_GITIGNORE_TEMPLATE;
    }

    // Optional: Add license template
    if (process.env.REPO_LICENSE_TEMPLATE) {
      repoOptions.license_template = process.env.REPO_LICENSE_TEMPLATE;
    }

    console.log(`Repository settings:`, {
      name: repoOptions.name,
      private: repoOptions.private,
      auto_init: repoOptions.auto_init,
    });

    // Create the repository
    const response = await octokit.rest.repos.createForAuthenticatedUser(repoOptions);

    console.log(`SUCCESS: Repository created successfully!`);
    console.log(`Repository details:`);
    console.log(`  - Name: ${response.data.name}`);
    console.log(`  - Owner: ${response.data.owner?.login}`);
    console.log(`  - URL: ${response.data.html_url}`);
    console.log(`  - Clone URL (HTTPS): ${response.data.clone_url}`);
    console.log(`  - Clone URL (SSH): ${response.data.ssh_url}`);
    console.log(`  - Private: ${response.data.private}`);
    console.log(`  - Default Branch: ${response.data.default_branch}`);

    return {
      success: true,
      repository: {
        name: response.data.name,
        owner: response.data.owner?.login,
        url: response.data.html_url,
        cloneUrl: response.data.clone_url,
        sshUrl: response.data.ssh_url,
        private: response.data.private,
        defaultBranch: response.data.default_branch,
      },
    };

  } catch (error: any) {
    // Handle specific error cases
    if (error.status === 401) {
      console.error(`ERROR: Authentication failed. Your GITHUB_PAT token may be invalid or expired.`);
    } else if (error.status === 403) {
      console.error(`ERROR: Permission denied. Your token may not have the required 'repo' scope.`);
    } else if (error.status === 422) {
      console.error(`ERROR: Validation failed. The repository name may be invalid or already exists.`);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err: any) => {
          console.error(`  - ${err.message}`);
        });
      }
    } else {
      console.error(`ERROR: Failed to create repository: ${error.message}`);
      if (error.response?.data?.message) {
        console.error(`  GitHub API message: ${error.response.data.message}`);
      }
    }
    process.exit(1);
  } finally {
    console.log("...Repository creation finished.");
  }
}
