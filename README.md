Testing GitHub Actions Locally

This guide outlines how to test this project's GitHub Actions workflows on your local Windows machine before committing and pushing them to GitHub. This saves time and avoids cluttering your repository's commit history with test runs.

We use a command-line tool called act to run the workflows.

1. Setup & Installation

You only need to do this once.

Prerequisite: Docker Desktop

act works by running your workflows inside a Docker container that mimics the GitHub runners (like ubuntu-latest).

You must install Docker Desktop for Windows.

Before running act, Docker Desktop must be open and running in the background.

Install act

We will use the Chocolatey package manager to install act.

Open PowerShell as Administrator.

Run the following command:

choco install act-cli


2. Handling Secrets (Required)

Your workflows will fail locally without the required secrets. act does not have access to your repository's secrets on GitHub.

The solution is to create a local .secrets file.

In the root of this project, create a file named exactly .secrets

CRITICAL: Add this file to your .gitignore immediately so you never commit your secrets!

# .gitignore
.secrets


Add your secrets to the .secrets file in KEY=VALUE format. Your file should look like this:

# This is for 'act' to download actions (e.g., actions/checkout)
GITHUB_TOKEN=ghp_YourPersonalAccessToken

# This is for our custom scripts (e.g., createRepository.js)
AUTOMATION_PAT=ghp_YourPersonalAccessToken

# This is for workflow inputs, like the repository name
REPO_NAME=my-test-repo-from-act


Note: GITHUB_TOKEN and AUTOMATION_PAT can be the same Personal Access Token (Classic) with repo and workflow scopes. act specifically looks for GITHUB_TOKEN, and our script looks for AUTOMATION_PAT.

3. Fixing Workflow Inputs for Local Testing

Our workflows are triggered by workflow_dispatch, which expects user input (like repository_name). When running locally, this input is empty.

We must tell the workflow to use our .secrets value as a fallback.

Example (create-repository.yml):

Change this:

env:
  NEW_REPO_NAME: ${{ github.event.inputs.repository_name }}


To this:

env:
  NEW_REPO_NAME: ${{ github.event.inputs.repository_name || secrets.REPO_NAME }}


The || secrets.REPO_NAME tells it to use the REPO_NAME from your .secrets file if the GitHub input is missing.

4. How to Run Workflows Locally

With Docker running and your .secrets file created, you can now run your tests.

Open your terminal in the project root.

Use the act command, specifying the event and the job ID (-j).

Example: Running the create job

To run only the create job from the workflow_dispatch trigger:

act workflow_dispatch -j create


Example: Running the delete job

(Once it is fixed) you can run it with:

act workflow_dispatch -j delete


If you just run act workflow_dispatch, it will try to run all jobs in all workflows that respond to that event.