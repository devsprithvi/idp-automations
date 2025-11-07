import dotenv from 'dotenv';
import { createRepository } from '../services/github/createRepository.js';
import { deleteRepository } from '../services/github/deleteRepository.js';

dotenv.config();

async function test() {
  const testRepoName = process.env.NEW_REPO_NAME || `test-repo-${Date.now()}`;
  
  process.env.NEW_REPO_NAME = testRepoName;
  process.env.REPO_NAME_TO_DELETE = testRepoName;

  console.log("Creating repository...");
  await createRepository();
  
  console.log("\nWaiting 2 seconds...");
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log("\nDeleting repository...");
  await deleteRepository();
  
  console.log("\nTest completed!");
}

test();
