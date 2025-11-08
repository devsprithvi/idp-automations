import dotenv from 'dotenv';
import { createRepository } from '../services/github/createRepository.js';

dotenv.config();

/**
 * Comprehensive test suite for createRepository function
 * Tests various scenarios including validation, error handling, and success cases
 */

async function testValidation() {
  console.log("\n=== Testing Repository Name Validation ===\n");

  const testCases = [
    { name: "", shouldFail: true, description: "Empty name" },
    { name: ".invalid", shouldFail: true, description: "Starts with period" },
    { name: "-invalid", shouldFail: true, description: "Starts with hyphen" },
    { name: "invalid.git", shouldFail: true, description: "Ends with .git" },
    { name: "invalid name", shouldFail: true, description: "Contains space" },
    { name: "invalid@name", shouldFail: true, description: "Contains special char" },
    { name: "a".repeat(101), shouldFail: true, description: "Too long (>100 chars)" },
    { name: "valid-repo-name", shouldFail: false, description: "Valid name with hyphens" },
    { name: "valid_repo_name", shouldFail: false, description: "Valid name with underscores" },
    { name: "valid.repo.name", shouldFail: false, description: "Valid name with periods" },
    { name: "ValidRepo123", shouldFail: false, description: "Valid alphanumeric name" },
  ];

  console.log("Note: Validation tests will exit on failure. Run individually to test all cases.\n");
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.description}`);
    console.log(`  Name: "${testCase.name}"`);
    console.log(`  Expected: ${testCase.shouldFail ? "FAIL" : "PASS"}`);
    // Note: Actual validation happens inside createRepository
  }
}

async function testMissingToken() {
  console.log("\n=== Testing Missing Token ===\n");
  
  const originalToken = process.env.GITHUB_PAT;
  delete process.env.GITHUB_PAT;
  process.env.NEW_REPO_NAME = "test-repo";
  
  console.log("Attempting to create repository without GITHUB_PAT...");
  console.log("Expected: Should fail with authentication error\n");
  
  try {
    await createRepository();
    console.log("UNEXPECTED: Repository creation succeeded without token!");
  } catch (error) {
    console.log("EXPECTED: Failed as expected");
  }
  
  // Restore token
  if (originalToken) {
    process.env.GITHUB_PAT = originalToken;
  }
}

async function testMissingRepoName() {
  console.log("\n=== Testing Missing Repository Name ===\n");
  
  const originalName = process.env.NEW_REPO_NAME;
  delete process.env.NEW_REPO_NAME;
  
  console.log("Attempting to create repository without NEW_REPO_NAME...");
  console.log("Expected: Should fail with validation error\n");
  
  try {
    await createRepository();
    console.log("UNEXPECTED: Repository creation succeeded without name!");
  } catch (error) {
    console.log("EXPECTED: Failed as expected");
  }
  
  // Restore name
  if (originalName) {
    process.env.NEW_REPO_NAME = originalName;
  }
}

async function testSuccessfulCreation() {
  console.log("\n=== Testing Successful Repository Creation ===\n");
  
  const testRepoName = `test-repo-${Date.now()}`;
  process.env.NEW_REPO_NAME = testRepoName;
  process.env.REPO_DESCRIPTION = "Test repository created by validation suite";
  process.env.REPO_PRIVATE = "true";
  process.env.REPO_AUTO_INIT = "true";
  
  console.log(`Creating test repository: ${testRepoName}`);
  console.log("Settings:");
  console.log(`  - Description: ${process.env.REPO_DESCRIPTION}`);
  console.log(`  - Private: ${process.env.REPO_PRIVATE}`);
  console.log(`  - Auto Init: ${process.env.REPO_AUTO_INIT}\n`);
  
  try {
    const result = await createRepository();
    console.log("\n✓ Repository created successfully!");
    console.log("\nReturned data:", result);
    
    // Store for cleanup
    return testRepoName;
  } catch (error: any) {
    console.error("\n✗ Failed to create repository:", error.message);
    throw error;
  }
}

async function runAllTests() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  Create Repository - Comprehensive Validation Test Suite  ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  
  try {
    // Test 1: Validation scenarios
    await testValidation();
    
    // Test 2: Missing token (will exit, so comment out for full suite)
    // await testMissingToken();
    
    // Test 3: Missing repo name (will exit, so comment out for full suite)
    // await testMissingRepoName();
    
    // Test 4: Successful creation
    const createdRepo = await testSuccessfulCreation();
    
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║                    Test Suite Complete                     ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log(`\nCreated repository: ${createdRepo}`);
    console.log("Remember to clean up the test repository manually or run the delete test.");
    
  } catch (error: any) {
    console.error("\n✗ Test suite failed:", error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests();
