# IDP Automations

A comprehensive guide for testing GitHub Actions workflows locally using `act`, enabling efficient development and debugging without cluttering your repository's commit history.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)

---

## Overview

This project provides infrastructure for testing GitHub Actions workflows on your local Windows machine before deployment. By leveraging the `act` CLI tool, you can validate workflows in a containerized environment that mimics GitHub's runners, significantly reducing development iteration time.

---

## Prerequisites

### Docker Desktop

`act` requires Docker to create containerized environments that simulate GitHub runners (e.g., `ubuntu-latest`).

1. Download and install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. Ensure Docker Desktop is running before executing any `act` commands
3. Verify installation:
   ```powershell
   docker --version
   ```

### Chocolatey Package Manager

Required for installing `act` on Windows. If not already installed, follow the [official Chocolatey installation guide](https://chocolatey.org/install).

---

## Installation

### Installing act

1. Open PowerShell as Administrator
2. Execute the following command:
   ```powershell
   choco install act-cli
   ```
3. Verify installation:
   ```powershell
   act --version
   ```

---

## Configuration

### Setting Up Secrets

GitHub Actions workflows often require secrets for authentication and configuration. Since `act` cannot access your repository's GitHub secrets, you must provide them locally.

#### Step 1: Create a `.secrets` File

In the project root directory, create a file named `.secrets`:

```bash
# GitHub token for act to download actions (e.g., actions/checkout@v4)
GITHUB_TOKEN=ghp_YourPersonalAccessToken

# Personal Access Token for custom automation scripts
AUTOMATION_PAT=ghp_YourPersonalAccessToken

# Workflow input variables
REPO_NAME=my-test-repo-from-act
```

#### Step 2: Secure Your Secrets

**CRITICAL:** Ensure `.secrets` is added to `.gitignore` to prevent accidental commits:

```gitignore
# Secrets file
.secrets
```

The `.gitignore` file in this repository already includes this entry.

#### Step 3: Generate Personal Access Tokens

Create a GitHub Personal Access Token (Classic) with the following scopes:
- `repo` (Full control of private repositories)
- `workflow` (Update GitHub Action workflows)

Generate tokens at: [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)

> **Note:** `GITHUB_TOKEN` and `AUTOMATION_PAT` can use the same token value.

---

### Adapting Workflows for Local Testing

Workflows triggered by `workflow_dispatch` expect user inputs that are unavailable during local execution. Modify your workflows to use fallback values from `.secrets`.

#### Example Modification

**Before:**
```yaml
env:
  NEW_REPO_NAME: ${{ github.event.inputs.repository_name }}
```

**After:**
```yaml
env:
  NEW_REPO_NAME: ${{ github.event.inputs.repository_name || secrets.REPO_NAME }}
```

The `||` operator provides a fallback to `secrets.REPO_NAME` when the GitHub input is empty.

---

## Usage

### Running Workflows Locally

Ensure Docker Desktop is running before executing any commands.

#### Basic Syntax

```powershell
act <event> -j <job-id>
```

#### Examples

**Run the `create` job:**
```powershell
act workflow_dispatch -j create
```

**Run the `delete` job:**
```powershell
act workflow_dispatch -j delete
```

**Run all jobs for an event:**
```powershell
act workflow_dispatch
```

> **Warning:** Running without specifying a job ID (`-j`) will execute all jobs in all workflows that respond to the specified event.

#### Common Options

- `--secret-file .secrets` - Explicitly specify the secrets file (default: `.secrets`)
- `--list` - List available workflows and jobs
- `--dryrun` - Show what would be run without executing
- `-v` - Verbose output for debugging

---

## Troubleshooting

### Docker Not Running

**Error:** `Cannot connect to the Docker daemon`

**Solution:** Ensure Docker Desktop is running before executing `act` commands.

### Missing Secrets

**Error:** Workflow fails with authentication errors

**Solution:** Verify your `.secrets` file exists and contains valid tokens with appropriate scopes.

### Workflow Not Found

**Error:** `could not find any workflows`

**Solution:** Ensure you're running the command from the project root directory where `.github/workflows/` exists.

### Token Permissions

**Error:** `Resource not accessible by integration`

**Solution:** Regenerate your Personal Access Token with `repo` and `workflow` scopes enabled.

---

## Security Best Practices

1. **Never commit** the `.secrets` file to version control
2. **Rotate tokens** regularly and immediately if exposed
3. **Use minimal scopes** required for your workflows
4. **Revoke unused tokens** from GitHub settings

---

## Additional Resources

- [act Documentation](https://github.com/nektos/act)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Desktop Documentation](https://docs.docker.com/desktop/)

---

## License

[Specify your license here]

## Contributing

[Add contribution guidelines if applicable]
