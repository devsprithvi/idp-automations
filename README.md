# IDP Automations

Repository automation tools for creating and deleting GitHub repositories.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your environment variables in `.env`:
   - `GITHUB_PAT`: Your GitHub Personal Access Token
   - `NEW_REPO_NAME`: Name for new repository creation
   - `REPO_NAME_TO_DELETE`: Name of repository to delete
   - `GITHUB_OWNER`: (Optional) GitHub username/organization

## Usage

### Create Repository
```bash
npm run create-repo
```

### Delete Repository
```bash
npm run delete-repo
```

### Repository Manager (Interactive)
```bash
# Create a repository
npm run repo-manager create

# Delete a repository
npm run repo-manager delete
```

## Environment Variables

- `GITHUB_PAT`: GitHub Personal Access Token (required)
- `NEW_REPO_NAME`: Repository name for creation
- `REPO_NAME_TO_DELETE`: Repository name for deletion
- `GITHUB_OWNER`: Repository owner (defaults to authenticated user)
- `OPERATION`: Default operation for repository manager (create/delete)

## Features

- ✅ Create new repositories
- ✅ Delete existing repositories
- ✅ Automatic user authentication
- ✅ Error handling and validation
- ✅ Environment-based configuration